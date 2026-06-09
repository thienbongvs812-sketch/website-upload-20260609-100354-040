(function () {
  function initPlayer(shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.player-overlay');
    if (!video || !button) {
      return;
    }
    var source = video.getAttribute('data-stream');
    var ready = false;
    var hls = null;

    function markPlaying() {
      shell.classList.add('is-playing');
    }

    function loadAndPlay() {
      if (!source) {
        return;
      }
      if (ready) {
        video.play().then(markPlaying).catch(function () {});
        return;
      }
      ready = true;
      var Hls = window.Hls;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          video.play().then(markPlaying).catch(function () {});
        }, { once: true });
        video.load();
        return;
      }
      if (Hls && Hls.isSupported()) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: true, backBufferLength: 90 });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play().then(markPlaying).catch(function () {});
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            return;
          }
          if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            return;
          }
          hls.destroy();
          video.src = source;
        });
        return;
      }
      video.src = source;
      video.play().then(markPlaying).catch(function () {});
    }

    button.addEventListener('click', function (event) {
      event.preventDefault();
      loadAndPlay();
    });
    video.addEventListener('click', function () {
      if (video.paused) {
        loadAndPlay();
      }
    });
    video.addEventListener('play', markPlaying);
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
  });
})();
