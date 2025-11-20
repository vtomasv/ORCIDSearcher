import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Supports both internal authentication (email/password) and optional OAuth
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  // openId is the primary identifier (matches original migration)
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
 * Institutions table - stores institution variants for ORCID searches
 */
export const institutions = mysqlTable("institutions", {
  id: int("id").autoincrement().primaryKey(),
  canonical: varchar("canonical", { length: 255 }).notNull(),
  country: varchar("country", { length: 100 }),
  countryCode: varchar("countryCode", { length: 10 }),
  orcidRegistryName: varchar("orcidRegistryName", { length: 255 }),
  variants: text("variants").notNull(), // JSON array of variant names
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Institution = typeof institutions.$inferSelect;
export type InsertInstitution = typeof institutions.$inferInsert;

/**
 * Researchers table - stores researcher information from uploaded Excel
 */
export const researchers = mysqlTable("researchers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Owner of this upload
  firstName: varchar("firstName", { length: 255 }).notNull(),
  lastName: varchar("lastName", { length: 255 }).notNull(),
  firstNameNormalized: varchar("firstNameNormalized", { length: 255 }).notNull(),
  lastNameNormalized: varchar("lastNameNormalized", { length: 255 }).notNull(),
  institution: varchar("institution", { length: 255 }),
  email: varchar("email", { length: 320 }),
  country: varchar("country", { length: 100 }),
  // Original Excel data stored as JSON for reference
  originalData: text("originalData"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Researcher = typeof researchers.$inferSelect;
export type InsertResearcher = typeof researchers.$inferInsert;

/**
 * ORCID searches table - stores search results and manual decisions
 */
export const orcidSearches = mysqlTable("orcid_searches", {
  id: int("id").autoincrement().primaryKey(),
  researcherId: int("researcherId").notNull(),
  // Search status: pending, searching, found, multiple, not_found, manual
  status: mysqlEnum("status", ["pending", "searching", "found", "multiple", "not_found", "manual"]).default("pending").notNull(),
  // Final ORCID ID (if found or manually selected)
  orcid: varchar("orcid", { length: 19 }), // Format: 0000-0001-2345-6789
  // Number of results found in search
  resultCount: int("resultCount").default(0),
  // Search URL that was used
  searchUrl: text("searchUrl"),
  // Strategy used: original, normalized, variant_1, etc.
  strategyUsed: varchar("strategyUsed", { length: 50 }),
  // For multiple results: store all found ORCIDs as JSON
  multipleResults: text("multipleResults"),
  // Manual review flag
  needsReview: boolean("needsReview").default(false),
  reviewedBy: int("reviewedBy"), // User ID who reviewed
  reviewedAt: timestamp("reviewedAt"),
  // Notes from manual review
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OrcidSearch = typeof orcidSearches.$inferSelect;
export type InsertOrcidSearch = typeof orcidSearches.$inferInsert;

/**
 * Upload sessions - tracks Excel upload and processing sessions
 */
export const uploadSessions = mysqlTable("upload_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  totalResearchers: int("totalResearchers").notNull(),
  processedCount: int("processedCount").default(0),
  foundCount: int("foundCount").default(0),
  multipleCount: int("multipleCount").default(0),
  notFoundCount: int("notFoundCount").default(0),
  status: mysqlEnum("status", ["uploading", "processing", "completed", "failed"]).default("uploading").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type UploadSession = typeof uploadSessions.$inferSelect;
export type InsertUploadSession = typeof uploadSessions.$inferInsert;
