(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
            return;
        }
        callback();
    }

    function setupMenu() {
        var button = document.querySelector('.nav-toggle');
        var nav = document.querySelector('.main-nav');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            var open = nav.classList.toggle('open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        if (slides.length < 2) {
            return;
        }
        var active = 0;
        var timer;
        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5600);
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
        start();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function setupFilters() {
        var sections = Array.prototype.slice.call(document.querySelectorAll('[data-filter-section]'));
        sections.forEach(function (section) {
            var input = section.querySelector('[data-search-input]');
            var chips = Array.prototype.slice.call(section.querySelectorAll('[data-filter-value]'));
            var cards = Array.prototype.slice.call(section.querySelectorAll('[data-card]'));
            var filterValue = '全部';
            function apply() {
                var query = normalize(input ? input.value : '');
                var activeFilter = normalize(filterValue === '全部' ? '' : filterValue);
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-search') || card.textContent);
                    var queryMatch = !query || text.indexOf(query) !== -1;
                    var filterMatch = !activeFilter || text.indexOf(activeFilter) !== -1;
                    card.classList.toggle('is-hidden', !(queryMatch && filterMatch));
                });
            }
            if (input) {
                input.addEventListener('input', apply);
            }
            chips.forEach(function (chip) {
                chip.addEventListener('click', function () {
                    filterValue = chip.getAttribute('data-filter-value') || '全部';
                    chips.forEach(function (item) {
                        item.classList.toggle('active', item === chip);
                    });
                    apply();
                });
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
