"use strict";

// Adicionar a URL HTTPS quando o checkout for definido.
const CHECKOUT_URL = "";

if (CHECKOUT_URL) {
  const checkout = new URL(CHECKOUT_URL);

  if (checkout.protocol === "https:") {
    document.querySelectorAll("[data-checkout]").forEach((button) => {
      button.disabled = false;
      button.addEventListener("click", () => {
        window.location.assign(checkout.href);
      });
    });
  }
}
