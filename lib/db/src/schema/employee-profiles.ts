import { pgTable, text, bigint, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const employeeProfilesTable = pgTable(
  "employee_profiles",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity(),
    employeeId: text("employee_id").notNull(),
    fullName: text("full_name").notNull(),
    department: text("department"),
    email: text("email"),
    phone: text("phone"),
    avatarUrl: text("avatar_url"),
    profileImageUrl: text("profile_image_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    employeeIdUnique: uniqueIndex("employee_profiles_employee_id_unique").on(t.employeeId),
  }),
);

export const insertEmployeeProfileSchema = createInsertSchema(employeeProfilesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertEmployeeProfile = z.infer<typeof insertEmployeeProfileSchema>;
export type EmployeeProfile = typeof employeeProfilesTable.$inferSelect;
