(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMenu() {
    var button = qs('[data-menu-toggle]');
    var menu = qs('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      button.classList.toggle('is-open');
      menu.classList.toggle('is-open');
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
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
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
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
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

  function fillSelects(box) {
    var cards = qsa('.movie-card', box.parentNode);
    var regionSelect = qs('[data-region-filter]', box);
    var yearSelect = qs('[data-year-filter]', box);
    var regions = {};
    var years = {};

    cards.forEach(function (card) {
      var region = card.getAttribute('data-region') || '';
      var year = card.getAttribute('data-year') || '';
      if (region) {
        regions[region] = true;
      }
      if (year) {
        years[year] = true;
      }
    });

    if (regionSelect && regionSelect.children.length === 1) {
      Object.keys(regions).sort().forEach(function (region) {
        var option = document.createElement('option');
        option.value = region;
        option.textContent = region;
        regionSelect.appendChild(option);
      });
    }

    if (yearSelect && yearSelect.children.length === 1) {
      Object.keys(years).sort(function (a, b) {
        return Number(b) - Number(a);
      }).forEach(function (year) {
        var option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
      });
    }
  }

  function setupFilters() {
    qsa('[data-filter-box]').forEach(function (box) {
      var input = qs('[data-card-filter]', box);
      var regionSelect = qs('[data-region-filter]', box);
      var yearSelect = qs('[data-year-filter]', box);
      var grid = qs('[data-filter-grid]', box.parentNode);
      var cards = qsa('.movie-card', grid || document);
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q') || '';

      fillSelects(box);

      if (input && query) {
        input.value = query;
      }

      function apply() {
        var keyword = normalize(input ? input.value : '');
        var region = regionSelect ? regionSelect.value : '';
        var year = yearSelect ? yearSelect.value : '';

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-year'),
            card.getAttribute('data-tags')
          ].join(' '));
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchRegion = !region || card.getAttribute('data-region') === region;
          var matchYear = !year || card.getAttribute('data-year') === year;
          card.hidden = !(matchKeyword && matchRegion && matchYear);
        });
      }

      [input, regionSelect, yearSelect].forEach(function (item) {
        if (item) {
          item.addEventListener('input', apply);
          item.addEventListener('change', apply);
        }
      });

      apply();
    });
  }

  function setupSearchRedirect() {
    qsa('[data-search-redirect]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = qs('input[name="q"]', form);
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = './search.html';
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearchRedirect();
  });
})();
