import { pgTable, uuid, text, bigint, timestamp } from "drizzle-orm/pg-core";

// ─── Clients ────────────────────────────────────────────────────────────────

export const clientsTable = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id"),
  name: text("name").notNull(),
  sector: text("sector").notNull().default(""),
  email: text("email").notNull().default(""),
  phone: text("phone").default(""),
  city: text("city").default(""),
  initials: text("initials").default(""),
  gradient: text("gradient").default("from-gray-600 to-gray-400"),
  statusText: text("status_text").default("Nouveau"),
  statusColor: text("status_color").default("info"),
  // Stocké en centimes (ex: 150050 = 1 500,50€)
  revenue: bigint("revenue", { mode: "number" }).default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export type Client = typeof clientsTable.$inferSelect;
export type InsertClient = typeof clientsTable.$inferInsert;

// ─── Projects ───────────────────────────────────────────────────────────────

export const projectsTable = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id"),
  // clientId référence souple vers clients.id (texte pour éviter les FK strictes)
  clientId: text("client_id"),
  name: text("name").notNull(),
  client: text("client").notNull().default(""),
  // Stocké en centimes (ex: 500000 = 5 000€)
  budget: bigint("budget", { mode: "number" }).default(0),
  dates: text("dates").default(""),
  status: text("status").default("En cours"),
  statusColor: text("status_color").default("info"),
  progress: bigint("progress", { mode: "number" }).default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export type Project = typeof projectsTable.$inferSelect;
export type InsertProject = typeof projectsTable.$inferInsert;

// ─── Tasks ──────────────────────────────────────────────────────────────────

export const tasksTable = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id"),
  name: text("name").notNull(),
  date: text("date").default(""),
  priority: text("priority").default("Normal"),
  priorityColor: text("priority_color").default("info"),
  status: text("status").default("todo"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export type Task = typeof tasksTable.$inferSelect;
export type InsertTask = typeof tasksTable.$inferInsert;

// ─── Transactions (Finances) ─────────────────────────────────────────────────

export const transactionsTable = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id"),
  type: text("type").notNull(), // "revenue" | "expense"
  name: text("name").notNull(),
  date: text("date").default(""),
  // Stocké en centimes (ex: 150050 = 1 500,50€)
  amount: bigint("amount", { mode: "number" }).default(0),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export type Transaction = typeof transactionsTable.$inferSelect;
export type InsertTransaction = typeof transactionsTable.$inferInsert;

// ─── Invoices ────────────────────────────────────────────────────────────────

export const invoicesTable = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id"),
  // clientId référence souple vers clients.id
  clientId: text("client_id"),
  ref: text("ref").notNull().default(""),
  client: text("client").notNull().default(""),
  desc: text("description").default(""),
  // Stocké en centimes (ex: 150000 = 1 500€)
  amount: bigint("amount", { mode: "number" }).default(0),
  date: text("date").default(""),
  status: text("status").default("En attente"), // "En attente" | "Payée" | "En retard" | "Annulée"
  statusColor: text("status_color").default("warning"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export type Invoice = typeof invoicesTable.$inferSelect;
export type InsertInvoice = typeof invoicesTable.$inferInsert;
