// server/db/schema.ts
import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 100 }).notNull(),
  amount: integer("amount").notNull(),
  fileUrl: varchar("file_url", { length: 500 }),
});
