(() => {
    const toggle = document.querySelector('[data-menu-toggle]');
    const nav = document.querySelector('[data-nav-links]');

    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            nav.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let current = 0;

        const showSlide = (index) => {
            current = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        dots.forEach((dot) => {
            dot.addEventListener('click', () => {
                showSlide(Number(dot.dataset.heroDot));
            });
        });

        if (slides.length > 1) {
            setInterval(() => {
                showSlide(current + 1);
            }, 5500);
        }
    }

    const normalize = (value) => String(value || '').trim().toLowerCase();

    document.querySelectorAll('[data-filter-scope]').forEach((scope) => {
        const input = scope.querySelector('[data-local-filter]');
        const list = scope.parentElement.querySelector('[data-card-list]');
        const cards = list ? Array.from(list.querySelectorAll('.movie-card')) : [];
        const selects = Array.from(scope.querySelectorAll('[data-filter-select]'));

        selects.forEach((select) => {
            const key = select.dataset.filterSelect;
            const values = Array.from(new Set(cards.map((card) => card.dataset[key]).filter(Boolean))).sort((a, b) => b.localeCompare(a, 'zh-Hans-CN'));
            values.forEach((value) => {
                const option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        });

        const apply = () => {
            const keyword = normalize(input ? input.value : '');
            const filters = Object.fromEntries(selects.map((select) => [select.dataset.filterSelect, normalize(select.value)]));

            cards.forEach((card) => {
                const haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(' '));
                const keywordMatched = !keyword || haystack.includes(keyword);
                const filterMatched = Object.entries(filters).every(([key, value]) => !value || normalize(card.dataset[key]) === value);
                card.classList.toggle('is-filtered-out', !(keywordMatched && filterMatched));
            });
        };

        if (input) {
            input.addEventListener('input', apply);
        }
        selects.forEach((select) => select.addEventListener('change', apply));
    });

    const searchPage = document.querySelector('[data-search-page]');

    if (searchPage) {
        const input = searchPage.querySelector('[data-search-input]');
        const regionSelect = searchPage.querySelector('[data-search-region]');
        const typeSelect = searchPage.querySelector('[data-search-type]');
        const yearSelect = searchPage.querySelector('[data-search-year]');
        const results = searchPage.querySelector('[data-search-results]');
        const status = searchPage.querySelector('[data-search-status]');
        const params = new URLSearchParams(window.location.search);
        const initial = params.get('q') || '';
        let movies = [];

        const escapeHtml = (value) => String(value || '').replace(/[&<>"]/g, (char) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;'
        })[char]);

        const unique = (key) => Array.from(new Set(movies.map((movie) => movie[key]).filter(Boolean))).sort((a, b) => b.localeCompare(a, 'zh-Hans-CN'));

        const fillSelect = (select, key) => {
            unique(key).forEach((value) => {
                const option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        };

        const renderCard = (movie) => {
            const tags = movie.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
            return `<article class="movie-card">
    <a class="poster-wrap" href="${escapeHtml(movie.url)}" aria-label="${escapeHtml(movie.title)}">
        <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy">
        <span class="play-chip">▶ 在线观看</span>
    </a>
    <div class="movie-card-body">
        <h3><a href="${escapeHtml(movie.url)}">${escapeHtml(movie.title)}</a></h3>
        <p class="movie-line">${escapeHtml(movie.one_line)}</p>
        <div class="movie-meta">
            <span>${escapeHtml(movie.region)}</span>
            <span>${escapeHtml(movie.type)}</span>
            <span>${escapeHtml(movie.year)}</span>
        </div>
        <div class="tag-row">${tags}</div>
    </div>
</article>`;
        };

        const apply = () => {
            const keyword = normalize(input.value);
            const region = normalize(regionSelect.value);
            const type = normalize(typeSelect.value);
            const year = normalize(yearSelect.value);
            const matched = movies.filter((movie) => {
                const haystack = normalize([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.tags.join(' '),
                    movie.one_line
                ].join(' '));
                return (!keyword || haystack.includes(keyword)) &&
                    (!region || normalize(movie.region) === region) &&
                    (!type || normalize(movie.type) === type) &&
                    (!year || normalize(movie.year) === year);
            }).slice(0, 120);

            results.innerHTML = matched.map(renderCard).join('');
            status.textContent = matched.length ? '匹配影片' : '没有找到相关影片';
        };

        fetch('assets/movies.json')
            .then((response) => response.json())
            .then((data) => {
                movies = data;
                fillSelect(regionSelect, 'region');
                fillSelect(typeSelect, 'type');
                fillSelect(yearSelect, 'year');
                input.value = initial;
                apply();
            });

        [input, regionSelect, typeSelect, yearSelect].forEach((element) => {
            element.addEventListener('input', apply);
            element.addEventListener('change', apply);
        });
    }
})();
