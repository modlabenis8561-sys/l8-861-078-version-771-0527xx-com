(function () {
  const video = document.getElementById('movie-player');
  const cover = document.getElementById('player-cover');
  const wrap = document.getElementById('playerWrap');
  const streamUrl = window.__STREAM_URL__;
  let attached = false;
  let hlsInstance = null;

  if (!video || !cover || !wrap || !streamUrl) {
    return;
  }

  function attachStream() {
    if (attached) {
      return;
    }
    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  }

  function startPlayback() {
    attachStream();
    wrap.classList.add('is-playing');
    const playTask = video.play();
    if (playTask && typeof playTask.catch === 'function') {
      playTask.catch(function () {});
    }
  }

  cover.addEventListener('click', startPlayback);
  video.addEventListener('click', function () {
    if (!attached || video.paused) {
      startPlayback();
    }
  });
  video.addEventListener('play', function () {
    wrap.classList.add('is-playing');
  });
  video.addEventListener('ended', function () {
    wrap.classList.remove('is-playing');
  });
  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
