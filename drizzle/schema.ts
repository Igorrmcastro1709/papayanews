import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela para armazenar solicitações de cadastro pendentes
 */
export const signupRequests = mysqlTable("signup_requests", {
  id: int("id").autoincrement().primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  verificationCode: varchar("verification_code", { length: 6 }).notNull(),
  verified: int("verified").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export type SignupRequest = typeof signupRequests.$inferSelect;
export type InsertSignupRequest = typeof signupRequests.$inferInsert;

/**
 * Tabela para armazenar conteúdos destacados (vídeos, artigos, etc)
 */
export const featuredContent = mysqlTable("featured_content", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  link: varchar("link", { length: 500 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(), // Vídeo, Newsletter, Canal, Artigo
  order: int("order").default(0).notNull(), // Ordem de exibição
  active: int("active").default(1).notNull(), // 1 = ativo, 0 = inativo
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type FeaturedContent = typeof featuredContent.$inferSelect;
export type InsertFeaturedContent = typeof featuredContent.$inferInsert;

/**
 * Tabela para armazenar eventos da comunidade
 */
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  eventDate: timestamp("event_date").notNull(),
  location: varchar("location", { length: 255 }), // Pode ser online ou presencial
  link: varchar("link", { length: 500 }), // Link para inscrição ou mais informações
  imageUrl: varchar("image_url", { length: 500 }),
  active: int("active").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

// TODO: Add your tables here