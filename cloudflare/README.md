# Cloudflare Workers Free + D1 + Durable Objects

Use the root `DEPLOY.md`. Cloudflare handles all game-state API calls; Firebase remains for Email/Password login only. `FIREBASE_PROJECT_ID` and the client Firebase `apiKey` are public project identifiers, **not** service-account private keys.

Do not put private keys in JavaScript. Do not enable Firebase Realtime Database or Blaze. Do not paste login tokens into chat.
