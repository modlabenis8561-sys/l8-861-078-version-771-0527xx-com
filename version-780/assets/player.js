(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function () {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (box) {
            var video = box.querySelector('video');
            var cover = box.querySelector('.player-cover');
            var message = box.querySelector('.player-message');
            var started = false;
            var hls = null;

            function setMessage(text) {
                if (!message) {
                    return;
                }
                message.textContent = text;
                message.classList.toggle('is-visible', Boolean(text));
            }

            function source() {
                return video ? video.getAttribute('data-stream') : '';
            }

            function begin() {
                if (!video || started) {
                    if (video) {
                        video.play().catch(function () {});
                    }
                    return;
                }
                started = true;
                box.classList.add('is-playing');
                var src = source();
                if (!src) {
                    setMessage('播放暂时不可用。');
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                    video.play().catch(function () {});
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setMessage('播放遇到网络波动，请稍后重试。');
                            if (hls) {
                                hls.destroy();
                                hls = null;
                            }
                        }
                    });
                    return;
                }
                video.src = src;
                video.play().catch(function () {
                    setMessage('播放遇到网络波动，请稍后重试。');
                });
            }

            if (cover) {
                cover.addEventListener('click', function (event) {
                    event.preventDefault();
                    begin();
                });
            }
            box.addEventListener('click', function (event) {
                if (event.target === video && started) {
                    return;
                }
                begin();
            });
        });
    });
})();
