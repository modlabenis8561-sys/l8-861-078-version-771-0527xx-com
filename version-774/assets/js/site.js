(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-nav-links]');
    if (menuButton && nav) {
        menuButton.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');
    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dotsBox = slider.querySelector('[data-slider-dots]');
        var prev = slider.querySelector('[data-slider-prev]');
        var next = slider.querySelector('[data-slider-next]');
        var current = 0;
        var dots = [];

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        if (dotsBox) {
            slides.forEach(function (_, index) {
                var dot = document.createElement('button');
                dot.type = 'button';
                dot.setAttribute('aria-label', '切换推荐影片');
                dot.addEventListener('click', function () {
                    show(index);
                });
                dotsBox.appendChild(dot);
                dots.push(dot);
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
            });
        }

        show(0);
        window.setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    var filterPanel = document.querySelector('[data-filter-panel]');
    if (filterPanel) {
        var searchInput = filterPanel.querySelector('[data-filter-search]');
        var regionSelect = filterPanel.querySelector('[data-filter-region]');
        var typeSelect = filterPanel.querySelector('[data-filter-type]');
        var yearSelect = filterPanel.querySelector('[data-filter-year]');
        var resetButton = filterPanel.querySelector('[data-filter-reset]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        var empty = document.querySelector('[data-empty-state]');

        function normalized(value) {
            return String(value || '').trim().toLowerCase();
        }

        function matchCard(card) {
            var text = normalized(card.getAttribute('data-title') + ' ' + card.getAttribute('data-genre') + ' ' + card.textContent);
            var query = normalized(searchInput ? searchInput.value : '');
            var region = regionSelect ? regionSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var year = yearSelect ? yearSelect.value : '';
            var ok = true;

            if (query) {
                ok = ok && text.indexOf(query) !== -1;
            }
            if (region) {
                ok = ok && card.getAttribute('data-region') === region;
            }
            if (type) {
                ok = ok && card.getAttribute('data-type') === type;
            }
            if (year) {
                ok = ok && card.getAttribute('data-year') === year;
            }

            return ok;
        }

        function applyFilter() {
            var visible = 0;
            cards.forEach(function (card) {
                var matched = matchCard(card);
                card.classList.toggle('hide-card', !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        if (resetButton) {
            resetButton.addEventListener('click', function () {
                if (searchInput) searchInput.value = '';
                if (regionSelect) regionSelect.value = '';
                if (typeSelect) typeSelect.value = '';
                if (yearSelect) yearSelect.value = '';
                applyFilter();
            });
        }

        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q && searchInput) {
            searchInput.value = q;
        }
        applyFilter();
    }

    var heroForm = document.querySelector('[data-hero-search]');
    if (heroForm) {
        heroForm.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = heroForm.querySelector('input');
            var value = input ? input.value.trim() : '';
            var target = heroForm.getAttribute('action') || 'search.html';
            window.location.href = target + (value ? '?q=' + encodeURIComponent(value) : '');
        });
    }
})();
