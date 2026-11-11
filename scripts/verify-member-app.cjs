"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "app/index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "app/styles.css"), "utf8");
const source = fs.readFileSync(path.join(root, "app/app.js"), "utf8");
const dataSource = fs.readFileSync(path.join(root, "app/data.js"), "utf8");
const key = "planopelvico.member-preview.v1";

// Isolated renderer harness: no browser, network or production storage is touched.
function boot(hash, options = {}) {
  const handlers = {};
  const records = new Map();
  const makeNode = () => ({ innerHTML: "", textContent: "", classList: { add() {}, remove() {} }, focus() {}, addEventListener() {}, querySelector() { return makeNode(); }, showModal() {}, close() {} });
  const nodes = Object.fromEntries(["main", "breadcrumb", "toast", "welcome-dialog", "favorites"].map(id => [id, makeNode()]));
  const nav = [makeNode(), makeNode()];
  if (options.stored) records.set(key, JSON.stringify(options.stored));
  const storage = {
    getItem(k) { if (options.blockStorage) throw new Error("Blocked"); return records.get(k) || null; },
    setItem(k, value) { if (options.blockStorage) throw new Error("Blocked"); records.set(k, value); },
    removeItem(k) { if (options.blockStorage) throw new Error("Blocked"); records.delete(k); }
  };
  const document = {
    getElementById(id) { return nodes[id]; },
    querySelector() { return nodes.favorites; },
    querySelectorAll(selector) { return selector === "[data-navigation]" ? nav : [makeNode(), makeNode()]; },
    addEventListener(name, fn) { handlers[name] = fn; }
  };
  const context = vm.createContext({
    window: { location: { hash }, addEventListener(name, fn) { handlers[name] = fn; }, scrollTo() {}, confirm() { return true; } },
    document, localStorage: storage, URL, setTimeout() { return 1; }, clearTimeout() {}
  });
  vm.runInContext(dataSource, context, { filename: "data.js" });
  if (options.configure) options.configure(context.window.PELVICO_DATA);
  vm.runInContext(source, context, { filename: "app.js" });
  return {
    main: nodes.main,
    document,
    records,
    go(route) { context.window.location.hash = "#" + route; handlers.hashchange(); },
    click(selector, dataset = {}) {
      handlers.click({ target: { closest(target) { return target === selector ? { dataset } : null; } }, preventDefault() {} });
    }
  };
}

const titles = ["Fortalecimento pélvico", "Postura e respiração", "Controle da bexiga", "Alimentação estratégica", "Saúde da bexiga e uretra", "Hábitos do dia a dia"];
for (let i = 0; i < titles.length; i++) {
  const app = boot("#fase/" + (i + 1));
  assert.ok(app.main.innerHTML.includes("<h1>" + titles[i] + "</h1>"));
  assert.ok(app.main.innerHTML.includes("NÃO IDENTIFICADO — definir manualmente."));
  assert.match(app.main.innerHTML, /<button[^>]+disabled[^>]+data-arquivo="guide"/);
  assert.ok(!app.main.innerHTML.includes('href="#"'));
}
for (const route of ["inicio", "guia", "bonus", "bonus/verdades-e-mentiras", "bonus/whatsapp", "ajuda", "comece", "downloads", "favoritos"]) {
  const app = boot("#" + route);
  assert.equal((app.main.innerHTML.match(/<h1>/g) || []).length, 1, route + " has one heading");
  const ids = [...app.main.innerHTML.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size, route + " has no repeated IDs");
}
assert.ok(boot("#does-not-exist").main.innerHTML.includes("Vamos voltar ao seu guia?"));
assert.ok(boot("#__proto__").main.innerHTML.includes("Vamos voltar ao seu guia?"));
console.log("PASS: all screens, six real phase names, missing-content states and route fallback");

const app = boot("#fase/2");
app.click("[data-read]", { read: "2" });
app.click("[data-favorite]", { favorite: "2" });
const saved = JSON.parse(app.records.get(key));
assert.deepEqual(saved.read, [2]);
assert.deepEqual(saved.favorites, [2]);
assert.equal(saved.last, 2);
const restored = boot("#inicio", { stored: saved });
assert.ok(restored.main.innerHTML.includes("Continuar de onde parei"));
assert.ok(restored.main.innerHTML.includes("1 de 6 apresentações"));
restored.go("favoritos");
assert.ok(restored.main.innerHTML.includes("Postura e respiração"));
restored.go("fase/2");
restored.click("[data-read]", { read: "2" });
assert.deepEqual(JSON.parse(restored.records.get(key)).read, []);
const blocked = boot("#fase/1", { blockStorage: true });
blocked.click("[data-favorite]", { favorite: "1" });
blocked.go("favoritos");
assert.ok(blocked.main.innerHTML.includes("Fortalecimento pélvico"));
assert.ok(blocked.main.innerHTML.includes("apenas nesta sessão"));
console.log("PASS: resume, favorites, read/unread persistence and graceful blocked-storage fallback");

for (const url of ["javascript:alert(1)", "data:text/html,unsafe", "//outside.example/file", "http://outside.example/file", "https://user:secret@example.com/file"]) {
  const invalid = boot("#downloads", { configure(data) { data.materials.guide.url = url; } });
  assert.match(invalid.main.innerHTML, /<button[^>]+disabled[^>]+data-arquivo="guide"/);
}
for (const url of ["https://example.com/guide.pdf", "./materiais/guia.pdf"]) {
  const configured = boot("#downloads", { configure(data) { data.materials.guide.url = url; } });
  assert.ok(configured.main.innerHTML.includes('href="' + url + '"'));
}
const escaped = boot("#fase/1", { configure(data) { data.phases[0].content = [{ title: "<script>bad</script>", paragraphs: ['<img src=x onerror="bad()">'] }]; } });
assert.ok(!escaped.main.innerHTML.includes("<script>bad</script>"));
assert.ok(escaped.main.innerHTML.includes("&lt;script&gt;bad&lt;/script&gt;"));
assert.ok(escaped.main.innerHTML.includes("&lt;img"));
const badGroup = boot("#bonus/whatsapp", { configure(data) { data.bonuses.whatsappUrl = "https://example.com"; } });
assert.ok(badGroup.main.innerHTML.includes("Link do grupo não disponibilizado"));
const realGroup = boot("#bonus/whatsapp", { configure(data) { data.bonuses.whatsappUrl = "https://chat.whatsapp.com/example"; } });
assert.ok(realGroup.main.innerHTML.includes('href="https://chat.whatsapp.com/example"'));
console.log("PASS: configurable downloads, rejected unsafe URLs, escaped content and WhatsApp destinations");

for (const [, reference] of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  assert.ok(!/^https?:/.test(reference), "Offline assets are local");
  assert.ok(fs.statSync(path.resolve(root, "app", reference)).isFile(), "Exists: " + reference);
}
for (const [, reference] of css.matchAll(/url\("([^"]+)"\)/g)) assert.ok(fs.statSync(path.resolve(root, "app", reference)).isFile());
assert.ok(!/\bfetch\s*\(|XMLHttpRequest|import\s*\(/.test(source), "Rendering has no server dependency");
assert.ok(css.includes("prefers-reduced-motion"));
assert.ok(css.includes(":focus-visible"));
assert.ok(html.includes('name="robots" content="noindex, nofollow"'));
assert.ok(boot("#ajuda").main.innerHTML.includes("R$ 29,90"));
assert.ok(boot("#ajuda").main.innerHTML.includes("6x de R$ 4,98"));
console.log("PASS: local resources, buildless/offline rendering contract, accessibility hooks and approved offer");
