document.addEventListener("DOMContentLoaded", () => {
  const scroller = document.getElementById("therapyScroll");
  const wrap = scroller?.closest(".therapy-carousel-wrap");
  if (!scroller || !wrap) return;

  const prevBtn = wrap.querySelector(".logo-nav-prev");
  const nextBtn = wrap.querySelector(".logo-nav-next");
  const dots = [...wrap.querySelectorAll(".logo-dot")];
  const slideCount = scroller.children.length;
  const AUTO_DELAY = 4000;
  let autoTimer = null;

  function currentIndex() {
    return Math.round(scroller.scrollLeft / scroller.clientWidth);
  }

  function goTo(index) {
    const wrapped = (index + slideCount) % slideCount;
    scroller.scrollTo({ left: wrapped * scroller.clientWidth, behavior: "smooth" });
  }

  function updateDots() {
    const idx = currentIndex();
    dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => goTo(currentIndex() + 1), AUTO_DELAY);
  }

  function stopAuto() {
    if (autoTimer) clearInterval(autoTimer);
  }

  function restartAuto() {
    stopAuto();
    startAuto();
  }

  prevBtn?.addEventListener("click", () => {
    goTo(currentIndex() - 1);
    restartAuto();
  });
  nextBtn?.addEventListener("click", () => {
    goTo(currentIndex() + 1);
    restartAuto();
  });
  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      goTo(i);
      restartAuto();
    });
  });

  let scrollDebounce;
  scroller.addEventListener("scroll", () => {
    clearTimeout(scrollDebounce);
    scrollDebounce = setTimeout(updateDots, 100);
  });

  wrap.addEventListener("pointerdown", stopAuto);
  wrap.addEventListener("pointerup", restartAuto);
  wrap.addEventListener("mouseenter", stopAuto);
  wrap.addEventListener("mouseleave", startAuto);

  updateDots();
  startAuto();
});
