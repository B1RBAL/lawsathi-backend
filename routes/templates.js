const express = require('express');
const router = express.Router();
const templates = require('../data/templates.json');

// GET /v1/templates?category=...
router.get('/', (req, res) => {
  const { category } = req.query;

  let results = templates;
  if (category && category !== 'all') {
    results = results.filter((t) => t.category.toLowerCase().includes(category.toLowerCase()));
  }

  res.json(results);
});

module.exports = router;
