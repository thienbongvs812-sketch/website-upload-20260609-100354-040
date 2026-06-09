(function () {
  var configElement = document.getElementById('player-config');
  var video = document.querySelector('[data-player="movie"]');
  var playButton = document.querySelector('[data-play-button]');
  if (!configElement || !video || !playButton) {
    return;
  }

  var config = {};
  try {
    config = JSON.parse(configElement.textContent || '{}');
  } catch (error) {
    config = {};
  }

  var src = config.src || '';
  var attached = false;
  var hls = null;

  function attachVideo() {
    if (attached || !src) {
      return;
    }
    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      return;
    }

    video.src = src;
  }

  function playVideo() {
    attachVideo();
    playButton.classList.add('is-hidden');
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        playButton.classList.remove('is-hidden');
      });
    }
  }

  playButton.addEventListener('click', playVideo);
  video.addEventListener('play', function () {
    playButton.classList.add('is-hidden');
  });
  video.addEventListener('pause', function () {
    if (!video.ended) {
      playButton.classList.remove('is-hidden');
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
