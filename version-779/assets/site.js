(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var activeSlide = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeSlide = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeSlide);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeSlide);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(activeSlide + 1);
      }, 5200);
    }

    var input = document.querySelector("[data-search-input]");
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
    var emptyState = document.querySelector("[data-empty-state]");
    var activeFilter = "all";

    function normalize(value) {
      return (value || "").toString().toLowerCase().trim();
    }

    function filterCards() {
      var query = normalize(input ? input.value : "");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-title"));
        var type = normalize(card.getAttribute("data-type"));
        var region = normalize(card.getAttribute("data-region"));
        var category = normalize(card.getAttribute("data-category"));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesFilter = activeFilter === "all" || type.indexOf(activeFilter) !== -1 || region.indexOf(activeFilter) !== -1 || category.indexOf(activeFilter) !== -1;
        var visible = matchesQuery && matchesFilter;

        card.classList.toggle("hidden-card", !visible);
        if (visible) {
          shown += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("is-visible", shown === 0);
      }
    }

    if (input) {
      input.addEventListener("input", filterCards);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("is-active");
        });
        chip.classList.add("is-active");
        activeFilter = normalize(chip.getAttribute("data-filter-chip"));
        filterCards();
      });
    });

    filterCards();

    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(function (player) {
      var video = player.querySelector("video");
      var layer = player.querySelector("[data-play-layer]");
      var url = player.getAttribute("data-play-url");
      var loaded = false;

      function startVideo() {
        if (!video || !url) {
          return;
        }

        if (!loaded) {
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
          } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls();
            hls.loadSource(url);
            hls.attachMedia(video);
            player._hls = hls;
          } else {
            video.src = url;
          }
          loaded = true;
        }

        video.controls = true;
        if (layer) {
          layer.hidden = true;
        }
        var playResult = video.play();
        if (playResult && typeof playResult.catch === "function") {
          playResult.catch(function () {});
        }
      }

      if (layer) {
        layer.addEventListener("click", startVideo);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (!loaded) {
            startVideo();
          }
        });
      }
    });
  });
})();
