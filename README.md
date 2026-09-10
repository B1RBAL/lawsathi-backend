# LawSathiAI Backend

Node.js/Express backend for LawSathiAI. Serves curated Acts, Judgments, Templates,
and an AI chat endpoint that uses **RAG (Retrieval-Augmented Generation)**: it
first searches the local dataset for relevant Acts/Judgments, then sends that
context to Claude so answers are grounded in real legal text instead of the
model's own memory.

## Endpoints

| Method | Path                 | Description                                  |
|--------|----------------------|-----------------------------------------------|
| GET    | `/`                  | Health check                                  |
| GET    | `/v1/acts/search`    | `?q=` keyword search, optional `?category=`   |
| GET    | `/v1/judgments/search` | `?q=` keyword search, optional `?actId=`    |
| GET    | `/v1/templates`      | List templates, optional `?category=`         |
| POST   | `/v1/chat/ask`       | `{ "question": "..." }` — RAG-grounded chat   |

## Termux mein local test karna

```bash
cd lawsathi-backend
npm install
cp .env.example .env
# .env file khol ke apni real ANTHROPIC_API_KEY daal do
npm start
```

Phir browser ya curl se test karo:
```bash
curl http://localhost:3000/
curl "http://localhost:3000/v1/acts/search?q=cruelty"
curl -X POST http://localhost:3000/v1/chat/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"cruelty ke aadhar par divorce kaise le sakte hain?"}'
```

## Render.com pe deploy karna (jaise Opportunity Finder kiya tha)

1. Is `lawsathi-backend` folder ko GitHub pe push karo (naya repo banao — `.env` file kabhi push mat karna, `.gitignore` already handle karta hai)
2. Render.com pe: **New → Web Service** → apna GitHub repo connect karo
3. Settings:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. **Environment** tab mein ye variable add karo:
   - `ANTHROPIC_API_KEY` = tumhari actual API key (console.anthropic.com se)
5. Deploy hone ke baad Render tumhe ek URL dega, jaise: `https://lawsathi-backend.onrender.com`
6. Ye URL Android app mein `local.properties` ke `API_BASE_URL` mein daal do (Android app README mein steps hain)

## Data update karna (naye Acts/Judgments add karna)

`data/acts.json` aur `data/judgments.json` seedhe edit kar sakte ho — koi database setup nahi chahiye (jaise Opportunity Finder mein JSON storage use kiya tha, SQLite avoid kiya Termux compilation issues ki wajah se). Har naya entry add karne ke baad, GitHub pe push karo — Render automatically redeploy kar dega.

**Naya Act add karne ka format:**
```json
{
  "id": "unique-id",
  "actName": "Act ka naam",
  "sectionNumber": "Section number",
  "sectionTitle": "Chhota title",
  "originalText": "Bare act ka text (India Code se)",
  "plainLanguageSummary": "Hinglish mein simple explanation",
  "category": "Family Law / Consumer Law / General / etc",
  "lastUpdated": "YYYY-MM-DD"
}
```

## Free tier note (Render)

Render ka free tier kuch der inactive rehne pe "sleep" ho jaata hai — pehli request ke response mein 30-50 second ka delay ho sakta hai jab server "wake up" hota hai. Ye normal hai, paid tier pe nahi hota.

## Scaling roadmap (jab dataset bada ho jaaye)

Abhi `utils/search.js` mein simple keyword-matching hai jo chhote dataset (dozens–hundreds entries) ke liye theek hai. Jab Acts/Judgments hazaaron mein ho jaayein, to:
- Postgres full-text search, ya
- Elasticsearch/Meilisearch jaisa dedicated search engine

use karna better hoga.
