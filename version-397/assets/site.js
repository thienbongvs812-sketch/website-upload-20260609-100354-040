(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        input && input.focus();
      }
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function restart() {
      window.clearInterval(timer);
      start();
    }

    prev && prev.addEventListener('click', function () {
      showSlide(current - 1);
      restart();
    });

    next && next.addEventListener('click', function () {
      showSlide(current + 1);
      restart();
    });

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
        restart();
      });
    });

    showSlide(0);
    start();
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var buttons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-value]'));
    var localInput = scope.querySelector('[data-local-filter]');
    var selected = '全部';

    function applyFilter() {
      var query = localInput ? localInput.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-type') || '',
          card.getAttribute('data-region') || ''
        ].join(' ').toLowerCase();
        var typeMatch = selected === '全部' || (card.getAttribute('data-type') || '') === selected;
        var queryMatch = !query || text.indexOf(query) !== -1;
        card.style.display = typeMatch && queryMatch ? '' : 'none';
      });
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        selected = button.getAttribute('data-filter-value') || '全部';
        buttons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        applyFilter();
      });
    });

    localInput && localInput.addEventListener('input', applyFilter);
  });

  var searchResults = document.querySelector('[data-search-results]');
  if (searchResults && window.MOVIE_INDEX) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = document.querySelector('[data-search-input]');
    var summary = document.querySelector('[data-search-summary]');

    if (input) {
      input.value = query;
    }

    function createCard(movie) {
      var tags = movie.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return [
        '<article class="movie-card compact">',
        '<a class="poster-link" href="' + movie.url + '">',
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '<span class="poster-badge">' + escapeHtml(movie.year) + '</span>',
        '<span class="play-chip">播放</span>',
        '</a>',
        '<div class="movie-card-body">',
        '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
        '<h2><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h2>',
        '<p>' + escapeHtml(movie.oneLine) + '</p>',
        '<div class="tag-row">' + tags + '</div>',
        '</div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[char];
      });
    }

    var normalized = query.toLowerCase();
    var results = window.MOVIE_INDEX.filter(function (movie) {
      if (!normalized) {
        return false;
      }
      return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags.join(' '), movie.oneLine]
        .join(' ')
        .toLowerCase()
        .indexOf(normalized) !== -1;
    }).slice(0, 120);

    if (!query) {
      summary.textContent = '请输入关键词开始搜索。';
      searchResults.innerHTML = window.MOVIE_INDEX.slice(0, 24).map(createCard).join('');
    } else if (!results.length) {
      summary.textContent = '没有找到匹配内容。';
      searchResults.innerHTML = '';
    } else {
      summary.textContent = '搜索结果：' + query;
      searchResults.innerHTML = results.map(createCard).join('');
    }
  }
})();
