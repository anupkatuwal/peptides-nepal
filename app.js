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

// Jump buttons: show "back to top" once the visitor has scrolled a screen's
// worth, and "jump to bottom" until they're near the end of the page.
document.addEventListener("DOMContentLoaded", () => {
  const up = document.getElementById("jump-top");
  const down = document.getElementById("jump-end");
  if (!up || !down) return;
  const update = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    up.classList.toggle("is-hidden", y < window.innerHeight * 0.8);
    down.classList.toggle("is-hidden", max - y < window.innerHeight * 0.8);
  };
  let queued = false;
  window.addEventListener("scroll", () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; update(); });
  }, { passive: true });
  window.addEventListener("resize", update);
  update();
});
