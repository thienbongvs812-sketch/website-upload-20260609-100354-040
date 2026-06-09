import { H as Hls } from './hls-vendor-dru42stk.js';

var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

var setStatus = function (box, text) {
  var status = box.querySelector('[data-player-status]');

  if (status) {
    status.textContent = text;
  }
};

var startPlayer = function (box) {
  var video = box.querySelector('video');
  var cover = box.querySelector('[data-player-cover]');
  var source = box.getAttribute('data-source');

  if (!video || !source) {
    setStatus(box, '播放源暂不可用');
    return;
  }

  if (cover) {
    cover.classList.add('is-hidden');
  }

  setStatus(box, '正在加载播放源');

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    video.play().catch(function () {
      setStatus(box, '请点击播放器继续播放');
    });
    return;
  }

  if (Hls && Hls.isSupported()) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hls.loadSource(source);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      setStatus(box, '播放源已就绪');
      video.play().catch(function () {
        setStatus(box, '请点击播放器继续播放');
      });
    });

    hls.on(Hls.Events.ERROR, function (event, data) {
      if (!data || !data.fatal) {
        return;
      }

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        setStatus(box, '网络波动，正在重新加载');
        hls.startLoad();
      } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        setStatus(box, '媒体播放异常，正在恢复');
        hls.recoverMediaError();
      } else {
        setStatus(box, '播放源暂时无法加载');
        hls.destroy();
      }
    });

    video.addEventListener('ended', function () {
      setStatus(box, '播放结束');
    });

    box._hlsInstance = hls;
    return;
  }

  setStatus(box, '当前浏览器不支持 HLS 播放');
};

players.forEach(function (box) {
  var cover = box.querySelector('[data-player-cover]');
  var video = box.querySelector('video');

  if (cover) {
    cover.addEventListener('click', function () {
      startPlayer(box);
    });
  }

  if (video) {
    video.addEventListener('play', function () {
      if (!video.src) {
        startPlayer(box);
      }
    });
  }
});
