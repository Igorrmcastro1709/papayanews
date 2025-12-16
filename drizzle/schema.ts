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

export type InsertEvent = typeof events.$inferInsert;

// Analytics tracking
export const contentViews = mysqlTable("content_views", {
  id: int("id").autoincrement().primaryKey(),
  contentId: int("content_id").notNull(),
  userId: int("user_id"),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
});

export const eventViews = mysqlTable("event_views", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("event_id").notNull(),
  userId: int("user_id"),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
});

// Comments system
export const comments = mysqlTable("comments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  contentId: int("content_id"), // Null se for comentário em evento
  eventId: int("event_id"), // Null se for comentário em conteúdo
  text: text("text").notNull(),
  approved: int("approved").default(1).notNull(), // 1 = aprovado, 0 = pendente moderação
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type InsertComment = typeof comments.$inferInsert;

// Gamification system
export const userPoints = mysqlTable("user_points", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().unique(),
  totalPoints: int("total_points").default(0).notNull(),
  level: int("level").default(1).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const badges = mysqlTable("badges", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }).notNull(), // emoji ou nome do ícone
  pointsRequired: int("points_required").notNull(),
  color: varchar("color", { length: 50 }).notNull(),
});

export const userBadges = mysqlTable("user_badges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  badgeId: int("badge_id").notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

export const pointsHistory = mysqlTable("points_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  points: int("points").notNull(),
  action: varchar("action", { length: 100 }).notNull(), // "comment", "event_view", "content_view", etc.
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type InsertUserPoints = typeof userPoints.$inferInsert;
export type InsertBadge = typeof badges.$inferInsert;
export type InsertUserBadge = typeof userBadges.$inferInsert;
export type InsertPointsHistory = typeof pointsHistory.$inferInsert;

// Newsletter system
export const newsletters = mysqlTable("newsletters", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  content: text("content").notNull(), // HTML content
  status: mysqlEnum("status", ["draft", "scheduled", "sent"]).default("draft").notNull(),
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  createdBy: int("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const newsletterSubscribers = mysqlTable("newsletter_subscribers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().unique(),
  subscribed: int("subscribed").default(1).notNull(), // 1 = inscrito, 0 = cancelado
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
  unsubscribedAt: timestamp("unsubscribed_at"),
});

export type InsertNewsletter = typeof newsletters.$inferInsert;
export type InsertNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;

// Notifications system
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  type: mysqlEnum("type", ["badge", "comment_reply", "event_reminder", "general"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  read: int("read").default(0).notNull(), // 0 = não lida, 1 = lida
  link: varchar("link", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type InsertNotification = typeof notifications.$inferInsert;

// Forum tables
export const forumThreads = mysqlTable("forum_threads", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  upvotes: int("upvotes").default(0).notNull(),
  views: int("views").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type ForumThread = typeof forumThreads.$inferSelect;
export type InsertForumThread = typeof forumThreads.$inferInsert;

export const forumReplies = mysqlTable("forum_replies", {
  id: int("id").autoincrement().primaryKey(),
  threadId: int("thread_id").notNull(),
  userId: int("user_id").notNull(),
  content: text("content").notNull(),
  upvotes: int("upvotes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type ForumReply = typeof forumReplies.$inferSelect;
export type InsertForumReply = typeof forumReplies.$inferInsert;

export const forumUpvotes = mysqlTable("forum_upvotes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  threadId: int("thread_id"),
  replyId: int("reply_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ForumUpvote = typeof forumUpvotes.$inferSelect;
export type InsertForumUpvote = typeof forumUpvotes.$inferInsert;

// User Streaks (dias consecutivos de acesso)
export const userStreaks = mysqlTable("user_streaks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  currentStreak: int("currentStreak").default(0).notNull(),
  longestStreak: int("longestStreak").default(0).notNull(),
  lastAccessDate: timestamp("lastAccessDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserStreak = typeof userStreaks.$inferSelect;
export type InsertUserStreak = typeof userStreaks.$inferInsert;

// Weekly Challenges (desafios semanais)
export const weeklyChallenges = mysqlTable("weekly_challenges", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  pointsReward: int("pointsReward").default(50).notNull(),
  targetAction: varchar("targetAction", { length: 100 }).notNull(),
  targetCount: int("targetCount").default(1).notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WeeklyChallenge = typeof weeklyChallenges.$inferSelect;

// User Challenge Progress
export const userChallengeProgress = mysqlTable("user_challenge_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  challengeId: int("challengeId").notNull(),
  currentProgress: int("currentProgress").default(0).notNull(),
  completed: int("completed").default(0).notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserChallengeProgress = typeof userChallengeProgress.$inferSelect;

// TODO: Add your tables here