"use strict";

// Preencher somente quando o link HTTPS de checkout for aprovado.
const CHECKOUT_URL = "";

if (CHECKOUT_URL) {
  try {
    const checkout = new URL(CHECKOUT_URL);
    if (checkout.protocol === "https:") {
      document.querySelectorAll("[data-checkout]").forEach((button) => {
        button.disabled = false;
        button.addEventListener("click", () => window.location.assign(checkout.href));
      });
    }
  } catch {
    // Um endereço inválido mantém os botões de compra desativados.
  }
}

const menuToggle = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector("#mobile-nav");
function closeMenu(returnFocus = false) {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menu");
  mobileNav.hidden = true;
  if (returnFocus) menuToggle.focus();
}
menuToggle.addEventListener("click", () => {
  const expanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!expanded));
  menuToggle.setAttribute("aria-label", expanded ? "Abrir menu" : "Fechar menu");
  mobileNav.hidden = expanded;
});
mobileNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => closeMenu()));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !mobileNav.hidden) closeMenu(true);
});
document.addEventListener("click", (event) => {
  if (!mobileNav.hidden && !mobileNav.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
});

const stickyOffer = document.querySelector(".sticky-offer");
const hero = document.querySelector(".hero");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(([entry]) => {
    stickyOffer.classList.toggle("is-visible", !entry.isIntersecting && entry.boundingClientRect.top < 0);
  });
  observer.observe(hero);
} else {
  stickyOffer.classList.add("is-visible");
}

const privacyDialog = document.querySelector("#privacy-dialog");
document.querySelector("[data-open-privacy]").addEventListener("click", () => privacyDialog.showModal());
document.querySelector("[data-close-privacy]").addEventListener("click", () => privacyDialog.close());
privacyDialog.addEventListener("click", (event) => {
  const bounds = privacyDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) privacyDialog.close();
});
