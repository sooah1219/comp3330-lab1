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
