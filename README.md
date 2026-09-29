# Konaimi

A public model comparison app. The page starts with clearly marked fictional demo data. To compare real models, each visitor enters their own Artificial Analysis API key when they try to add a model. The key stays in that browser's local storage and is sent to Konaimi's server only to request data from Artificial Analysis. The server does not save the key or cache the response across visitors.

Artificial Analysis requires attribution and restricts Free API use to internal use. Only use your own key and data in line with your agreement. Do not publish or share live results without permission.

## Start

```sh
npm install
npm run dev
```

Visit `http://localhost:3000`. Click a demo model or **Add your API key** to enter a key. The server never uses an environment key. Named comparisons and model selections are kept in browser local storage; **Forget key** removes the saved key and returns to demo mode. Do not enter a key on a shared device.

Run `npm test`, `npm run lint`, and `npm run build` to check the project.

## Deployment

The `main` branch of [pablopunk/konaimi](https://github.com/pablopunk/konaimi) automatically deploys to [konaimi.pablopunk.com](https://konaimi.pablopunk.com). Production and previews must not have a shared Artificial Analysis API key. Each visitor's browser sends its key in a private POST to `/api/models`; a GET returns only fictional demo data. The endpoint does not log or cache keys or live data.
