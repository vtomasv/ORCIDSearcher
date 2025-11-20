import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Initialize default user for simplified authentication
 * This creates a default user that everyone uses (no login required)
 */
export async function initDefaultUser() {
  const db = await getDb();
  if (!db) {
    console.warn("[initDefaultUser] Database not available, skipping default user creation");
    return null;
  }

  const defaultEmail = "default@orcidmanager.local";
  
  try {
    // Check if default user already exists
    const existing = await db.select().from(users)
      .where(eq(users.email, defaultEmail))
      .limit(1);
    
    if (existing.length > 0) {
      console.log("[initDefaultUser] Default user already exists");
      return existing[0];
    }

    // Create default user
    const result = await db.insert(users).values({
      email: defaultEmail,
      name: "Default User",
      loginMethod: "internal",
      role: "admin", // Default user is admin
      lastSignedIn: new Date(),
    });

    console.log("[initDefaultUser] Default user created successfully");
    
    // Fetch the created user
    const newUser = await db.select().from(users)
      .where(eq(users.email, defaultEmail))
      .limit(1);
    
    return newUser[0];
  } catch (error) {
    console.error("[initDefaultUser] Error creating default user:", error);
    return null;
  }
}

/**
 * Get the default user (creates if doesn't exist)
 */
export async function getDefaultUser() {
  const db = await getDb();
  if (!db) {
    return null;
  }

  const defaultEmail = "default@orcidmanager.local";
  
  const result = await db.select().from(users)
    .where(eq(users.email, defaultEmail))
    .limit(1);
  
  if (result.length > 0) {
    return result[0];
  }

  // Create if doesn't exist
  return initDefaultUser();
}
