(() => {
  const mobileToggle = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.toggle("is-open");
      mobileToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  document.querySelectorAll("[data-hero]").forEach((hero) => {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let index = 0;
    let timer = null;

    const show = (nextIndex) => {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    };

    const start = () => {
      timer = window.setInterval(() => show(index + 1), 5200);
    };

    const restart = () => {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    };

    if (prev) {
      prev.addEventListener("click", () => {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", () => {
        show(index + 1);
        restart();
      });
    }

    dots.forEach((dot, dotIndex) => {
      dot.addEventListener("click", () => {
        show(dotIndex);
        restart();
      });
    });

    show(0);
    start();
  });

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q") || "";
  const searchInput = document.querySelector("[data-card-search]");
  const typeFilter = document.querySelector("[data-type-filter]");
  const cards = Array.from(document.querySelectorAll("[data-card]"));
  const emptyResult = document.querySelector("[data-empty-result]");

  const applyFilter = () => {
    const keyword = (searchInput ? searchInput.value : "").trim().toLowerCase();
    const typeValue = typeFilter ? typeFilter.value : "";
    let visible = 0;

    cards.forEach((card) => {
      const text = (card.dataset.filter || "").toLowerCase();
      const type = card.dataset.type || "";
      const keywordMatch = !keyword || text.includes(keyword);
      const typeMatch = !typeValue || type === typeValue;
      const matched = keywordMatch && typeMatch;
      card.style.display = matched ? "" : "none";
      if (matched) {
        visible += 1;
      }
    });

    if (emptyResult) {
      emptyResult.classList.toggle("is-visible", visible === 0);
    }
  };

  if (searchInput) {
    searchInput.value = initialQuery;
    searchInput.addEventListener("input", applyFilter);
  }

  if (typeFilter) {
    typeFilter.addEventListener("change", applyFilter);
  }

  if (cards.length) {
    applyFilter();
  }

  let hlsLoader = null;

  const loadHls = () => {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (!hlsLoader) {
      hlsLoader = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";
        script.onload = () => resolve(window.Hls);
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    return hlsLoader;
  };

  const activatePlayer = (video) => {
    if (!video) {
      return;
    }

    const src = video.dataset.video;
    const box = video.closest("[data-player-box]");
    const layer = box ? box.querySelector("[data-play-button]") : null;

    if (layer) {
      layer.classList.add("is-hidden");
    }

    if (!src) {
      return;
    }

    if (video.dataset.ready === "1") {
      video.play().catch(() => {});
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.dataset.ready = "1";
      video.play().catch(() => {});
      return;
    }

    loadHls().then((Hls) => {
      if (Hls && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.dataset.ready = "1";
          video.play().catch(() => {});
        });
      } else {
        video.src = src;
        video.dataset.ready = "1";
        video.play().catch(() => {});
      }
    }).catch(() => {
      video.src = src;
      video.dataset.ready = "1";
      video.play().catch(() => {});
    });
  };

  document.querySelectorAll("[data-play-button]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.player;
      activatePlayer(document.getElementById(id));
    });
  });

  document.querySelectorAll("[data-player-box]").forEach((box) => {
    const video = box.querySelector("video");
    box.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        return;
      }
      if (!video || video.dataset.ready === "1") {
        return;
      }
      activatePlayer(video);
    });
  });
})();
