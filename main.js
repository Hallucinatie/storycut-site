(() => {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Motion (motion.dev, formerly Framer Motion) drives the choreography. Without it,
  // or with reduced motion, the page is complete and static.
  const M = !reduceMotion && window.Motion ? window.Motion : null;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const EASE = [0.2, 0.8, 0.2, 1];

  // ── Links into the studio ──────────────────────────────────────────
  // Served by the app at /site the studio is "/"; published on its own (GitHub Pages) it is a preview page.
  const sameOrigin = location.port === "7860" || location.pathname.startsWith("/site");
  const appUrl = window.STORYCUT_APP_URL || (sameOrigin ? "/" : "workbench.html");
  $$("[data-app]").forEach((link) => { link.href = appUrl; });

  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // ── Headings: reveal character by character ────────────────────────
  // Latin words and numbers stay whole so they never break mid-word.
  const splitChars = (heading) => {
    heading.setAttribute("aria-label", heading.textContent.replace(/\s+/g, " ").trim());
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.ELEMENT_NODE) return walk(child);
        if (child.nodeType !== Node.TEXT_NODE || !child.textContent.trim()) return;
        const frag = document.createDocumentFragment();
        for (const token of child.textContent.match(/[A-Za-z0-9.+\-×%]+|\s+|./gu)) {
          if (/^\s+$/.test(token)) { frag.append(token); continue; }
          const span = document.createElement("span");
          span.className = "ch";
          span.setAttribute("aria-hidden", "true");
          span.textContent = token;
          frag.append(span);
        }
        child.replaceWith(frag);
      });
    };
    walk(heading);
    return $$(".ch", heading);
  };

  // ── Hero ───────────────────────────────────────────────────────────
  const hero = $("#hero");
  if (M) {
    const { animate, stagger, scroll } = M;
    const intro = [".hero-title .line", ".hero-sub", ".prompt", ".hero-fine"].map((s) => $$(s, hero)).flat();
    intro.forEach((el) => { el.style.opacity = "0"; });
    animate(intro, { opacity: [0, 1], y: [28, 0], filter: ["blur(10px)", "blur(0px)"] },
      { duration: 0.9, delay: stagger(0.11, { startDelay: 0.1 }), ease: EASE });

    // Floating film cards: fly in, then follow the pointer with a spring.
    $$(".float-card", hero).forEach((card) => {
      const inner = $(".fc-inner", card);
      const side = Number(card.dataset.depth) || 1;          // 1 = left card, -1 = right card
      const base = { rotateY: 18 * side, rotateZ: -4 * side };
      inner.style.opacity = "0";
      animate(inner, { opacity: [0, 1], x: [-120 * side, 0], rotateY: [50 * side, base.rotateY], rotateZ: [-12 * side, base.rotateZ],
        transformPerspective: 900 }, { type: "spring", stiffness: 70, damping: 16, delay: 0.45 });
      hero.addEventListener("pointermove", (event) => {
        const nx = event.clientX / window.innerWidth - 0.5;
        const ny = event.clientY / window.innerHeight - 0.5;
        animate(inner, { x: nx * 30 * side, y: ny * 24, rotateY: base.rotateY + nx * 10, rotateX: -ny * 8, rotateZ: base.rotateZ,
          transformPerspective: 900 }, { type: "spring", stiffness: 60, damping: 18 });
      });
    });

    // Slow drifting light behind the hero.
    $$(".glow i").forEach((blob, i) => {
      animate(blob, { x: [0, (i % 2 ? -1 : 1) * 80, 0], y: [0, 50 - i * 30, 0], scale: [1, 1.12, 1] },
        { duration: 16 + i * 4, repeat: Infinity, ease: "easeInOut" });
    });

    // Scrolling away: the hero copy lifts and fades, the cards spread.
    scroll(animate($(".hero-inner", hero), { y: [0, -80], opacity: [1, 0.15] }, { ease: "linear" }),
      { target: hero, offset: ["start start", "end start"] });
    $$(".float-card", hero).forEach((card) => {
      const side = Number(card.dataset.depth) || 1;
      scroll(animate(card, { x: [0, -140 * side], opacity: [1, 0] }, { ease: "linear" }), { target: hero, offset: ["start start", "end start"] });
    });
  }

  // ── Typewriter: what you might want explained ──────────────────────
  const prompts = [
    { text: "一篇论文", min: 8, who: "相关方向的研究生" },
    { text: "Voyager 这篇论文", min: 8, who: "第一次了解的人" },
    { text: "下周组会要讲的论文", min: 5, who: "课题组同学" },
    { text: "一篇 40 页的综述", min: 12, who: "相关方向的研究生" },
    { text: "导师刚发来的论文", min: 5, who: "自己" },
  ];
  const typed = $("#typed");
  const typedMin = $("#typedMin");
  const chipMin = $("#chipMin");
  const chipWho = $("#chipWho");
  const pop = (el, value) => {
    if (el.textContent === String(value)) return;
    el.textContent = value;
    if (M) M.animate(el, { scale: [1.25, 1], opacity: [0.4, 1] }, { type: "spring", stiffness: 400, damping: 18 });
  };
  if (!reduceMotion && typed) {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    (async () => {
      await sleep(2600);
      for (let i = 1; ; i = (i + 1) % prompts.length) {
        const next = prompts[i];
        const chars = [...typed.textContent];
        while (chars.length) { chars.pop(); typed.textContent = chars.join(""); await sleep(38); }
        await sleep(220);
        for (const ch of next.text) { typed.textContent += ch; await sleep(85 + Math.random() * 60); }
        pop(typedMin, next.min);
        pop(chipMin, next.min);
        pop(chipWho, next.who);
        await sleep(2600);
      }
    })();
  }

  // ── Section entrances ──────────────────────────────────────────────
  if (M) {
    const { animate, inView, stagger } = M;
    $$(".reveal-chars").forEach((heading) => {
      const chars = splitChars(heading);
      const marks = $$(".hl", heading);
      chars.forEach((ch) => { ch.style.opacity = "0"; });
      marks.forEach((mark) => { mark.style.backgroundSize = "0% 100%"; });
      inView(heading, () => {
        animate(chars, { opacity: [0, 1], y: ["0.45em", "0em"], filter: ["blur(8px)", "blur(0px)"] },
          { duration: 0.6, delay: stagger(0.028), ease: EASE });
        // Then the highlighter stroke, drawn left to right like marking up a paper.
        animate(marks, { backgroundSize: ["0% 100%", "100% 100%"] },
          { duration: 0.55, delay: 0.25 + chars.length * 0.028, ease: [0.6, 0, 0.3, 1] });
      }, { amount: 0.6 });
    });

    const rise = (selector, { gap = 0.08, amount = 0.2 } = {}) => {
      $$(selector).forEach((group) => {
        const items = group.matches(".grid, .motion-grid, .compare, .entry-grid, .faq-list") ? [...group.children] : [group];
        items.forEach((el) => { el.style.opacity = "0"; });
        inView(group, () => {
          animate(items, { opacity: [0, 1], y: [40, 0], scale: [0.97, 1] }, { duration: 0.8, delay: stagger(gap), ease: EASE });
        }, { amount });
      });
    };
    rise("section .lead");
    rise(".grid", { gap: 0.07, amount: 0.1 });
    rise(".motion-grid", { gap: 0.1, amount: 0.15 });
    rise(".compare", { gap: 0.12 });
    rise(".entry-grid", { gap: 0.12 });
    rise(".faq-list", { gap: 0.05 });
    rise(".strip", { amount: 0.3 });
    rise(".sample-frame");
    rise(".final .cta-row");

    // The citation player grows into place as it scrolls in.
    M.scroll(animate("#player", { scale: [0.86, 1], opacity: [0.35, 1], rotateX: [14, 0], transformPerspective: 1400 }, { ease: "linear" }),
      { target: $("#player"), offset: ["start end", "start 0.25"] });

    // Springy lift on hover.
    M.hover(".card, .entry", (el) => {
      animate(el, { y: -6, scale: 1.012 }, { type: "spring", stiffness: 300, damping: 20 });
      return () => animate(el, { y: 0, scale: 1 }, { type: "spring", stiffness: 300, damping: 24 });
    });
  }

  // ── Frames strip: duplicate for a seamless loop; click to play the sample there ──
  const track = $("#stripTrack");
  if (track) {
    [...track.children].forEach((frame) => {
      const copy = frame.cloneNode(true);
      copy.setAttribute("aria-hidden", "true");
      copy.tabIndex = -1;
      track.append(copy);
    });
    const sample = $("#sampleVideo");
    track.addEventListener("click", (event) => {
      const frame = event.target.closest(".frame");
      if (!frame || !sample) return;
      const at = Number(frame.dataset.t) || 0;
      $("#sample").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      const start = () => { sample.currentTime = at; sample.play().catch(() => {}); };
      if (sample.readyState >= 1) start();
      else { sample.preload = "auto"; sample.addEventListener("loadedmetadata", start, { once: true }); sample.load(); }
    });
  }

  // ── Citation player: chips follow the montage ──────────────────────
  // Segment starts match the cut list of assets/hero.mp4 (see README.md).
  const segments = [
    { at: 0, chips: [["片头：论文标题自动排版"], ["Voyager.pdf · arXiv 2305.16291"]] },
    { at: 2.2, chips: [["引用 Figure 2 · 第 2 页"], ["镜头拉远，再推近技能库"]] },
    { at: 8.2, chips: [["引用 Table 1 · 第 7 页"], ["放大镜：钻石层级 102 (1/3)"]] },
    { at: 15.2, chips: [["引用 Figure 9 · 第 9 页"], ["−93% 已对照原文", "check"]] },
    { at: 21.2, chips: [["局限：可靠性、成本、外部支持"], ["每条都标了原文出处", "check"]] },
  ];
  const video = $("#heroVideo");
  const stack = $("#citeStack");
  const ticks = $$("#scrub li");
  let current = -1;
  const segmentAt = (t) => {
    for (let i = segments.length - 1; i >= 0; i--) if (t >= segments[i].at) return i;
    return 0;
  };
  const showChips = (index) => {
    [...stack.children].forEach((chip) => {
      if (M) M.animate(chip, { opacity: 0, x: 16 }, { duration: 0.2 }).then(() => chip.remove());
      else chip.remove();
    });
    segments[index].chips.forEach(([text, kind], n) => {
      const chip = document.createElement("span");
      chip.className = "cite-chip" + (kind ? " " + kind : "");
      chip.textContent = text;
      stack.appendChild(chip);
      if (M) M.animate(chip, { opacity: [0, 1], x: [24, 0], scale: [0.92, 1] }, { type: "spring", stiffness: 260, damping: 22, delay: 0.25 + n * 0.3 });
    });
  };
  const paint = () => {
    const t = video.currentTime;
    const index = segmentAt(t);
    if (index !== current) { current = index; showChips(index); }
    const end = video.duration || 27.2;
    ticks.forEach((tick, i) => {
      const startAt = segments[i].at;
      const stop = i + 1 < segments.length ? segments[i + 1].at : end;
      tick.querySelector("i").style.setProperty("--p", `${Math.min(1, Math.max(0, (t - startAt) / (stop - startAt))) * 100}%`);
      tick.classList.toggle("on", i === index);
    });
  };
  if (video) {
    const loop = () => { paint(); if (!video.paused) requestAnimationFrame(loop); };
    video.addEventListener("play", () => requestAnimationFrame(loop));
    video.addEventListener("seeked", paint);
    video.addEventListener("loadedmetadata", paint);
    ticks.forEach((tick, i) => tick.addEventListener("click", () => {
      video.currentTime = segments[i].at + 0.05;
      video.play().catch(() => {});
    }));
    // Plays only while on screen; with reduced motion it waits for a click on a chapter.
    new IntersectionObserver(([entry]) => {
      if (reduceMotion) return;
      if (entry.isIntersecting) { video.preload = "auto"; video.play().catch(() => {}); }
      else video.pause();
    }, { threshold: 0.35 }).observe(video);
    paint();
  }

  // ── Looping clips: play while on screen; with reduced motion they show their poster and controls ──
  $$("video[data-loop]").forEach((clip) => {
    if (reduceMotion) { clip.controls = true; return; }
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { clip.preload = "auto"; clip.play().catch(() => {}); }
      else clip.pause();
    }, { threshold: 0.4 }).observe(clip);
  });
})();
