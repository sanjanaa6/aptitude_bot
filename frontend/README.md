## Quantitative Dashboard Frontend

Scripts:

- `npm run dev`: start Vite dev server on port 5173
- `npm run build`: build for production

Environment variables (backend):
- `OPENROUTER_API_KEY` for OpenRouter
- `OPENROUTER_MODEL` (e.g., `openrouter/anthropic/claude-3.5-sonnet` or `openrouter/google/gemini-2.0-flash-exp`)
- If not set, the server will try `OPENAI_API_KEY` + `OPENAI_MODEL`; otherwise it falls back to local context answers.

