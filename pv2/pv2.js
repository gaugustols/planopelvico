"use strict";

const checks = [...document.querySelectorAll(".checks input")];
const counter = document.querySelector("#contador");
const next = document.querySelector("#check-next");

function updateChecklist() {
  const selected = checks.filter(check => check.checked).length;
  counter.textContent = `${selected} de ${checks.length} sinais`;
  next.hidden = selected < 3;
}

checks.forEach(check => check.addEventListener("change", updateChecklist));
updateChecklist();

const expense = document.querySelector("#gasto");
const years = document.querySelector("#anos");
const yearsOutput = document.querySelector("#anos-valor");
const total = document.querySelector("#total");
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function updateEstimate() {
  const amount = Math.max(0, Math.min(expense.valueAsNumber || 0, Number(expense.max)));
  yearsOutput.textContent = years.value;
  total.textContent = brl.format(amount * 12 * Number(years.value));
}

expense.addEventListener("input", updateEstimate);
years.addEventListener("input", updateEstimate);
updateEstimate();

const sticky = document.querySelector("#sticky");
const hero = document.querySelector("#inicio");
const offer = document.querySelector("#oferta");
const guarantee = document.querySelector("#garantia");

function updateSticky() {
  const afterHero = hero.getBoundingClientRect().bottom < 64;
  const beforeOffer = offer.getBoundingClientRect().top >= innerHeight;
  const afterGuarantee = guarantee.getBoundingClientRect().bottom < 64;
  sticky.hidden = !afterHero || (!beforeOffer && !afterGuarantee);
}

addEventListener("scroll", updateSticky, { passive: true });
addEventListener("resize", updateSticky);
updateSticky();
