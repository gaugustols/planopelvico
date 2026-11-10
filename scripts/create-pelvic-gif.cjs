"use strict";
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { createRequire } = require("node:module");
const root = path.resolve(__dirname, "..");
const tooling = createRequire(path.join(root, ".pelvic-gif.tmp/package.json"));
const { createCanvas, loadImage } = tooling("@napi-rs/canvas");
const { GIFEncoder, quantize, applyPalette } = tooling("gifenc");

async function main() {
  const width = 720;
  const height = 720;
  const frameCount = 60;
  const delay = 60;
  const center = { x: width * 0.503, y: height * 0.835 };
  const region = { x: Math.floor(center.x - 138), y: Math.floor(center.y - 86), width: 276, height: 164 };
  const source = await loadImage(path.join(root, "assets/images/assoalho-pelvico-base.png"));
  assert.equal(source.width, source.height, "Square source image");
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(source, 0, 0, width, height);
  const fullBase = ctx.getImageData(0, 0, width, height).data;
  const patchBase = ctx.getImageData(region.x, region.y, region.width, region.height).data;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  // Moving light is a graphic metaphor; the photographed body and anatomy remain fixed.
  const patchCanvas = createCanvas(region.width, region.height);
  const patchCtx = patchCanvas.getContext("2d");
  const cx = center.x - region.x;
  const cy = center.y - region.y;
  function renderPatch(progress) {
    const envelope = Math.sin(Math.PI * progress) ** 2;
    const original = patchCtx.createImageData(region.width, region.height);
    original.data.set(patchBase);
    patchCtx.putImageData(original, 0, 0);
    if (envelope < 0.0001) return new Uint8ClampedArray(patchBase);

    // Clearly visible but soft mint halo, fixed around the existing pelvic-floor overlay.
    patchCtx.save();
    patchCtx.translate(cx, cy - 2);
    patchCtx.scale(1, 0.52);
    const glow = patchCtx.createRadialGradient(0, 0, 3, 0, 0, 106);
    glow.addColorStop(0, "rgba(119,255,225," + (0.32 * envelope) + ")");
    glow.addColorStop(0.45, "rgba(82,231,207," + (0.21 * envelope) + ")");
    glow.addColorStop(1, "rgba(82,231,207,0)");
    patchCtx.fillStyle = glow;
    patchCtx.beginPath();patchCtx.arc(0,0,106,0,Math.PI*2);patchCtx.fill();
    patchCtx.restore();

    // Two expanding light rings supply an unmistakable movement cue.
    for (const offset of [0, 0.5]) {
      const phase = (progress + offset) % 1;
      const alpha = Math.sin(Math.PI * phase) ** 2 * envelope * 0.90;
      const rx = 34 + phase * 74;
      const ry = 13 + phase * 34;
      patchCtx.save();
      patchCtx.strokeStyle = "rgba(181,255,237," + alpha + ")";
      patchCtx.shadowColor = "rgba(78,238,205," + alpha + ")";
      patchCtx.shadowBlur = 10;
      patchCtx.lineWidth = 2.5;
      patchCtx.beginPath();patchCtx.ellipse(cx,cy-1,rx,ry,0,0,Math.PI*2);patchCtx.stroke();
      patchCtx.restore();
    }

    // A luminous sweep follows the conceptual sling; its shape never contracts.
    patchCtx.save();
    patchCtx.shadowColor = "rgba(80,245,211," + envelope + ")";
    patchCtx.shadowBlur = 14;
    patchCtx.strokeStyle = "rgba(199,255,241," + (0.85 * envelope) + ")";
    patchCtx.lineWidth = 3;
    patchCtx.beginPath();
    patchCtx.moveTo(cx-50,cy-14);
    patchCtx.quadraticCurveTo(cx,cy+16,cx+50,cy-14);
    patchCtx.stroke();
    patchCtx.restore();
    for (const offset of [0, 1/3, 2/3]) {
      const phase = (progress + offset) % 1;
      const alpha = Math.sin(Math.PI * phase) ** 2 * envelope;
      const x = cx - 50 + 100 * phase;
      const y = cy - 14 + 60 * phase * (1 - phase);
      patchCtx.save();
      patchCtx.fillStyle = "rgba(226,255,247," + alpha + ")";
      patchCtx.shadowColor = "rgba(65,245,209," + alpha + ")";
      patchCtx.shadowBlur = 12;
      patchCtx.beginPath();patchCtx.arc(x,y,4,0,Math.PI*2);patchCtx.fill();
      patchCtx.restore();
    }
    return patchCtx.getImageData(0,0,region.width,region.height).data;
  }

  const peakPatch = renderPatch(0.5);
  const samples = new Uint8Array(fullBase.length + peakPatch.length);
  samples.set(fullBase);
  samples.set(peakPatch, fullBase.length);
  const colors = quantize(samples, 255, { format: "rgb565" });
  const palette = [[0, 0, 0], ...colors]; // Index 0 is reserved for delta-frame transparency.
  // Error diffusion keeps photographic gradients smooth within GIF's 256-color limit.
  function ditherPhoto(rgba, w, h, colorTable) {
    const output = new Uint8Array(w * h);
    const cache = new Int16Array(65536).fill(-1);
    let current = new Float32Array((w + 2) * 3);
    let next = new Float32Array((w + 2) * 3);
    for (let y = 0; y < h; y++) {
      const direction = y % 2 === 0 ? 1 : -1;
      for (let step = 0; step < w; step++) {
        const x = direction === 1 ? step : w - 1 - step;
        const sourceIndex = (y * w + x) * 4;
        const errorIndex = (x + 1) * 3;
        const rgb = [0, 1, 2].map(c => clamp(rgba[sourceIndex + c] + current[errorIndex + c], 0, 255));
        const key = ((Math.round(rgb[0]) >> 3) << 11) | ((Math.round(rgb[1]) >> 2) << 5) | (Math.round(rgb[2]) >> 3);
        let best = cache[key];
        if (best < 0) {
          let minimum = Infinity;
          for (let c = 0; c < colorTable.length; c++) {
            const candidate = colorTable[c];
            const distance = (rgb[0] - candidate[0]) ** 2 + (rgb[1] - candidate[1]) ** 2 + (rgb[2] - candidate[2]) ** 2;
            if (distance < minimum) { minimum = distance; best = c; }
          }
          cache[key] = best;
        }
        output[y * w + x] = best;
        for (let c = 0; c < 3; c++) {
          const error = rgb[c] - colorTable[best][c];
          current[errorIndex + direction * 3 + c] += error * 7 / 16;
          next[errorIndex - direction * 3 + c] += error * 3 / 16;
          next[errorIndex + c] += error * 5 / 16;
          next[errorIndex + direction * 3 + c] += error / 16;
        }
      }
      current = next;
      next = new Float32Array((w + 2) * 3);
    }
    return output;
  }
  const initial = ditherPhoto(fullBase, width, height, colors);
  for (let i = 0; i < initial.length; i++) initial[i]++;
  const gif = GIFEncoder();
  gif.writeFrame(initial, width, height, { palette, delay, repeat: 0, dispose: 1 });

  let changedPixels = 0;
  const previous = new Uint8Array(initial);
  for (let f = 1; f < frameCount; f++) {
    const patch = renderPatch(f / frameCount);
    const indexed = applyPalette(patch, colors);
    const delta = new Uint8Array(width * height);
    for (let y = 0; y < region.height; y++) {
      for (let x = 0; x < region.width; x++) {
        const patchIndex = y * region.width + x;
        const outputIndex = (region.y + y) * width + region.x + x;
        const rgbaIndex = patchIndex * 4;
        const modified = patch[rgbaIndex] !== patchBase[rgbaIndex] || patch[rgbaIndex + 1] !== patchBase[rgbaIndex + 1] || patch[rgbaIndex + 2] !== patchBase[rgbaIndex + 2];
        const nextIndex = modified ? indexed[patchIndex] + 1 : initial[outputIndex];
        if (nextIndex !== previous[outputIndex]) delta[outputIndex] = nextIndex;
        previous[outputIndex] = nextIndex;
        if (f === frameCount / 2 && nextIndex !== initial[outputIndex]) changedPixels++;
      }
    }
    gif.writeFrame(delta, width, height, { delay, transparent: true, transparentIndex: 0, dispose: 1 });
  }
  gif.finish();
  const output = Buffer.from(gif.bytes());
  assert.equal(output.subarray(0, 6).toString(), "GIF89a");
  assert.equal(output[output.length - 1], 0x3b);
  assert.ok(output.includes(Buffer.from("NETSCAPE2.0")), "Continuous loop extension");
  assert.ok(changedPixels > 8000, "The pelvic-floor highlight visibly changes");
  assert.ok(output.length < 2 * 1024 * 1024, "Web-friendly GIF under 2 MB");

  const peak = ctx.createImageData(region.width, region.height);
  peak.data.set(peakPatch);
  ctx.putImageData(peak, region.x, region.y);
  const gifPath = path.join(root, "assets/images/assoalho-pelvico-pulsante-v2.gif");
  const posterPath = path.join(root, "assets/images/assoalho-pelvico-poster-v2.jpg");
  fs.writeFileSync(gifPath, output);
  fs.writeFileSync(posterPath, canvas.toBuffer("image/jpeg"));
  const metadata = {
    width, height, frameCount, delayMs: delay,
    durationSeconds: frameCount * delay / 1000,
    loop: "infinite", bytes: output.length,
    animation: "Visible mint light waves and moving highlights; fixed anatomy and static background",
    region, changedPixelsAtPeak: changedPixels
  };
  fs.writeFileSync(path.join(root, ".pelvic-gif.tmp/animation-metadata.json"), JSON.stringify(metadata, null, 2));
  console.log(JSON.stringify(metadata));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
