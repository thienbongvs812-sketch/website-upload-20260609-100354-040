(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = qs('[data-nav-toggle]');
    var nav = qs('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    show(0);
    restart();
  }

  function setupSearchForms() {
    qsa('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = qs('input[type="search"]', form);
        if (!input) {
          return;
        }
        var value = input.value.trim();
        if (!value) {
          event.preventDefault();
          input.focus();
        }
      });
    });
  }

  function setupFilters() {
    var query = new URLSearchParams(window.location.search).get('q') || '';
    qsa('[data-filter-scope]').forEach(function (scope) {
      var input = qs('[data-local-search-input]', scope);
      var yearSelect = qs('[data-filter-year]', scope);
      var typeSelect = qs('[data-filter-type]', scope);
      var section = scope.parentElement || document;
      var cards = qsa('[data-movie-card]', section);
      if (input && query) {
        input.value = query;
      }

      function update() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var year = yearSelect ? yearSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search') || '').toLowerCase();
          var cardYear = card.getAttribute('data-year') || '';
          var cardType = card.getAttribute('data-type') || '';
          var matchKeyword = !keyword || text.indexOf(keyword) > -1;
          var matchYear = !year || cardYear === year;
          var matchType = !type || cardType.indexOf(type) > -1;
          card.classList.toggle('is-hidden', !(matchKeyword && matchYear && matchType));
        });
      }

      if (input) {
        input.addEventListener('input', update);
      }
      if (yearSelect) {
        yearSelect.addEventListener('change', update);
      }
      if (typeSelect) {
        typeSelect.addEventListener('change', update);
      }
      update();
    });
  }

  function setupPlayers() {
    qsa('.movie-player').forEach(function (player) {
      var video = qs('video', player);
      var button = qs('.player-button', player);
      var status = qs('.player-status', player);
      if (!video || !button) {
        return;
      }
      var stream = video.getAttribute('data-stream');
      var prepared = false;
      var hlsInstance = null;

      function setStatus(text) {
        if (status) {
          status.textContent = text || '';
        }
      }

      function prepare() {
        if (prepared) {
          return true;
        }
        if (!stream) {
          setStatus('视频加载失败，请稍后再试');
          return false;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          prepared = true;
          return true;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus('视频加载失败，请稍后再试');
            }
          });
          prepared = true;
          return true;
        }
        setStatus('当前环境暂不支持播放');
        return false;
      }

      function play() {
        if (!prepare()) {
          return;
        }
        video.controls = true;
        player.classList.add('is-playing');
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            setStatus('点击视频继续播放');
          });
        }
      }

      button.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (!prepared) {
          play();
          return;
        }
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });
      video.addEventListener('playing', function () {
        player.classList.add('is-playing');
        setStatus('');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          player.classList.remove('is-playing');
        }
      });
      video.addEventListener('ended', function () {
        player.classList.remove('is-playing');
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupSearchForms();
    setupFilters();
    setupPlayers();
  });
})();
