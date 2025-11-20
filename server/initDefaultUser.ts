import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const DEFAULT_EMAIL = "default@orcidmanager.local";
const DEFAULT_OPEN_ID = "default-user-openid";

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
  
  try {
    // Check if default user already exists (by email or openId)
    const existingByEmail = await db.select().from(users)
      .where(eq(users.email, DEFAULT_EMAIL))
      .limit(1);
    
    if (existingByEmail.length > 0) {
      console.log("[initDefaultUser] Default user already exists");
      return existingByEmail[0];
    }

    const existingByOpenId = await db.select().from(users)
      .where(eq(users.openId, DEFAULT_OPEN_ID))
      .limit(1);
    
    if (existingByOpenId.length > 0) {
      console.log("[initDefaultUser] Default user already exists (by openId)");
      return existingByOpenId[0];
    }

    // Create default user
    const result = await db.insert(users).values({
      email: DEFAULT_EMAIL,
      openId: DEFAULT_OPEN_ID,
      name: "Default User",
      loginMethod: "internal",
      role: "admin", // Default user is admin
      lastSignedIn: new Date(),
    });

    console.log("[initDefaultUser] Default user created successfully");
    
    // Fetch the created user
    const newUser = await db.select().from(users)
      .where(eq(users.email, DEFAULT_EMAIL))
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
  
  const result = await db.select().from(users)
    .where(eq(users.email, DEFAULT_EMAIL))
    .limit(1);
  
  if (result.length > 0) {
    return result[0];
  }

  // Create if doesn't exist
  return initDefaultUser();
}
