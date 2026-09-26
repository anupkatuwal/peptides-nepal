// Status filter for the peptide cards. The page works without this file:
// every card is visible by default.
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".filters button");
  const cards = document.querySelectorAll(".card[data-status]");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const f = btn.dataset.filter;
      buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      cards.forEach((c) => { c.hidden = f !== "all" && c.dataset.status !== f; });
    });
  });
});
