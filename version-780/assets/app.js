(function () {
    var ready = function (fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    };

    ready(function () {
        var menuToggle = document.querySelector('[data-menu-toggle]');
        var navLinks = document.querySelector('[data-nav-links]');
        if (menuToggle && navLinks) {
            menuToggle.addEventListener('click', function () {
                navLinks.classList.toggle('is-open');
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
        var prev = document.querySelector('[data-hero-prev]');
        var next = document.querySelector('[data-hero-next]');
        var active = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === active);
            });
        }

        function startHero() {
            if (timer || slides.length < 2) {
                return;
            }
            timer = window.setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        }

        function resetHero() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
            startHero();
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                resetHero();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(active - 1);
                resetHero();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(active + 1);
                resetHero();
            });
        }

        showSlide(0);
        startHero();

        var heroSearch = document.querySelector('[data-hero-search]');
        if (heroSearch) {
            heroSearch.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = heroSearch.querySelector('input[name="q"]');
                var query = input ? input.value.trim() : '';
                var target = './search.html';
                if (query) {
                    target += '?q=' + encodeURIComponent(query);
                }
                window.location.href = target;
            });
        }

        var filterHosts = Array.prototype.slice.call(document.querySelectorAll('[data-filter-host]'));
        filterHosts.forEach(function (host) {
            var searchInput = host.querySelector('[data-filter-search]');
            var genreSelect = host.querySelector('[data-filter-genre]');
            var typeSelect = host.querySelector('[data-filter-type]');
            var yearSelect = host.querySelector('[data-filter-year]');
            var cards = Array.prototype.slice.call(host.querySelectorAll('[data-card]'));
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q') || '';
            if (searchInput && query) {
                searchInput.value = query;
            }

            function selectedValue(el) {
                return el ? el.value.trim().toLowerCase() : '';
            }

            function textValue(el) {
                return el ? el.value.trim().toLowerCase() : '';
            }

            function filterCards() {
                var keyword = textValue(searchInput);
                var genre = selectedValue(genreSelect);
                var type = selectedValue(typeSelect);
                var year = selectedValue(yearSelect);
                cards.forEach(function (card) {
                    var hay = [
                        card.getAttribute('data-title') || '',
                        card.getAttribute('data-genre') || '',
                        card.getAttribute('data-region') || '',
                        card.getAttribute('data-type') || '',
                        card.getAttribute('data-year') || '',
                        card.textContent || ''
                    ].join(' ').toLowerCase();
                    var ok = true;
                    if (keyword && hay.indexOf(keyword) === -1) {
                        ok = false;
                    }
                    if (genre && (card.getAttribute('data-genre') || '').toLowerCase().indexOf(genre) === -1) {
                        ok = false;
                    }
                    if (type && (card.getAttribute('data-type') || '').toLowerCase().indexOf(type) === -1) {
                        ok = false;
                    }
                    if (year && (card.getAttribute('data-year') || '').toLowerCase() !== year) {
                        ok = false;
                    }
                    card.style.display = ok ? '' : 'none';
                });
            }

            [searchInput, genreSelect, typeSelect, yearSelect].forEach(function (el) {
                if (el) {
                    el.addEventListener('input', filterCards);
                    el.addEventListener('change', filterCards);
                }
            });

            filterCards();
        });
    });
})();
