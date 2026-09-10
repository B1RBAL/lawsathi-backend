const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-5';

/**
 * Calls Claude with a system prompt + user question, grounded in retrieved
 * context (RAG pattern). Requires process.env.ANTHROPIC_API_KEY to be set.
 */
async function askClaude({ question, contextText }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
  }

  const systemPrompt = `Tum LawSathiAI ho — ek Hindi/Hinglish mein baat karne wala legal aur financial literacy assistant, jo Bharatiya kanoon ke baare mein general jaankari deta hai.

Rules:
- Hamesha simple Hinglish mein jawab do, jaise ek knowledgeable dost samjhata hai.
- Neeche diya gaya CONTEXT tumhara primary source hai. Jawab dene se pehle usse zaroor use karo.
- Agar CONTEXT mein relevant jaankari nahi hai, to saaf bata do ki tumhare paas is specific sawaal ka pakka jawab nahi hai, aur guess mat karo.
- Kabhi bhi case-specific legal advice mat do ("aap jeet jaoge" jaisa kuch mat kaho).
- Jab CONTEXT ke kisi Act/Section ya Judgment ko use karo, to uska naam/section number jawab mein mention karo.
- Har jawab ke end mein ek chhota disclaimer do ki yeh general jaankari hai, kisi advocate se salah zaroor lein apne case ke liye.

CONTEXT:
${contextText || '(Is sawaal se related koi specific Act ya Judgment database mein nahi mila.)'}`;

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: question }]
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Claude API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const textBlock = (data.content || []).find((block) => block.type === 'text');
  return textBlock ? textBlock.text : 'Maaf kijiye, jawab generate nahi ho paaya.';
}

module.exports = { askClaude };
