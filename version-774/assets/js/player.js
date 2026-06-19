(function () {
    function initializePlayer(shell) {
        var video = shell.querySelector('video');
        var cover = shell.querySelector('[data-player-cover]');
        var button = shell.querySelector('[data-play-button]');
        if (!video) return;

        var stream = video.getAttribute('data-stream');
        var started = false;
        var hlsInstance = null;

        function bindStream() {
            if (started || !stream) return;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else {
                video.src = stream;
            }
            started = true;
        }

        function play() {
            bindStream();
            shell.classList.add('is-playing');
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', play);
        }
        if (cover) {
            cover.addEventListener('click', play);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initializePlayer);
})();
