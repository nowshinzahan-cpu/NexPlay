/**
 * Pure filter function — takes items and a filters object,
 * returns filtered + sorted + paginated result.
 * No side effects, no API calls, independently testable.
 */

const ITEMS_PER_PAGE = 20;

const SORT_FUNCS = {
  popular:      (a, b) => (b.rating || 0) - (a.rating || 0),
  trending:     (a, b) => {
    const aScore = (a.rating || 0) + new Date(a.updatedAt).getTime() / 1e10;
    const bScore = (b.rating || 0) + new Date(b.updatedAt).getTime() / 1e10;
    return bScore - aScore;
  },
  latest:       (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
  releaseDate:  (a, b) => (b.releaseYear || 0) - (a.releaseYear || 0),
  rating:       (a, b) => (b.rating || 0) - (a.rating || 0),
  az:           (a, b) => (a.title || '').localeCompare(b.title || ''),
  newest:       (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
  oldest:       (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt),
};

export function filterContent(items, filters = {}) {
  const {
    search = '',
    category = 'all',        // 'all' | 'movie' | 'tv'
    genres = [],             // string[]
    languages = [],          // string[]
    releaseYear = null,      // string | null (e.g. '2025', 'Before 2020')
    statuses = [],           // string[]
    platforms = [],          // string[]
    sort = 'popular',
    page = 1,
    perPage = ITEMS_PER_PAGE,
  } = filters;

  let result = [...items];

  // ── Search ────────────────────────────────────────────────────────
  if (search.trim()) {
    const tokens = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
    result = result.filter((item) => {
      const searchable = [
        item.title,
        ...(item.alternativeTitles || []),
        ...(item.tags || []),
        ...(item.genres || []),
      ].map((s) => (s || '').toLowerCase());
      // All tokens must match at least one field
      return tokens.every((token) =>
        searchable.some((field) => field.includes(token))
      );
    });
  }

  // ── Category ──────────────────────────────────────────────────────
  if (category !== 'all') {
    result = result.filter((item) => item.type === category);
  }

  // ── Genres (OR logic — item must match at least one selected genre) ───
  if (genres.length > 0) {
    result = result.filter((item) =>
      genres.some((g) => (item.genres || []).includes(g))
    );
  }

  // ── Languages (OR logic — item must match at least one) ───────────
  if (languages.length > 0) {
    result = result.filter((item) =>
      (item.languages || []).some((l) => languages.includes(l))
    );
  }

  // ── Release Year (single-select) ──────────────────────────────────
  if (releaseYear) {
    result = result.filter((item) => {
      const year = item.releaseYear;
      if (releaseYear === 'Before 2020') return year < 2020;
      return String(year) === releaseYear;
    });
  }

  // ── Status (OR logic) ─────────────────────────────────────────────
  if (statuses.length > 0) {
    result = result.filter((item) => statuses.includes(item.status));
  }

  // ── Platform (OR logic — available on at least one selected platform) ─
  if (platforms.length > 0) {
    result = result.filter((item) =>
      (item.platform || []).some((p) => platforms.includes(p))
    );
  }

  // ── Sort ──────────────────────────────────────────────────────────
  const sortFn = SORT_FUNCS[sort] || SORT_FUNCS.popular;
  result.sort(sortFn);

  // ── Pagination ────────────────────────────────────────────────────
  const total = result.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.max(1, Math.min(page, totalPages));
  const start = (safePage - 1) * perPage;
  const paged = result.slice(start, start + perPage);

  return {
    items: paged,
    pagination: {
      page: safePage,
      perPage,
      total,
      totalPages,
    },
  };
}

/**
 * Get unique values for filter dropdowns from the full dataset.
 */
export function getFilterOptions(items) {
  const allGenres = new Set();
  const allLanguages = new Set();
  const allPlatforms = new Set();
  const allYears = new Set();

  items.forEach((item) => {
    (item.genres || []).forEach((g) => allGenres.add(g));
    (item.languages || []).forEach((l) => allLanguages.add(l));
    (item.platform || []).forEach((p) => allPlatforms.add(p));
    if (item.releaseYear) allYears.add(String(item.releaseYear));
  });

  return {
    genres: [...allGenres].sort(),
    languages: [...allLanguages].sort(),
    platforms: [...allPlatforms].sort(),
    years: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', 'Before 2020'],
  };
}
