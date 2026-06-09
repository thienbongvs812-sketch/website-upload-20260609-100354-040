(function() {
  var mobileToggle = document.querySelector("[data-mobile-toggle]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener("click", function() {
      mobilePanel.classList.toggle("is-open");
    });
  }

  var carousel = document.querySelector("[data-hero-carousel]");
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        var index = Number(dot.getAttribute("data-hero-dot"));
        showSlide(index);
      });
    });

    window.setInterval(function() {
      showSlide(current + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function applyFilters(panel) {
    var root = panel.closest("section") || document;
    var grid = root.querySelector("[data-card-grid]");
    if (!grid) {
      return;
    }
    var queryInput = panel.querySelector("[data-live-search-input]");
    var yearSelect = panel.querySelector("[data-year-filter]");
    var typeSelect = panel.querySelector("[data-type-filter]");
    var query = normalize(queryInput ? queryInput.value : "");
    var year = normalize(yearSelect ? yearSelect.value : "");
    var type = normalize(typeSelect ? typeSelect.value : "");
    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
    var visibleCount = 0;

    cards.forEach(function(card) {
      var haystack = normalize(card.getAttribute("data-search"));
      var cardYear = normalize(card.getAttribute("data-year"));
      var cardType = normalize(card.getAttribute("data-type"));
      var matchesQuery = !query || haystack.indexOf(query) !== -1;
      var matchesYear = !year || cardYear === year;
      var matchesType = !type || cardType === type;
      var visible = matchesQuery && matchesYear && matchesType;
      card.style.display = visible ? "" : "none";
      if (visible) {
        visibleCount += 1;
      }
    });

    var emptyState = root.querySelector("[data-empty-state]");
    if (emptyState) {
      emptyState.classList.toggle("is-visible", visibleCount === 0);
    }
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]")).forEach(function(panel) {
    var controls = panel.querySelectorAll("input, select");
    Array.prototype.slice.call(controls).forEach(function(control) {
      control.addEventListener("input", function() {
        applyFilters(panel);
      });
      control.addEventListener("change", function() {
        applyFilters(panel);
      });
    });
  });

  var params = new URLSearchParams(window.location.search);
  var searchValue = params.get("q");
  if (searchValue) {
    var searchInput = document.querySelector("[data-live-search-input]");
    var panel = document.querySelector("[data-filter-panel]");
    if (searchInput && panel) {
      searchInput.value = searchValue;
      applyFilters(panel);
    }
  }
})();
