import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const queueEntries = pgTable("queue_entries", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  referralCode: text("referral_code").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }).notNull(),
  position: integer("position").notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  startedAt: timestamp("started_at"),
  expiresAt: timestamp("expires_at"),
});

export const insertQueueEntrySchema = createInsertSchema(queueEntries, {
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50, "El nombre no puede tener más de 50 caracteres"),
  referralCode: z.string().min(3, "El código de referido es requerido").max(500, "El código es muy largo"),
}).pick({
  name: true,
  referralCode: true,
});

export type InsertQueueEntry = z.infer<typeof insertQueueEntrySchema>;
export type QueueEntry = typeof queueEntries.$inferSelect;

// For legacy compatibility
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
