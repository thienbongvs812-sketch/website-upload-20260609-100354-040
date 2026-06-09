function initMoviePlayer(source) {
  var video = document.getElementById('moviePlayer');
  var button = document.getElementById('playerAction');
  var hls = null;

  if (!video || !source) {
    return;
  }

  function attachSource() {
    if (video.getAttribute('data-ready') === '1') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }

    video.setAttribute('data-ready', '1');
  }

  function play() {
    attachSource();
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  function toggle() {
    if (video.paused) {
      play();
    } else {
      video.pause();
    }
  }

  if (button) {
    button.addEventListener('click', play);
  }

  video.addEventListener('click', toggle);
  video.addEventListener('play', function () {
    if (button) {
      button.classList.add('is-hidden');
    }
  });
  video.addEventListener('pause', function () {
    if (button) {
      button.classList.remove('is-hidden');
    }
  });
  video.addEventListener('ended', function () {
    if (button) {
      button.classList.remove('is-hidden');
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });

  attachSource();
}
