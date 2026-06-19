(function () {
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var previous = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var active = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(active + 1);
            }, 5000);
        }

        if (previous) {
            previous.addEventListener('click', function () {
                showSlide(active - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(active + 1);
                restart();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                restart();
            });
        });

        showSlide(0);
        restart();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

        panels.forEach(function (panel) {
            var scope = panel.closest('main') || document;
            var input = panel.querySelector('[data-filter-input]');
            var type = panel.querySelector('[data-filter-type]');
            var year = panel.querySelector('[data-filter-year]');
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
            var status = scope.querySelector('[data-result-status]');
            var empty = scope.querySelector('[data-no-results]');

            function applyFilter() {
                var keyword = normalize(input && input.value);
                var typeValue = normalize(type && type.value);
                var yearValue = normalize(year && year.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var text = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-tags'),
                        card.textContent
                    ].join(' '));
                    var cardType = normalize(card.getAttribute('data-type'));
                    var cardYear = normalize(card.getAttribute('data-year'));
                    var matched = true;

                    if (keyword && text.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    if (typeValue && cardType.indexOf(typeValue) === -1) {
                        matched = false;
                    }
                    if (yearValue && cardYear !== yearValue) {
                        matched = false;
                    }

                    card.style.display = matched ? '' : 'none';
                    if (matched) {
                        visible += 1;
                    }
                });

                if (status) {
                    status.style.display = 'block';
                    status.textContent = '当前显示 ' + visible + ' 部影片';
                }
                if (empty) {
                    empty.style.display = visible === 0 ? 'block' : 'none';
                }
            }

            [input, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', applyFilter);
                    control.addEventListener('change', applyFilter);
                }
            });
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

        players.forEach(function (shell) {
            var video = shell.querySelector('video[data-hls-src]');
            var overlay = shell.querySelector('[data-player-overlay]');
            var source = video ? video.getAttribute('data-hls-src') : '';
            var hls = null;

            if (!video || !source) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }

            function hideOverlay() {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
            }

            function showOverlay() {
                if (overlay && video.paused) {
                    overlay.classList.remove('is-hidden');
                }
            }

            if (overlay) {
                overlay.addEventListener('click', function () {
                    var playPromise = video.play();
                    if (playPromise && typeof playPromise.then === 'function') {
                        playPromise.then(hideOverlay).catch(showOverlay);
                    } else {
                        hideOverlay();
                    }
                });
            }

            video.addEventListener('play', hideOverlay);
            video.addEventListener('pause', showOverlay);
            video.addEventListener('ended', showOverlay);
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupHero();
        setupFilters();
        setupPlayers();
    });
}());
