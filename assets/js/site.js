(function () {
  const menuButton = document.querySelector('.mobile-menu-button');
  const mobileNav = document.querySelector('#mobileNav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      const isOpen = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      const shell = image.closest('.poster-shell, .hero-slide, .hero-mini-card, .player-cover');
      if (shell) {
        shell.classList.add('image-soft');
      }
      image.style.display = 'none';
    }, { once: true });
  });

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const nextButton = hero.querySelector('[data-hero-next]');
    const prevButton = hero.querySelector('[data-hero-prev]');
    let current = slides.findIndex(function (slide) {
      return slide.classList.contains('is-active');
    });

    if (current < 0) {
      current = 0;
    }

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        show(current + 1);
      });
    }

    if (prevButton) {
      prevButton.addEventListener('click', function () {
        show(current - 1);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }
  });

  const params = new URLSearchParams(window.location.search);
  const query = params.get('q') || '';
  const searchInputs = Array.from(document.querySelectorAll('[data-search-input]'));
  const selectFilters = Array.from(document.querySelectorAll('[data-select-filter]'));

  searchInputs.forEach(function (input) {
    if (query) {
      input.value = query;
    }
  });

  function getSearchText(card) {
    return [
      card.dataset.title || '',
      card.dataset.region || '',
      card.dataset.type || '',
      card.dataset.year || '',
      card.dataset.tags || '',
      card.textContent || ''
    ].join(' ').toLowerCase();
  }

  function applyFilters() {
    const cards = Array.from(document.querySelectorAll('.searchable-card'));
    if (!cards.length) {
      return;
    }

    const terms = searchInputs.map(function (input) {
      return input.value.trim().toLowerCase();
    }).filter(Boolean);

    const selected = {};
    selectFilters.forEach(function (select) {
      const key = select.getAttribute('data-select-filter');
      if (key && select.value) {
        selected[key] = select.value;
      }
    });

    let visible = 0;
    cards.forEach(function (card) {
      const text = getSearchText(card);
      const matchesText = terms.every(function (term) {
        return text.indexOf(term) !== -1;
      });
      const matchesSelect = Object.keys(selected).every(function (key) {
        return (card.dataset[key] || '').indexOf(selected[key]) !== -1;
      });
      const shouldShow = matchesText && matchesSelect;
      card.classList.toggle('is-hidden', !shouldShow);
      if (shouldShow) {
        visible += 1;
      }
    });

    let noResults = document.querySelector('.no-results');
    if (!noResults && cards[0] && cards[0].parentElement) {
      noResults = document.createElement('div');
      noResults.className = 'no-results';
      noResults.textContent = '没有匹配的影片，请换个关键词试试。';
      cards[0].parentElement.insertAdjacentElement('beforebegin', noResults);
    }
    if (noResults) {
      noResults.classList.toggle('is-visible', visible === 0);
    }
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', applyFilters);
  });

  selectFilters.forEach(function (select) {
    select.addEventListener('change', applyFilters);
  });

  if (query || selectFilters.length) {
    applyFilters();
  }
})();
