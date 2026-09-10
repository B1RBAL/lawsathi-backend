const express = require('express');
const router = express.Router();
const acts = require('../data/acts.json');
const { search } = require('../utils/search');

const SEARCHABLE_FIELDS = ['actName', 'sectionNumber', 'sectionTitle', 'plainLanguageSummary', 'category'];

// GET /v1/acts/search?q=...&category=...
router.get('/search', (req, res) => {
  const { q = '', category } = req.query;

  let pool = acts;
  if (category && category !== 'all') {
    pool = pool.filter((a) => a.category.toLowerCase().includes(category.toLowerCase()));
  }

  const results = search(pool, SEARCHABLE_FIELDS, q, 20);
  res.json(results);
});

module.exports = router;
