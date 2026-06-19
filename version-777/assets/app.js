(function () {
  function selectAll(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = selectAll("[data-hero-slide]", slider);
    var dots = selectAll("[data-hero-dot]", slider);
    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  function setupFilters() {
    var input = document.querySelector("[data-search-input]");
    var typeSelect = document.querySelector("[data-filter-type]");
    var yearSelect = document.querySelector("[data-filter-year]");
    var cards = selectAll("[data-movie-card]");
    if (!cards.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q && input) {
      input.value = q;
    }

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var selectedType = typeSelect ? typeSelect.value : "";
      var selectedYear = yearSelect ? yearSelect.value : "";

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var cardType = card.getAttribute("data-type") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedType = !selectedType || cardType === selectedType;
        var matchedYear = !selectedYear || cardYear === selectedYear;
        card.classList.toggle("hidden", !(matchedKeyword && matchedType && matchedYear));
      });
    }

    [input, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  }

  window.initMoviePlayer = function (playUrl) {
    var video = document.getElementById("movie-player");
    var cover = document.getElementById("player-cover");
    var triggers = selectAll("[data-play-button]");
    var loaded = false;
    var hlsInstance = null;

    if (!video || !playUrl) {
      return;
    }

    function attach() {
      if (!loaded) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = playUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(playUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = playUrl;
        }
        loaded = true;
      }
      video.controls = true;
      if (cover) {
        cover.classList.add("is-hidden");
        cover.setAttribute("aria-hidden", "true");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          video.controls = true;
        });
      }
    }

    triggers.forEach(function (trigger) {
      trigger.addEventListener("click", attach);
    });

    if (cover) {
      cover.addEventListener("click", attach);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        attach();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
