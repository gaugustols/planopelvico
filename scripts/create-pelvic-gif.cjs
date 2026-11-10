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
  const frameCount = 40;
  const delay = 80;
  const center = { x: width * 0.503, y: height * 0.835 };
  const region = { x: Math.floor(center.x - 92), y: Math.floor(center.y - 58), width: 184, height: 116 };
  const source = await loadImage(path.join(root, "assets/images/assoalho-pelvico-base.png"));
  assert.equal(source.width, source.height, "Square source image");
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(source, 0, 0, width, height);
  const fullBase = ctx.getImageData(0, 0, width, height).data;
  const patchBase = ctx.getImageData(region.x, region.y, region.width, region.height).data;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  // Light changes only: the anatomy, person, clothing and muscle shape do not move.
  function renderPatch(wave) {
    const rgba = new Uint8ClampedArray(patchBase);
    for (let y = 0; y < region.height; y++) {
      for (let x = 0; x < region.width; x++) {
        const i = (y * region.width + x) * 4;
        const dx = region.x + x - center.x;
        const dy = region.y + y - center.y;
        const radial = (dx / 73) ** 2 + (dy / 34) ** 2;
        if (radial >= 1) continue;
        const softness = (1 - radial) ** 2;
        const cyan = clamp((Math.min(patchBase[i + 1], patchBase[i + 2]) - patchBase[i] - 7) / 48, 0, 1);
        const amount = wave * softness * (0.10 + cyan * 0.56);
        const target = [190, 255, 246];
        for (let c = 0; c < 3; c++) rgba[i + c] = Math.round(patchBase[i + c] * (1 - amount) + target[c] * amount);
      }
    }
    return rgba;
  }

  const peakPatch = renderPatch(1);
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
  for (let f = 1; f < frameCount; f++) {
    const wave = (1 - Math.cos((Math.PI * 2 * f) / frameCount)) / 2;
    const patch = renderPatch(wave);
    const indexed = applyPalette(patch, colors);
    const delta = new Uint8Array(width * height);
    for (let y = 0; y < region.height; y++) {
      for (let x = 0; x < region.width; x++) {
        const patchIndex = y * region.width + x;
        const outputIndex = (region.y + y) * width + region.x + x;
        const rgbaIndex = patchIndex * 4;
        const modified = patch[rgbaIndex] !== patchBase[rgbaIndex] || patch[rgbaIndex + 1] !== patchBase[rgbaIndex + 1] || patch[rgbaIndex + 2] !== patchBase[rgbaIndex + 2];
        delta[outputIndex] = modified ? indexed[patchIndex] + 1 : initial[outputIndex];
        if (f === frameCount / 2 && delta[outputIndex] !== initial[outputIndex]) changedPixels++;
      }
    }
    gif.writeFrame(delta, width, height, { delay, transparent: true, transparentIndex: 0, dispose: 1 });
  }
  gif.finish();
  const output = Buffer.from(gif.bytes());
  assert.equal(output.subarray(0, 6).toString(), "GIF89a");
  assert.equal(output[output.length - 1], 0x3b);
  assert.ok(output.includes(Buffer.from("NETSCAPE2.0")), "Continuous loop extension");
  assert.ok(changedPixels > 100, "The pelvic-floor highlight visibly changes");
  assert.ok(output.length < 2 * 1024 * 1024, "Web-friendly GIF under 2 MB");

  const peak = ctx.createImageData(region.width, region.height);
  peak.data.set(peakPatch);
  ctx.putImageData(peak, region.x, region.y);
  const gifPath = path.join(root, "assets/images/assoalho-pelvico-pulsante.gif");
  const posterPath = path.join(root, "assets/images/assoalho-pelvico-poster.jpg");
  fs.writeFileSync(gifPath, output);
  fs.writeFileSync(posterPath, canvas.toBuffer("image/jpeg"));
  const metadata = {
    width, height, frameCount, delayMs: delay,
    durationSeconds: frameCount * delay / 1000,
    loop: "infinite", bytes: output.length,
    animation: "Local light pulse only; fixed anatomy and static background",
    region, changedPixelsAtPeak: changedPixels
  };
  fs.writeFileSync(path.join(root, ".pelvic-gif.tmp/animation-metadata.json"), JSON.stringify(metadata, null, 2));
  console.log(JSON.stringify(metadata));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
