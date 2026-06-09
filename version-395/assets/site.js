(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (input && input.value.trim() === '') {
        event.preventDefault();
        window.location.href = form.getAttribute('action') || './search.html';
      }
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;
  var timer;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  function startHero() {
    if (!slides.length) {
      return;
    }

    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  document.querySelectorAll('[data-hero-next]').forEach(function (button) {
    button.addEventListener('click', function () {
      showSlide(current + 1);
      startHero();
    });
  });

  document.querySelectorAll('[data-hero-prev]').forEach(function (button) {
    button.addEventListener('click', function () {
      showSlide(current - 1);
      startHero();
    });
  });

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      startHero();
    });
  });

  showSlide(0);
  startHero();

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-card-filter]'));

  function applyFilter(value) {
    var query = (value || '').trim().toLowerCase();
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
    var visible = 0;

    cards.forEach(function (card) {
      var content = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-tags') || '',
        card.getAttribute('data-year') || ''
      ].join(' ').toLowerCase();
      var matched = query === '' || content.indexOf(query) !== -1;

      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    document.querySelectorAll('[data-empty-state]').forEach(function (node) {
      node.style.display = visible === 0 ? 'block' : 'none';
    });
  }

  filterInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      applyFilter(input.value);
    });
  });

  var params = new URLSearchParams(window.location.search);
  var q = params.get('q') || '';
  if (q) {
    filterInputs.forEach(function (input) {
      input.value = q;
    });
    applyFilter(q);
  }
})();
