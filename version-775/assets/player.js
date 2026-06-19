(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (wrap) {
    var video = wrap.querySelector('video');
    var overlay = wrap.querySelector('.player-overlay');
    var stream = wrap.getAttribute('data-stream');
    var started = false;
    var hls = null;

    function begin() {
      if (!video || !stream) {
        return;
      }

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      if (started) {
        video.play().catch(function () {});
        return;
      }

      started = true;
      video.controls = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && hls) {
            hls.destroy();
            video.src = stream;
            video.play().catch(function () {});
          }
        });
        video.play().catch(function () {});
        return;
      }

      video.src = stream;
      video.play().catch(function () {});
    }

    if (overlay) {
      overlay.addEventListener('click', begin);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!started || video.paused) {
          begin();
        } else {
          video.pause();
        }
      });
    }
  });
})();
