(function () {
  var toggle = document.querySelector('.mobile-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var opened = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var activeIndex = 0;
  var heroTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, position) {
      slide.classList.toggle('active', position === activeIndex);
    });
    dots.forEach(function (dot, position) {
      dot.classList.toggle('active', position === activeIndex);
    });
  }

  function startHeroTimer() {
    if (slides.length < 2) {
      return;
    }
    window.clearInterval(heroTimer);
    heroTimer = window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      startHeroTimer();
    });
  });

  showSlide(0);
  startHeroTimer();

  var filterInput = document.querySelector('.page-filter-input');
  var sortSelect = document.querySelector('.page-sort-select');
  var grids = Array.prototype.slice.call(document.querySelectorAll('[data-filter-grid]'));

  function getCards() {
    var cards = [];
    grids.forEach(function (grid) {
      Array.prototype.slice.call(grid.querySelectorAll('.movie-card')).forEach(function (card) {
        cards.push(card);
      });
    });
    return cards;
  }

  function applyFilter() {
    var value = filterInput ? filterInput.value.trim().toLowerCase() : '';
    getCards().forEach(function (card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      card.classList.toggle('hidden-by-filter', value !== '' && text.indexOf(value) === -1);
    });
  }

  function applySort() {
    if (!sortSelect) {
      return;
    }
    grids.forEach(function (grid) {
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
      var mode = sortSelect.value;
      if (mode === 'default') {
        cards.sort(function (a, b) {
          return Number(a.getAttribute('data-order')) - Number(b.getAttribute('data-order'));
        });
      } else {
        cards.sort(function (a, b) {
          var ay = Number(a.getAttribute('data-year') || 0);
          var by = Number(b.getAttribute('data-year') || 0);
          return mode === 'new' ? by - ay : ay - by;
        });
      }
      cards.forEach(function (card) {
        grid.appendChild(card);
      });
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilter);
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      applySort();
      applyFilter();
    });
  }

  var searchPageInput = document.querySelector('[data-search-page-input]');
  if (searchPageInput) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    searchPageInput.value = q;
    if (filterInput) {
      filterInput.value = q;
      applyFilter();
    }
  }
})();
