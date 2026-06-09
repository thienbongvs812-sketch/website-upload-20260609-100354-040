(function () {
  function bindPlayer(wrapper) {
    var video = wrapper.querySelector('video[data-src]');
    var button = wrapper.querySelector('[data-play-button]');
    var message = wrapper.querySelector('[data-player-message]');
    var source = video ? video.getAttribute('data-src') : '';
    var hls = null;
    var initialized = false;

    function showMessage(text) {
      if (!message) {
        return;
      }
      message.textContent = text;
      message.classList.add('show');
      window.setTimeout(function () {
        message.classList.remove('show');
      }, 3600);
    }

    function initialize() {
      if (!video || !source || initialized) {
        return Promise.resolve();
      }
      initialized = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            showMessage('网络连接异常，正在重新加载');
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            showMessage('媒体播放异常，正在恢复');
            hls.recoverMediaError();
          } else {
            showMessage('播放暂不可用');
          }
        });
        return Promise.resolve();
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return Promise.resolve();
      }

      showMessage('当前浏览器不支持 HLS 播放');
      return Promise.resolve();
    }

    function play() {
      initialize().then(function () {
        if (!video) {
          return;
        }
        wrapper.classList.add('playing');
        video.play().catch(function () {
          wrapper.classList.remove('playing');
          showMessage('请再次点击播放');
        });
      });
    }

    button && button.addEventListener('click', play);
    video && video.addEventListener('click', function () {
      if (!initialized || video.paused) {
        play();
      }
    });
    video && video.addEventListener('play', function () {
      wrapper.classList.add('playing');
    });
    video && video.addEventListener('pause', function () {
      if (!video.ended) {
        wrapper.classList.remove('playing');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.querySelectorAll('[data-player]').forEach(bindPlayer);
})();
