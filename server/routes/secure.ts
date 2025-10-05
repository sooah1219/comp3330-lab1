// server/routes/secure.ts
import { Hono } from "hono";
import { requireAuth } from "../auth/requireAuth";
import type { AppVariables } from "../types";

export const secureRoute = new Hono<{ Variables: AppVariables }>().get(
  "/profile",
  async (c) => {
    const err = await requireAuth(c);
    if (err) return err;
    return c.json({ user: c.get("user") });
  }
);
