(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var configElement = document.getElementById("media-config");
    var video = document.getElementById("movie-player");
    var shell = document.querySelector("[data-player-shell]");
    var startButton = document.querySelector("[data-player-start]");

    if (!configElement || !video || !shell || !startButton) {
      return;
    }

    var config = null;
    var hls = null;
    var prepared = false;

    try {
      config = JSON.parse(configElement.textContent || "{}");
    } catch (error) {
      config = null;
    }

    if (!config || !config.src) {
      return;
    }

    function prepare() {
      if (prepared) {
        return;
      }
      prepared = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(config.src);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = config.src;
      } else {
        video.src = config.src;
      }
    }

    function play() {
      prepare();
      shell.classList.add("is-playing");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          shell.classList.remove("is-playing");
        });
      }
    }

    startButton.addEventListener("click", function (event) {
      event.preventDefault();
      play();
    });

    video.addEventListener("play", function () {
      shell.classList.add("is-playing");
    });

    video.addEventListener("pause", function () {
      if (!video.ended) {
        shell.classList.remove("is-playing");
      }
    });

    video.addEventListener("ended", function () {
      shell.classList.remove("is-playing");
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  });
})();
