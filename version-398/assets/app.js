(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initGridTools() {
    var grid = qs('[data-card-grid]');
    if (!grid) {
      return;
    }
    var search = qs('[data-grid-search]');
    var sort = qs('[data-grid-sort]');
    var cards = qsa('.movie-card', grid);

    function apply() {
      var keyword = search ? search.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre')
        ].join(' ').toLowerCase();
        card.style.display = !keyword || text.indexOf(keyword) !== -1 ? '' : 'none';
      });
    }

    function sortCards() {
      if (!sort) {
        return;
      }
      var value = sort.value;
      var sorted = cards.slice();
      sorted.sort(function (a, b) {
        if (value === 'year') {
          return (Number(b.getAttribute('data-year')) || 0) - (Number(a.getAttribute('data-year')) || 0);
        }
        if (value === 'title') {
          return String(a.getAttribute('data-title') || '').localeCompare(String(b.getAttribute('data-title') || ''), 'zh-Hans-CN');
        }
        return 0;
      });
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    if (search) {
      search.addEventListener('input', apply);
    }
    if (sort) {
      sort.addEventListener('change', function () {
        sortCards();
        apply();
      });
    }
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '<a href="' + escapeHtml(movie.url) + '">',
      '<div class="card-poster">',
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="poster-chip">' + escapeHtml(movie.category) + '</span>',
      '<span class="poster-year">' + escapeHtml(movie.year) + '</span>',
      '</div>',
      '<div class="card-content">',
      '<h2>' + escapeHtml(movie.title) + '</h2>',
      '<p>' + escapeHtml(movie.description) + '</p>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearchPage() {
    var panel = qs('[data-search-page]');
    if (!panel || !window.__MOVIES__) {
      return;
    }
    var input = qs('[data-search-input]', panel);
    var form = qs('[data-search-form]', panel);
    var results = qs('[data-search-results]', panel);
    var sort = qs('[data-search-sort]', panel);
    var chips = qsa('[data-search-category]', panel);
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    if (input) {
      input.value = initial;
    }

    function scoreMovie(movie, keyword) {
      var haystack = [movie.title, movie.year, movie.region, movie.genre, movie.category, movie.description, (movie.tags || []).join(' ')].join(' ').toLowerCase();
      if (!keyword) {
        return 1;
      }
      if (String(movie.title).toLowerCase().indexOf(keyword) !== -1) {
        return 5;
      }
      if (haystack.indexOf(keyword) !== -1) {
        return 3;
      }
      return 0;
    }

    function render() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var list = window.__MOVIES__.map(function (movie) {
        return { movie: movie, score: scoreMovie(movie, keyword) };
      }).filter(function (item) {
        return item.score > 0;
      });
      var sortValue = sort ? sort.value : 'relevance';
      list.sort(function (a, b) {
        if (sortValue === 'year') {
          return (Number(b.movie.year) || 0) - (Number(a.movie.year) || 0);
        }
        if (sortValue === 'views') {
          return (Number(b.movie.views) || 0) - (Number(a.movie.views) || 0);
        }
        return b.score - a.score || (Number(b.movie.views) || 0) - (Number(a.movie.views) || 0);
      });
      var page = list.slice(0, 120);
      if (!page.length) {
        results.innerHTML = '<div class="search-empty">未找到相关影片</div>';
        return;
      }
      results.innerHTML = page.map(function (item) {
        return movieCard(item.movie);
      }).join('');
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var value = input ? input.value.trim() : '';
        var url = value ? 'search.html?q=' + encodeURIComponent(value) : 'search.html';
        window.history.replaceState(null, '', url);
        render();
      });
    }
    if (input) {
      input.addEventListener('input', render);
    }
    if (sort) {
      sort.addEventListener('change', render);
    }
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        if (input) {
          input.value = chip.getAttribute('data-search-category') || '';
          render();
        }
      });
    });
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initGridTools();
    initSearchPage();
  });
})();
