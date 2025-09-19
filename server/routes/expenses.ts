// Example helpers (optional) — place at top of server/routes/expenses.ts
const ok = <T>(c: any, data: T, status = 200) => c.json({ data }, status);
const err = (c: any, message: string, status = 400) =>
  c.json({ error: { message } }, status);

// // server/routes/expenses.ts
// import { zValidator } from "@hono/zod-validator";
// import { Hono } from "hono";
// import { z } from "zod";

// // In‑memory DB for Week 2 (we'll replace with Postgres in Week 4)
// const expenses: Expense[] = [
//   { id: 1, title: "Coffee", amount: 4 },
//   { id: 2, title: "Groceries", amount: 35 },
// ];

// // Zod schemas
// const expenseSchema = z.object({
//   id: z.number().int().positive(),
//   title: z.string().min(3).max(100),
//   amount: z.number().int().positive(),
// });

// // Allow updating title and/or amount, but not id
// const updateExpenseSchema = z.object({
//   title: z.string().min(3).max(100).optional(),
//   amount: z.number().int().positive().optional(),
// });

// const createExpenseSchema = expenseSchema.omit({ id: true });

// export type Expense = z.infer<typeof expenseSchema>;

// // Router
// export const expensesRoute = new Hono()
//   // GET /api/expenses → list
//   .get("/", (c) => c.json({ expenses }))

//   // GET /api/expenses/:id → single item
//   // Enforce numeric id with a param regex (\\d+)
//   .get("/:id{\\d+}", (c) => {
//     const id = Number(c.req.param("id"));
//     const item = expenses.find((e) => e.id === id);
//     if (!item) return c.json({ error: "Not found" }, 404);
//     return c.json({ expense: item });
//   })

//   // POST /api/expenses → create (validated)
//   .post("/", zValidator("json", createExpenseSchema), (c) => {
//     const data = c.req.valid("json"); // { title, amount }
//     const nextId = (expenses.at(-1)?.id ?? 0) + 1;
//     const created: Expense = { id: nextId, ...data };
//     expenses.push(created);
//     return c.json({ expense: created }, 201);
//   })

//   // DELETE /api/expenses/:id → remove
//   .delete("/:id{\\d+}", (c) => {
//     const id = Number(c.req.param("id"));
//     const idx = expenses.findIndex((e) => e.id === id);
//     if (idx === -1) return c.json({ error: "Not found" }, 404);
//     const [removed] = expenses.splice(idx, 1);
//     return c.json({ deleted: removed });
//   })
//   .put("/:id{\\d+}", zValidator("json", createExpenseSchema), (c) => {
//     const id = Number(c.req.param("id"));
//     const idx = expenses.findIndex((e) => e.id === id);
//     if (idx === -1) return c.json({ error: "Not found" }, 404);

//     const data = c.req.valid("json");
//     const updated: Expense = { id, ...data };
//     expenses[idx] = updated;
//     return c.json({ expense: updated });
//   })
//   .patch("/:id{\\d+}", zValidator("json", updateExpenseSchema), (c) => {
//     const id = Number(c.req.param("id"));
//     const idx = expenses.findIndex((e) => e.id === id);
//     if (idx === -1) return c.json({ error: "Not found" }, 404);

//     const data = c.req.valid("json");
//     if (Object.keys(data).length < 1)
//       return c.json({ error: "Empty Body!" }, 400);

//     const current = expenses[idx];
//     if (current === undefined) return c.json({ error: "Not found" }, 404);

//     const updated: Expense = { ...current, ...data };
//     expenses[idx] = updated;
//     return c.json({ expense: updated });
//   });

// server/routes/expenses.ts (excerpt)
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db, schema } from "../db/client";

const { expenses } = schema;

const expenseSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(3).max(100),
  amount: z.number().int().positive(),
});
const createExpenseSchema = expenseSchema.omit({ id: true });
const updateExpenseSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  amount: z.number().int().positive().optional(),
});

export const expensesRoute = new Hono()
  .get("/", async (c) => {
    const rows = await db.select().from(expenses);
    return c.json({ expenses: rows });
  })
  .get("/:id{\\d+}", async (c) => {
    const id = Number(c.req.param("id"));
    const [row] = await db
      .select()
      .from(expenses)
      .where(eq(expenses.id, id))
      .limit(1);
    if (!row) return c.json({ error: "Not found" }, 404);
    return c.json({ expense: row });
  })
  .post("/", zValidator("json", createExpenseSchema), async (c) => {
    const data = c.req.valid("json");
    const [created] = await db.insert(expenses).values(data).returning();
    return c.json({ expense: created }, 201);
  })
  .put("/:id{\\d+}", zValidator("json", createExpenseSchema), async (c) => {
    const id = Number(c.req.param("id"));
    const [updated] = await db
      .update(expenses)
      .set({ ...c.req.valid("json") })
      .where(eq(expenses.id, id))
      .returning();
    if (!updated) return c.json({ error: "Not found" }, 404);
    return c.json({ expense: updated });
  })
  .patch("/:id{\\d+}", zValidator("json", updateExpenseSchema), async (c) => {
    const id = Number(c.req.param("id"));
    const patch = c.req.valid("json");
    if (Object.keys(patch).length === 0)
      return c.json({ error: "Empty patch" }, 400);
    const [updated] = await db
      .update(expenses)
      .set(patch)
      .where(eq(expenses.id, id))
      .returning();
    if (!updated) return c.json({ error: "Not found" }, 404);
    return c.json({ expense: updated });
  })
  .delete("/:id{\\d+}", async (c) => {
    const id = Number(c.req.param("id"));
    const [deletedRow] = await db
      .delete(expenses)
      .where(eq(expenses.id, id))
      .returning();
    if (!deletedRow) return c.json({ error: "Not found" }, 404);
    return c.json({ deleted: deletedRow });
  });
