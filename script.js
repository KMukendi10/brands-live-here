/* Brands Live Here: small interactions (no libraries) */
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Scroll progress bar + back-to-top ---------- */
  const bar = document.createElement("div");
  bar.className = "progress";
  document.body.prepend(bar);

  const toTop = document.createElement("button");
  toTop.type = "button";
  toTop.className = "to-top";
  toTop.setAttribute("aria-label", "Back to top");
  toTop.textContent = "↑";
  document.body.append(toTop);

  const onScroll = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    bar.style.transform = "scaleX(" + (max > 0 ? h.scrollTop / max : 0) + ")";
    toTop.classList.toggle("show", h.scrollTop > 600);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })
  );

  /* ---------- Reveal on scroll ---------- */
  const revealSelector =
    ".overview-intro, .pillars li, .gallery figure, .steps li, .elements, .impact-list li, .footer > *";
  const items = document.querySelectorAll(revealSelector);

  if (!reduce && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          el.classList.add("in-view");
          io.unobserve(el);
          // hand the element back to its normal styles so hovers work cleanly
          setTimeout(() => el.classList.remove("reveal", "in-view"), 1200);
        });
      },
      { threshold: 0.12 }
    );
    items.forEach((el) => {
      const index = Array.prototype.indexOf.call(el.parentElement.children, el);
      el.style.setProperty("--d", Math.min(index, 5) * 90 + "ms");
      el.classList.add("reveal");
      io.observe(el);
    });
  }

  /* ---------- Chips: pop on click ---------- */
  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      chip.classList.remove("pop");
      void chip.offsetWidth; // restart animation
      chip.classList.add("pop");
    });
  });

  /* ---------- Lightbox ---------- */
  const zoomSelector = ".hero-photo .photo img, .gallery img, .steps img";
  const zoomables = Array.from(document.querySelectorAll(zoomSelector));
  if (!zoomables.length) return;

  const box = document.createElement("div");
  box.className = "lightbox";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-modal", "true");
  box.setAttribute("aria-label", "Image viewer");
  box.innerHTML =
    '<button type="button" class="lb-btn lb-close" aria-label="Close">×</button>' +
    '<button type="button" class="lb-btn lb-prev" aria-label="Previous image">‹</button>' +
    '<img alt="">' +
    '<button type="button" class="lb-btn lb-next" aria-label="Next image">›</button>' +
    '<p class="lb-cap"></p>';
  document.body.append(box);

  const lbImg = box.querySelector("img");
  const lbCap = box.querySelector(".lb-cap");
  let current = 0;
  let lastFocus = null;

  const show = (i) => {
    current = (i + zoomables.length) % zoomables.length;
    const src = zoomables[current];
    lbImg.src = src.currentSrc || src.src;
    lbImg.alt = src.alt;
    lbCap.textContent = src.alt + "  (" + (current + 1) + "/" + zoomables.length + ")";
  };
  const open = (i) => {
    lastFocus = document.activeElement;
    show(i);
    box.classList.add("open");
    document.body.classList.add("no-scroll");
    box.querySelector(".lb-close").focus();
  };
  const close = () => {
    box.classList.remove("open");
    document.body.classList.remove("no-scroll");
    if (lastFocus) lastFocus.focus();
  };

  zoomables.forEach((img, i) => {
    img.classList.add("zoomable");
    img.tabIndex = 0;
    img.setAttribute("role", "button");
    img.setAttribute("aria-label", "Enlarge image: " + img.alt);
    img.addEventListener("click", () => open(i));
    img.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open(i);
      }
    });
  });

  box.addEventListener("click", (e) => {
    if (e.target === box) close();
  });
  box.querySelector(".lb-close").addEventListener("click", close);
  box.querySelector(".lb-prev").addEventListener("click", () => show(current - 1));
  box.querySelector(".lb-next").addEventListener("click", () => show(current + 1));
  document.addEventListener("keydown", (e) => {
    if (!box.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });
})();
