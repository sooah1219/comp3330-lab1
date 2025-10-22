// import { file } from "bun";
// import { Hono } from "hono";
// import { cors } from "hono/cors";
// import { logger } from "hono/logger";
// import { serveStatic } from "hono/serve-static";
// import { authRoute } from "./auth/kinde";
// import { expensesRoute } from "./routes/expenses";
// import { healthRoute } from "./routes/health";
// import { secureRoute } from "./routes/secure";
// import { uploadRoute } from "./routes/upload";

// export const app = new Hono();

// app.use(
//   "/*",
//   serveStatic({
//     root: "./server/public",
//     getContent: async (path) => {
//       try {
//         return await file(`./server/public${path}`).arrayBuffer();
//       } catch {
//         return null;
//       }
//     },
//   })
// );

// app.use("*", logger());
// app.use("*", async (c, next) => {
//   const start = Date.now();
//   await next();
//   c.header("X-Response-Time", `${Date.now() - start}ms`);
// });

// app.use(
//   "/api/*",
//   cors({
//     origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
//     allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
//     allowHeaders: ["Content-Type", "Authorization"],
//   })
// );

// app.route("/api/expenses", expensesRoute);
// app.route("/api/auth", authRoute);
// app.route("/api/secure", secureRoute);
// app.route("/api/upload", uploadRoute);
// app.route("/health", healthRoute);

// app.get("/api/health", (c) => c.json({ ok: true })); // 선택

// app.get("*", async (c, next) => {
//   const url = new URL(c.req.url);
//   if (url.pathname.startsWith("/api") || url.pathname.startsWith("/assets")) {
//     return next();
//   }
//   const html = await file("./server/public/index.html").text();
//   return c.html(html);
// });

// export default app;

import { file } from "bun";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serveStatic } from "hono/serve-static";
import { authRoute } from "./auth/kinde";
import { expensesRoute } from "./routes/expenses";
import { healthRoute } from "./routes/health";
import { secureRoute } from "./routes/secure";
import { uploadRoute } from "./routes/upload";

export const app = new Hono();

// 1) 정적 자산 서빙 + 캐시 헤더
app.use(
  "/*",
  serveStatic({
    root: "./server/public",
    rewriteRequestPath: (p) => p, // 그대로
    getContent: async (path, c) => {
      try {
        const data = await file(`./server/public${path}`).arrayBuffer();

        // 해시 자산은 장기 캐시
        if (path.startsWith("/assets/") || path === "/vite.svg") {
          c.header("Cache-Control", "public, max-age=31536000, immutable");
        }
        // favicon, 이미지 등도 원하면 장기 캐시
        else if (/\.(png|jpg|jpeg|webp|gif|ico)$/.test(path)) {
          c.header("Cache-Control", "public, max-age=31536000, immutable");
        }

        return data;
      } catch {
        return null;
      }
    },
  })
);

app.use("*", logger());
app.use("*", async (c, next) => {
  const start = Date.now();
  await next();
  c.header("X-Response-Time", `${Date.now() - start}ms`);
});

// 2) 개발용 CORS (prod는 동일 출처라 불필요)
app.use(
  "/api/*",
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// 3) API 라우트
app.route("/api/expenses", expensesRoute);
app.route("/api/auth", authRoute);
app.route("/api/secure", secureRoute);
app.route("/api/upload", uploadRoute);
app.route("/health", healthRoute);
app.get("/api/health", (c) => c.json({ ok: true }));

// 4) SPA Fallback (index.html은 항상 최신으로)
app.get("*", async (c, next) => {
  const url = new URL(c.req.url);
  const p = url.pathname;

  // 실제 파일/API는 통과
  if (
    p.startsWith("/api") ||
    p.startsWith("/assets") ||
    p === "/vite.svg" ||
    p === "/favicon.ico" ||
    /\.(png|jpg|jpeg|webp|gif|ico)$/.test(p)
  ) {
    return next();
  }

  const html = await file("./server/public/index.html").text();
  c.header("Cache-Control", "no-cache"); // ✅ index.html은 no-cache
  return c.html(html);
});

export default app;
