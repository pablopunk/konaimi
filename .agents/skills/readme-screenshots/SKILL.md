---
name: readme-screenshots
description: Refresh Konaimi README screenshots from the running app. Use whenever the user asks for new screenshots, updated screenshots, model comparison images, or README images after a UI or benchmark data change in this repo. Select current models with all four live API stats, capture real browser screenshots, and update README captions and attribution.
---

# Refresh README screenshots

1. Read `scripts/capture-readme.mjs` and `README.md` if the requested model choices or screenshot layout differ from the defaults.
2. Load the `agent-browser` skill and its `agent-browser skills get core` guide before browser work. Install the CLI only if it is missing.
3. Ensure the local app has a server-only Artificial Analysis API key and is running. Run `npm run screenshots -- <local-app-url>` from the repository root. The script reads `/api/models`, chooses the highest-Intelligence complete model from each of four distinct creators, uses the app's search and add controls, saves two 1600 × 1250 PNGs in `docs/screenshots/`, and refreshes the README labels and date. It rejects demo data.
4. Open both saved images and inspect them. Check that all selected cards show four numeric stats, both outlines and the data credit are visible, and no developer toolbar or secret appears. Fix the capture process rather than publishing a bad image.
5. Do not create a repo, deploy, or publish images unless asked. Public chart-sharing rights and attribution need review before making this README public; a screenshot does not make the Free API suitable for a public live site.

The script needs Node.js, a running local app, and `agent-browser`; it does not save the raw API response. Its two browser sessions are isolated and close after capture. Use `npm run screenshots -- http://127.0.0.1:3001` when the dev server uses port 3001. The script removes only the Next.js developer toolbar from screenshots; it does not change the application.
