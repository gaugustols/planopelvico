"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const cssPath = path.join(root, "assets/css/styles.css");
const css = fs.readFileSync(cssPath, "utf8");
const original = JSON.parse(fs.readFileSync(path.join(root, "tests/fixtures/approved-copy.json"), "utf8"));
const expectedCount = original.filter(text => text !== null).length;
const normalize = text => text.replace(/<[^>]*>/g, "").replaceAll("&quot;", '"').replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&amp;", "&").replace(/\s+/g, " ").trim();
const preserved = [...html.matchAll(/<([a-z][a-z0-9]*)\b[^>]*\bdata-copy="(\d+)"[^>]*>([\s\S]*?)<\/\1>/g)];
assert.equal(preserved.length, expectedCount, "Every approved copy block must be present exactly once");
const copyIds = preserved.map(match => Number(match[2]));
assert.equal(new Set(copyIds).size, expectedCount, "No repeated approved-copy identifiers");
for (const match of preserved) assert.equal(normalize(match[3]), normalize(original[Number(match[2])]), "Changed approved copy block " + match[2]);
console.log("PASS: all " + expectedCount + " approved copy blocks preserved exactly");

assert.match(html, /<html lang="pt-BR">/);
assert.match(html, /name="viewport" content="width=device-width, initial-scale=1"/);
assert.equal((html.match(/<h1\b/g) || []).length, 1, "Single main heading");
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(ids.length, new Set(ids).size, "Unique HTML identifiers");
for (const [,id] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(id), "Missing anchor " + id);
assert.ok(!html.includes('href="#"'), "No dead placeholder links");
assert.equal((html.match(/<section\b/g) || []).length, 15, "Reference structure has 15 main sections");
assert.equal((html.match(/<details name="faq">/g) || []).length, 8, "FAQ contains actual native accordions");
console.log("PASS: 15 sections, heading structure, anchors and 8 FAQ accordions");

const files = new Set();
function checkFile(reference, from) {
  if (reference.startsWith("#")) return;
  assert.ok(!/^https?:/.test(reference), "Browser resources must be local: " + reference);
  const [relative, fragment] = reference.split("#");
  const resolved = path.resolve(path.dirname(from), relative);
  assert.ok(resolved.startsWith(root + path.sep), "Resource stays in project");
  assert.ok(fs.statSync(resolved).isFile(), "Missing resource " + relative);
  files.add(resolved);
  if (fragment && resolved.endsWith(".svg")) {
    const svg = fs.readFileSync(resolved,"utf8");
    assert.ok(svg.includes('id="' + fragment + '"'), "Missing SVG symbol " + fragment);
  }
}
for (const [,ref] of html.matchAll(/(?:src|href)="([^"#][^"]*)"/g)) checkFile(ref,path.join(root,"index.html"));
for (const [,ref] of css.matchAll(/url\("([^"]+)"\)/g)) checkFile(ref,cssPath);
for (const [,attributes] of html.matchAll(/<img\b([^>]+)>/g)) {
  assert.match(attributes, /\balt="[^"]+"/, "Images have meaningful alternative text");
  assert.match(attributes, /\bwidth="\d+"/);
  assert.match(attributes, /\bheight="\d+"/);
}
console.log("PASS: " + files.size + " local assets, SVG symbols, image descriptions and dimensions");

assert.ok(html.includes("R$ 29,90") && html.includes("6x de R$ 4,98"));
assert.ok(!/R\$147|12x de R\$14,76|60-Day|Garantia de 30 dias/.test(html), "No imported or superseded offer terms");
const purchaseButtons = [...html.matchAll(/<button\b([^>]*\bdata-checkout[^>]*)>/g)];
assert.equal(purchaseButtons.length, 3);
assert.ok(purchaseButtons.every(match => /\bdisabled\b/.test(match[1])), "Checkout remains disabled until approved");
assert.ok(!/<iframe\b|<form\b/.test(html), "No extra checkout embeds, data collection or forms");
assert.ok(fs.readFileSync(path.join(root,"assets/js/main.js"),"utf8").includes('const CHECKOUT_URL = "";'));
assert.ok(css.includes("prefers-reduced-motion"));
assert.ok(css.includes(":focus-visible"));
console.log("PASS: approved price, 7-day guarantee, pending checkout, focus and reduced-motion support");
const config = JSON.parse(fs.readFileSync(path.join(root,"vercel.json"),"utf8"));
assert.equal(config.framework,null);
assert.equal(config.buildCommand,"");
assert.equal(config.outputDirectory,".");
console.log("PASS: existing buildless Vercel configuration preserved");
