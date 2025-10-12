Lab1

- I got stuck on testing with Thunder client. The reason why is the Thunder extension was outdated. After updating, it worked properly.
- I learned how to install bun
- I learned how to create basic routes and use a logger middleware.

Lab2

- I learned how to implement GET, POST, GET by id, and DELETE endpoints.
- I learned how to mount the router.
- I leaned how to test endpoints by using curl.

Lab3

- I learned how to check error and fix (when the data is empty, it should return the 400 error with an error message.) So I added the if statement.
  const data = c.req.valid("json");
  if (Object.keys(data).length < 1)
  return c.json({ error: "Empty Body!" }, 400);

- I learned the difference between PUT(full update) and Patch(partial update).
- I learned how to add extra validation.

Lab4

- I learned about the Neon Postgres database and a drizzle ORM schema.
- I got stuck finding the HTTP connection string in Neon, so I just used one starting with "postgresql://" instead of "https://" in the .env file, but it worked. (I'm still not sure if that's ok)
- I learned about how to test the database-backend API with curl.

Lab5

- I learned about how to create Vite React app and run.
- I learned about how to set up the tailwindCSS.
- I learned how to initialize ShadCN UI and generate components.

Lab 6

- I had errors in the tsconfig.app.json file and tsconfig.node.json file. The cause was that terminal was using tsc 5.9.2 (which latest version), however VS Code was using a different(older) Typescript version.
- "Typescript:Select Typescript version" -> I changed to the Use Workspace version.
- Another error was "cannot find module @lib/utils" -> I resolved this to change the alias @ path
- In the tsconfig.app.json file, I changed the paths from "@" : ["./src/*] to "@/_" : ["./src/_]

Lab 7

- I learned how to configure QueryClientProvider in a Vite React app.
- how to fetch expenses with useQuery and display them.
- how to mutate data with useMutation and invalidate queries

Lab 8

- I learned how to Install and configure TanStack Router in a Vite React app.
- I learned how to navigate between routes with <Link>.
- I learned how to create nested routes for list, detail, and new item pages.

Lab 9

- Server-side auth with SDK :Moved the OAuth/OIDC flow to the backend (Hono). The server calls 'login()' → redirects to Kinde, then 'handleRedirectToApp()' on '/api/auth/callback' to validate the code, verify state/PKCE, and store tokens via a SessionManager.
- cookie vs localStorage : Tokens are kept in HTTPOnly cookies (set in the server), protecting them from XSS and enabling same-origin credential flow through the Vite proxy. Avoids exposing access/refresh tokens to frontend JavaScript.
- SDK simplified URL construction, discovery (issuer/keys), code ↔ token exchange, refresh token rotation, and user profile retrieval ('getUserProfile'). Also centralizes logout so both app session and IdP session can be cleared.

Lab 10

- Used AWS S3 with a private bucket; configured CORS to allow browser uploads from http://localhost:5173.
- Upload flow worked after I understood the 3-step sequence: (1) get signed URL, (2) upload file directly to S3, (3) update expense with fileKey.
- Learned that only the S3 object key is stored in Postgres, and the backend must re-sign for secure downloads.

Lab 11

- Core polish: spinners on load, empty state panel, inline error with Retry. - Optimistic add/delete: instant UI updates + rollback on failure.
- Optional extras implemented: - Skeleton rows during initial load.
- Inline amount validation with helper text.
- Toast notifications on add/delete (auto-dismiss, accessible).
