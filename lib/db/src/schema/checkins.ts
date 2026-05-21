import { pgTable, text, bigint, timestamp, smallint } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const checkinsTable = pgTable("checkins", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
  employeeId: text("employee_id").notNull(),
  employeeName: text("employee_name").notNull(),
  department: text("department"),
  mood: text("mood").notNull(),
  energyLevel: smallint("energy_level"),
  focusLevel: smallint("focus_level"),
  stressLevel: smallint("stress_level"),
  tags: text("tags").array().notNull().default([]),
  note: text("note"),
  checkedInAt: timestamp("checked_in_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCheckinSchema = createInsertSchema(checkinsTable).omit({ id: true, checkedInAt: true });
export type InsertCheckin = z.infer<typeof insertCheckinSchema>;
export type Checkin = typeof checkinsTable.$inferSelect;
