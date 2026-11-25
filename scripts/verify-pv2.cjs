"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "pv2/index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "pv2/style.css"), "utf8");
const approved = JSON.parse(fs.readFileSync(path.join(root, "tests/fixtures/pv2-approved-copy.json"), "utf8"));
const contract = JSON.parse(fs.readFileSync(path.join(root, "tests/fixtures/pv2-functional-contract.json"), "utf8"));
// Only the aria-hidden, decorative orbit may repeat the already-existing guarantee.
const copyHtml = html.replace(/<svg\b[^>]*data-decorative="guarantee-orbit"[\s\S]*?<\/svg>/g, "");
const copy = copyHtml.split(/<[^>]*>/g).map(text => text.trim()).filter(Boolean).join(" ").replace(/\s+/g, " ");
assert.equal(copy, approved.join(" ").replace(/\s+/g, " "), "All original PV2 copy stays identical");
assert.ok(!html.includes("Para quem já calculou quantos minutos aguenta em pé até o próximo banheiro."));
console.log("PASS: the entire approved PV2 copy and removed hero sentence stay preserved");

const extract = expression => [...html.matchAll(expression)].map(match => match[1] || match[0]);
assert.deepEqual(extract(/<section\b[^>]*id="([^"]+)"/g), contract.sections);
assert.deepEqual(extract(/<a\b[^>]*href="([^"]+)"/g), contract.links);
assert.deepEqual(extract(/<input\b[^>]*>/g), contract.inputs);
assert.deepEqual(extract(/<button\b[^>]*>/g), contract.buttons);
assert.deepEqual(extract(/<details\b[^>]*>/g), contract.details);
const jsHash = crypto.createHash("sha256").update(fs.readFileSync(path.join(root, "pv2/pv2.js"), "utf8").replace(/\r\n/g, "\n")).digest("hex");
assert.equal(jsHash, contract.jsSha256, "Checklist, calculator and sticky behavior are untouched");
const ids = extract(/\bid="([^"]+)"/g);
assert.equal(ids.length, new Set(ids).size);
for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(target), "Valid anchor: " + target);
assert.ok(!/<form\b/.test(html), "No email form or new data collection");
assert.ok(!/INVITE ONLY|WAITING LIST|Batch 003|Zero spam/.test(html), "No foreign offer text");
assert.ok(html.includes("R$ 29,90") && html.includes("6x de R$ 4,98"));
console.log("PASS: sections, links, inputs, checkout state, accordions and interaction script unchanged");

for (const [, reference] of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  const resolved = path.resolve(root, reference.replace(/^\//, ""));
  assert.ok(resolved.startsWith(root + path.sep));
  assert.ok(fs.statSync(resolved).isFile(), "Exists: " + reference);
}
for (const [, reference] of css.matchAll(/url\("([^"]+)"\)/g)) {
  const resolved = path.resolve(root, "pv2", reference);
  assert.ok(resolved.startsWith(root + path.sep));
  assert.ok(fs.statSync(resolved).isFile(), "Exists: " + reference);
  if (resolved.endsWith(".woff2")) assert.equal(fs.readFileSync(resolved).toString("ascii", 0, 4), "wOF2");
}
assert.ok(!/(?:linear|radial|conic)-gradient|box-shadow\s*:/.test(css), "No gradients or box shadows");
for (const [, radius] of css.matchAll(/border-radius:\s*([^;}]+)/g)) assert.ok(["0", "4px"].includes(radius), "Corners are at most 4px");
assert.ok(css.includes("opacity:.03") && css.includes("position:fixed"));
assert.ok(css.includes("-webkit-text-stroke:1px var(--line)"));
assert.ok(css.includes("font-size:11.5vw") && css.includes("font-size:16vw"));
assert.ok(css.includes("prefers-reduced-motion") && css.includes(":focus-visible"));
console.log("PASS: local fonts and texture, editorial palette/effects, tight typography and accessibility");
