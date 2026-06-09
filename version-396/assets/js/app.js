(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input) {
          return;
        }
        var value = input.value.trim();
        if (!value) {
          return;
        }
        event.preventDefault();
        window.location.href = "./search.html?q=" + encodeURIComponent(value);
      });
    });

    var slider = document.querySelector("[data-hero-slider]");
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var prev = slider.querySelector("[data-hero-prev]");
      var next = slider.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function showSlide(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          showSlide(index + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          showSlide(index + 1);
          start();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
          start();
        });
      });

      slider.addEventListener("mouseenter", stop);
      slider.addEventListener("mouseleave", start);
      showSlide(0);
      start();
    }

    document.querySelectorAll("[data-filter-list]").forEach(function (list) {
      var section = list.closest(".content-section") || document;
      var queryInput = section.querySelector("[data-filter-query]");
      var categorySelect = section.querySelector("[data-filter-category]");
      var yearSelect = section.querySelector("[data-filter-year]");
      var typeSelect = section.querySelector("[data-filter-type]");
      var sortSelect = section.querySelector("[data-filter-sort]");
      var emptyState = section.querySelector("[data-empty-state]");
      var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q") || "";

      if (queryInput && initialQuery) {
        queryInput.value = initialQuery;
      }

      function textOf(card) {
        return [
          card.getAttribute("data-title") || "",
          card.getAttribute("data-tags") || "",
          card.getAttribute("data-category") || "",
          card.getAttribute("data-year") || "",
          card.getAttribute("data-type") || "",
          card.textContent || ""
        ].join(" ").toLowerCase();
      }

      function applyFilter() {
        var query = queryInput ? queryInput.value.trim().toLowerCase() : "";
        var category = categorySelect ? categorySelect.value : "全部";
        var year = yearSelect ? yearSelect.value : "全部";
        var type = typeSelect ? typeSelect.value : "全部";
        var sort = sortSelect ? sortSelect.value : "views-desc";
        var visible = [];

        cards.forEach(function (card) {
          var matched = true;
          if (query && textOf(card).indexOf(query) === -1) {
            matched = false;
          }
          if (category !== "全部" && card.getAttribute("data-category") !== category) {
            matched = false;
          }
          if (year !== "全部" && card.getAttribute("data-year") !== year) {
            matched = false;
          }
          if (type !== "全部" && card.getAttribute("data-type") !== type) {
            matched = false;
          }
          card.hidden = !matched;
          if (matched) {
            visible.push(card);
          }
        });

        visible.sort(function (a, b) {
          if (sort === "year-desc") {
            return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
          }
          if (sort === "date-desc") {
            return String(b.getAttribute("data-date")).localeCompare(String(a.getAttribute("data-date")));
          }
          if (sort === "title-asc") {
            return String(a.getAttribute("data-title")).localeCompare(String(b.getAttribute("data-title")), "zh-Hans-CN");
          }
          return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
        });

        visible.forEach(function (card) {
          list.appendChild(card);
        });

        if (emptyState) {
          emptyState.hidden = visible.length > 0;
        }
      }

      [queryInput, categorySelect, yearSelect, typeSelect, sortSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilter);
          control.addEventListener("change", applyFilter);
        }
      });

      applyFilter();
    });
  });
})();
