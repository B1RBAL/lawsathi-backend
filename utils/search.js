/**
 * Very simple keyword-overlap search over an array of objects.
 * Good enough for a small curated dataset (dozens–hundreds of entries).
 * Once the dataset grows into thousands of Acts/Judgments, swap this for
 * Postgres full-text search or a proper search engine (Elasticsearch/Meilisearch).
 */
function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Scores an item by how many query tokens appear in its searchable fields.
 * @param {object} item
 * @param {string[]} fields - field names on item to search within
 * @param {string} query
 * @returns {number} score (0 = no match)
 */
function scoreItem(item, fields, query) {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return 0;

  const haystack = fields
    .map((f) => item[f])
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  let score = 0;
  for (const token of queryTokens) {
    if (haystack.includes(token)) score += 1;
  }
  return score;
}

/**
 * Searches a list of items, returning those with score > 0, sorted best-first.
 */
function search(items, fields, query, limit = 10) {
  if (!query) return items.slice(0, limit);

  return items
    .map((item) => ({ item, score: scoreItem(item, fields, query) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item);
}

module.exports = { search, tokenize, scoreItem };
