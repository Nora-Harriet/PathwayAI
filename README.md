# Pathway — AI Career Advisor

A web app for final-year students: AI career recommendations, CV feedback, cover-letter drafting and career tips.

## Stack

- **TanStack Start** (React 19 + Vite) for the app and its server routes
- **Firebase Authentication** (email/password + Google) and **Cloud Firestore** for saved profiles, matches, reviews and letters
- **Google Gemini** for all AI features, called from a server route so the API key never reaches the browser
- **Tailwind CSS** for styling

## Running locally

```sh
npm i
npm run dev
```

Create a `.env` file with your Gemini key:

```
GEMINI_API_KEY=your-key
```

The Firebase web config is publishable and lives in `src/lib/firebase.ts`.

## Project layout

- `src/routes/` — pages (`index`, `auth`, and the signed-in `_authenticated` section) plus the `api/ai` Gemini endpoint
- `src/lib/firebase.ts` — Firebase app, auth and Firestore setup
- `src/lib/pathway.ts` — Firestore reads/writes and AI calls
- `src/lib/prompts.ts` — the Gemini system prompts
- `src/lib/documents.ts` — CV file reading (PDF/Word/text) and PDF/Word export
- `firestore.rules` — each user can only read and write their own data

## Deploying

1. Set `GEMINI_API_KEY` in your hosting provider's environment variables.
2. Add the deployed domain to **Firebase Console → Authentication → Settings → Authorized domains**.
3. Deploy the Firestore rules: `firebase deploy --only firestore:rules`.
