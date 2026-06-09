(function () {
  var form = document.querySelector('[data-search-form]');
  var input = document.querySelector('[data-search-input]');
  var resultBox = document.querySelector('[data-search-results]');
  var titleBox = document.querySelector('[data-search-title]');

  if (!form || !input || !resultBox || !window.movieSearchData) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';
  input.value = initialQuery;

  var createCard = function (movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="poster" href="' + movie.url + '" style="--poster-image: url(\'' + movie.cover + '\');" aria-label="' + escapeHtml(movie.title) + '">',
      '    <span class="poster-badge">' + escapeHtml(movie.year) + '</span>',
      '    <span class="play-dot">▶</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <div class="meta-line">',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.category) + '</span>',
      '    </div>',
      '    <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  };

  var escapeHtml = function (value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  var render = function (query) {
    var term = String(query || '').trim().toLowerCase();
    var list = window.movieSearchData;

    if (term) {
      list = list.filter(function (movie) {
        return [
          movie.title,
          movie.region,
          movie.type,
          movie.genre,
          movie.category,
          movie.oneLine,
          movie.tags.join(' ')
        ].join(' ').toLowerCase().indexOf(term) !== -1;
      });
    } else {
      list = list.slice(0, 80);
    }

    titleBox.textContent = term ? '搜索结果：' + query : '精选片库';

    if (!list.length) {
      resultBox.className = 'search-empty';
      resultBox.innerHTML = '没有找到匹配内容，可以换一个片名、地区或类型继续搜索。';
      return;
    }

    resultBox.className = 'movie-grid compact';
    resultBox.innerHTML = list.slice(0, 160).map(createCard).join('');
  };

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var query = input.value.trim();
    var url = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
    window.history.replaceState(null, '', url);
    render(query);
  });

  render(initialQuery);
})();
