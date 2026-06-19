(function () {
    function initMoviePlayer(videoUrl) {
        function boot() {
            var video = document.querySelector('[data-player-video]');
            var triggers = Array.prototype.slice.call(document.querySelectorAll('[data-player-trigger]'));
            if (!video || !videoUrl) {
                return;
            }
            var attached = false;
            var hls = null;
            function attachSource() {
                if (attached) {
                    return;
                }
                attached = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = videoUrl;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(videoUrl);
                    hls.attachMedia(video);
                    return;
                }
                video.src = videoUrl;
            }
            function startPlayback() {
                attachSource();
                triggers.forEach(function (item) {
                    item.hidden = true;
                });
                video.controls = true;
                var play = video.play();
                if (play && typeof play.catch === 'function') {
                    play.catch(function () {});
                }
            }
            triggers.forEach(function (trigger) {
                trigger.addEventListener('click', startPlayback);
            });
            video.addEventListener('click', function () {
                if (video.paused) {
                    startPlayback();
                }
            });
            window.addEventListener('pagehide', function () {
                if (hls && typeof hls.destroy === 'function') {
                    hls.destroy();
                }
            });
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', boot);
            return;
        }
        boot();
    }
    window.initMoviePlayer = initMoviePlayer;
})();
