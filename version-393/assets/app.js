(function () {
    function each(selector, root, fn) {
        Array.prototype.forEach.call((root || document).querySelectorAll(selector), fn);
    }

    function initMenu() {
        var button = document.querySelector('.menu-toggle');
        var menu = document.querySelector('.mobile-nav');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            var open = menu.classList.toggle('is-open');
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function initCarousel() {
        var carousel = document.querySelector('[data-carousel]');
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                restart();
            });
        });
        start();
    }

    function initFilters() {
        each('.filter-input', document, function (input) {
            var section = input.closest('section') || document;
            var scope = section.querySelector('.filter-scope');
            if (!scope && input.classList.contains('hero-input')) {
                scope = document.querySelector('.filter-scope');
            }
            if (!scope) {
                return;
            }
            var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
            var empty = document.createElement('div');
            empty.className = 'empty-state hidden-by-filter';
            empty.textContent = scope.getAttribute('data-empty-text') || '没有匹配影片';
            scope.appendChild(empty);
            var activeFilter = '';
            function normalize(value) {
                return String(value || '').trim().toLowerCase();
            }
            function apply() {
                var query = normalize(input.value);
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-tags')
                    ].join(' '));
                    var okQuery = !query || haystack.indexOf(query) !== -1;
                    var okFilter = !activeFilter || haystack.indexOf(normalize(activeFilter)) !== -1;
                    var show = okQuery && okFilter;
                    card.classList.toggle('hidden-by-filter', !show);
                    if (show) {
                        visible += 1;
                    }
                });
                empty.classList.toggle('hidden-by-filter', visible !== 0);
            }
            input.addEventListener('input', apply);
            each('.filter-chip', section, function (chip) {
                chip.addEventListener('click', function () {
                    each('.filter-chip', section, function (item) {
                        item.classList.remove('is-active');
                    });
                    chip.classList.add('is-active');
                    activeFilter = chip.getAttribute('data-filter') || '';
                    apply();
                });
            });
            apply();
        });
    }

    function initPlayers() {
        each('.video-player[data-stream]', document, function (video) {
            var shell = video.closest('.player-shell');
            var button = shell ? shell.querySelector('.player-overlay') : null;
            var message = shell ? shell.querySelector('.player-message') : null;
            var stream = video.getAttribute('data-stream');
            var hls = null;
            var attached = false;

            function showMessage(text) {
                if (!message) {
                    return;
                }
                message.textContent = text;
                message.hidden = false;
            }

            function attach() {
                if (attached || !stream) {
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        attached = true;
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            showMessage('视频加载失败，请稍后再试');
                        }
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                    attached = true;
                } else {
                    showMessage('视频暂时无法播放');
                }
            }

            function play() {
                attach();
                video.setAttribute('controls', 'controls');
                var promise = video.play();
                if (promise && typeof promise.then === 'function') {
                    promise.then(function () {
                        if (button) {
                            button.classList.add('is-hidden');
                        }
                    }).catch(function () {
                        if (button) {
                            button.classList.remove('is-hidden');
                        }
                    });
                } else if (button) {
                    button.classList.add('is-hidden');
                }
            }

            attach();

            if (button) {
                button.addEventListener('click', play);
            }

            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                } else {
                    video.pause();
                    if (button) {
                        button.classList.remove('is-hidden');
                    }
                }
            });

            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('is-hidden');
                }
            });

            video.addEventListener('pause', function () {
                if (button && !video.ended) {
                    button.classList.remove('is-hidden');
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initCarousel();
        initFilters();
        initPlayers();
    });
}());
