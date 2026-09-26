// Peptides Nepal — small progressive enhancements.
// The page is complete without this file: every card, post, quiz answer and
// number is already in the HTML. This only adds the live, interactive parts.
"use strict";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const DAY = 864e5;

// "3 days ago" style text for a date.
function ago(date) {
  const days = Math.floor((Date.now() - date.getTime()) / DAY);
  if (days <= 0) {
    const hours = Math.floor((Date.now() - date.getTime()) / 36e5);
    return hours <= 0 ? "just now" : `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return weeks < 5 ? `${weeks} week${weeks === 1 ? "" : "s"} ago` : null;
}

// ── Guide: status filter + live search ─────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".filters button");
  const cards = [...document.querySelectorAll(".card[data-status]")];
  const search = document.getElementById("guide-search");
  const count = document.getElementById("guide-count");
  let status = "all";

  const apply = () => {
    const q = (search?.value || "").trim().toLowerCase();
    let shown = 0;
    cards.forEach((c) => {
      const ok = (status === "all" || c.dataset.status === status) && (!q || c.textContent.toLowerCase().includes(q));
      c.hidden = !ok;
      if (ok) shown++;
    });
    if (count) count.textContent = q || status !== "all" ? `Showing ${shown} of ${cards.length}${shown ? "" : ". Try another word."}` : "";
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      status = btn.dataset.filter;
      buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      apply();
    });
  });
  if (search) {
    search.closest(".search").hidden = false;
    search.addEventListener("input", apply);
  }
});

// ── Instagram posts: slide carousels, "New" tags, relative dates ───────────
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".post").forEach((post) => {
    // Relative date + "New" tag for posts from the last 3 days.
    const time = post.querySelector("time[datetime]");
    if (time) {
      const d = new Date(time.getAttribute("datetime"));
      const rel = ago(d);
      if (rel) time.textContent = `${time.textContent} · ${rel}`;
      if (Date.now() - d.getTime() < 3 * DAY) {
        const tag = document.createElement("span");
        tag.className = "tag-new";
        tag.textContent = "New";
        time.before(tag);
      }
    }

    // Carousel controls. The strip already swipes/scrolls on its own.
    const media = post.querySelector(".post-media");
    const strip = media?.querySelector(".slides");
    const total = Number(media?.dataset.slides || 0);
    if (!strip || total < 2) return;

    const counter = document.createElement("span");
    counter.className = "slide-count";
    counter.setAttribute("aria-hidden", "true");
    const mk = (dir, label, path) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = `slide-btn slide-${dir}`;
      b.setAttribute("aria-label", label);
      b.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
      return b;
    };
    const prev = mk("prev", "Previous slide", "M15 5l-7 7 7 7");
    const next = mk("next", "Next slide", "M9 5l7 7-7 7");
    media.append(prev, next, counter);

    const index = () => Math.round(strip.scrollLeft / strip.clientWidth);
    const update = () => {
      const i = index();
      counter.textContent = `${i + 1} / ${total}`;
      prev.disabled = i <= 0;
      next.disabled = i >= total - 1;
    };
    const go = (step) => strip.scrollTo({ left: (index() + step) * strip.clientWidth, behavior: reduceMotion ? "auto" : "smooth" });
    prev.addEventListener("click", () => go(-1));
    next.addEventListener("click", () => go(1));
    strip.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
    });
    let queued = false;
    strip.addEventListener("scroll", () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; update(); });
    }, { passive: true });
    update();
  });
});

// ── Hero: "New on Instagram" strip from the newest post ────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const strip = document.getElementById("latest-post");
  const first = document.querySelector(".post");
  if (!strip || !first) return;
  const title = first.querySelector("h3")?.textContent.trim();
  const when = first.querySelector("time[datetime]")?.getAttribute("datetime");
  const link = first.querySelector(".post-link")?.getAttribute("href");
  if (!title || !when) return;
  const rel = ago(new Date(when));
  if (!rel) return; // older than about a month: nothing "new" to announce
  strip.querySelector(".latest-title").textContent = title;
  strip.querySelector(".latest-when").textContent = rel;
  if (link) { strip.href = link; strip.rel = "noopener"; }
  strip.hidden = false;
});

// ── Stats: count from the page, then animate up ────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const values = {
    guide: document.querySelectorAll(".card[data-status]").length,
    sources: document.querySelectorAll(".card .sources li").length,
    posts: Number(document.querySelector(".posts")?.dataset.total) || document.querySelectorAll(".post").length,
  };
  const els = [...document.querySelectorAll("[data-count]")];
  els.forEach((el) => { const v = values[el.dataset.count]; if (v) el.textContent = String(v); });
  if (reduceMotion || !("IntersectionObserver" in window)) return;

  const run = (el) => {
    const target = Number(el.textContent);
    if (!target) return;
    const start = performance.now();
    const dur = 900;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.6 });
  els.forEach((el) => io.observe(el));
});

// ── Myth or fact quiz ──────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const qs = [...document.querySelectorAll(".q[data-answer]")];
  const score = document.getElementById("quiz-score");
  const more = document.getElementById("quiz-next");
  if (!qs.length) return;
  const PER = 4;
  let right = 0, answered = 0;

  // Shuffle once per visit so returning visitors see a different set first.
  const order = qs.map((q) => [Math.random(), q]).sort((a, b) => a[0] - b[0]).map(([, q]) => q);
  let page = 0;
  const show = () => {
    const from = (page * PER) % order.length;
    const set = new Set(order.slice(from, from + PER));
    qs.forEach((q) => { q.hidden = !set.has(q); });
  };

  qs.forEach((q) => {
    const details = q.querySelector("details");
    const row = document.createElement("div");
    row.className = "q-choices";
    ["myth", "fact"].forEach((choice) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = `q-btn q-${choice}`;
      b.textContent = choice === "myth" ? "Myth" : "Fact";
      b.addEventListener("click", () => {
        const correct = choice === q.dataset.answer;
        q.classList.add(correct ? "is-right" : "is-wrong");
        row.querySelectorAll("button").forEach((x) => { x.disabled = true; });
        b.setAttribute("aria-pressed", "true");
        const verdict = document.createElement("p");
        verdict.className = "q-verdict";
        verdict.textContent = correct ? "You got it." : "Not quite.";
        row.after(verdict);
        details.open = true;
        answered++;
        if (correct) right++;
        score.hidden = false;
        score.textContent = `Your score: ${right} of ${answered}`;
      });
      row.append(b);
    });
    // The buttons replace the "Show answer" toggle; the answer text stays in <details>.
    details.classList.add("q-answer");
    details.before(row);
  });

  if (more && order.length > PER) {
    more.hidden = false;
    more.addEventListener("click", () => {
      page++;
      show();
      document.getElementById("quiz")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  }
  show();
});

// ── Gentle reveal as sections scroll into view ─────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  if (reduceMotion || !("IntersectionObserver" in window)) return;
  const items = document.querySelectorAll(".card, .post, .q, .notice, .contact, .stats li");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px" });
  items.forEach((el) => {
    // Only hide things that start below the fold, so nothing on screen flickers.
    if (el.getBoundingClientRect().top > window.innerHeight) {
      el.classList.add("reveal");
      io.observe(el);
    }
  });
});

// ── Jump buttons ───────────────────────────────────────────────────────────
// Show "back to top" once the visitor has scrolled a screen's worth, and
// "jump to bottom" until they're near the end of the page.
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
