require('dotenv').config();
const express = require('express');
const cors = require('cors');

const actsRouter = require('./routes/acts');
const judgmentsRouter = require('./routes/judgments');
const templatesRouter = require('./routes/templates');
const chatRouter = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check — useful for Render + for confirming the app can reach the server
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'lawsathi-backend', time: new Date().toISOString() });
});

app.use('/v1/acts', actsRouter);
app.use('/v1/judgments', judgmentsRouter);
app.use('/v1/templates', templatesRouter);
app.use('/v1/chat', chatRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`LawSathiAI backend running on port ${PORT}`);
});
