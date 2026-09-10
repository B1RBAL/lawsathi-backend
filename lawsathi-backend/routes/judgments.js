const express = require('express');
const router = express.Router();
const judgments = require('../data/judgments.json');
const { search } = require('../utils/search');

const SEARCHABLE_FIELDS = ['caseTitle', 'summary', 'category', 'court'];

// GET /v1/judgments/search?q=...&actId=...
router.get('/search', (req, res) => {
  const { q = '', actId } = req.query;

  let pool = judgments;
  if (actId) {
    pool = pool.filter((j) => j.relatedActs.includes(actId));
  }

  const results = search(pool, SEARCHABLE_FIELDS, q, 20);
  res.json(results);
});

module.exports = router;
