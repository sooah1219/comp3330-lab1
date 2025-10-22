// server/index.ts
import { app } from "./app";

// Prefer PORT from env; default 3000
const port = Number(process.env.PORT || 8080);

export default {
  port,
  hostname: "0.0.0.0",
  fetch: app.fetch,
};

console.log(`🚀 Server running on http://localhost:${port}`);
