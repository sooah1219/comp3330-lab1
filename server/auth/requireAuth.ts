import type { Context } from "hono";
import type { AppVariables } from "../types";
import { kindeClient, sessionFromHono } from "./kinde";

export async function requireAuth(c: Context<{ Variables: AppVariables }>) {
  const session = sessionFromHono(c);
  const authed = await kindeClient.isAuthenticated(session);
  if (!authed) return c.json({ error: "Unauthorized" }, 401);

  const user = await kindeClient.getUserProfile(session); // UserType
  c.set("user", user);
  return null;
}
