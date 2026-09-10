const express = require('express');
const router = express.Router();
const acts = require('../data/acts.json');
const judgments = require('../data/judgments.json');
const { search } = require('../utils/search');
const { askClaude } = require('../utils/claudeClient');

const ACT_FIELDS = ['actName', 'sectionNumber', 'sectionTitle', 'plainLanguageSummary', 'category'];
const JUDGMENT_FIELDS = ['caseTitle', 'summary', 'category'];

function buildContext(relevantActs, relevantJudgments) {
  const actLines = relevantActs.map(
    (a) => `- [ACT:${a.id}] ${a.actName}, Section ${a.sectionNumber || 'N/A'} (${a.sectionTitle || ''}): ${a.plainLanguageSummary}`
  );
  const judgmentLines = relevantJudgments.map(
    (j) => `- [JUDGMENT:${j.id}] ${j.caseTitle} (${j.court}, ${j.year}): ${j.summary}`
  );
  return [...actLines, ...judgmentLines].join('\n');
}

// POST /v1/chat/ask
// body: { question: string, conversationId?: string, languagePref?: string }
router.post('/ask', async (req, res) => {
  const { question } = req.body || {};

  if (!question || typeof question !== 'string' || !question.trim()) {
    return res.status(400).json({ error: 'question is required' });
  }

  try {
    const relevantActs = search(acts, ACT_FIELDS, question, 4);
    const relevantJudgments = search(judgments, JUDGMENT_FIELDS, question, 3);
    const contextText = buildContext(relevantActs, relevantJudgments);

    const answer = await askClaude({ question, contextText });

    res.json({
      answer,
      citedActIds: relevantActs.map((a) => a.id),
      citedJudgmentIds: relevantJudgments.map((j) => j.id),
      disclaimer: 'Yeh general jaankari hai, personalized legal advice nahi. Apne case ke liye ek advocate se salah lein.'
    });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(502).json({
      error: 'Assistant abhi jawab nahi de paaya. Thodi der baad phir try karein.'
    });
  }
});

module.exports = router;
