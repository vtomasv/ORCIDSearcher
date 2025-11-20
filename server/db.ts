import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  researchers, 
  InsertResearcher,
  orcidSearches,
  InsertOrcidSearch,
  uploadSessions,
  InsertUploadSession,
  institutions,
  InsertInstitution
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Upload Sessions
export async function createUploadSession(session: InsertUploadSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(uploadSessions).values(session);
  return result[0].insertId;
}

export async function getUploadSessionsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(uploadSessions)
    .where(eq(uploadSessions.userId, userId))
    .orderBy(desc(uploadSessions.createdAt));
}

export async function getUploadSession(sessionId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(uploadSessions)
    .where(eq(uploadSessions.id, sessionId))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUploadSession(sessionId: number, updates: Partial<InsertUploadSession>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(uploadSessions)
    .set(updates)
    .where(eq(uploadSessions.id, sessionId));
}

// Researchers
export async function createResearcher(researcher: InsertResearcher) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(researchers).values(researcher);
  return result[0].insertId;
}

export async function getResearchersByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(researchers)
    .where(eq(researchers.userId, userId))
    .orderBy(desc(researchers.createdAt));
}

export async function getResearchersBySession(userId: number, limit = 100) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(researchers)
    .where(eq(researchers.userId, userId))
    .orderBy(desc(researchers.createdAt))
    .limit(limit);
}

export async function getResearcherById(researcherId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(researchers)
    .where(eq(researchers.id, researcherId))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

// ORCID Searches
export async function createOrcidSearch(search: InsertOrcidSearch) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(orcidSearches).values(search);
  return result[0].insertId;
}

export async function getOrcidSearchByResearcher(researcherId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(orcidSearches)
    .where(eq(orcidSearches.researcherId, researcherId))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllOrcidSearchesByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    search: orcidSearches,
    researcher: researchers
  })
  .from(orcidSearches)
  .innerJoin(researchers, eq(orcidSearches.researcherId, researchers.id))
  .where(eq(researchers.userId, userId));
}

export async function getOrcidSearchesNeedingReview(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    search: orcidSearches,
    researcher: researchers
  })
  .from(orcidSearches)
  .innerJoin(researchers, eq(orcidSearches.researcherId, researchers.id))
  .where(
    and(
      eq(orcidSearches.needsReview, true),
      eq(researchers.userId, userId)
    )
  );
}

export async function updateOrcidSearch(searchId: number, updates: Partial<InsertOrcidSearch>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(orcidSearches)
    .set(updates)
    .where(eq(orcidSearches.id, searchId));
}

// Institutions
export async function createInstitution(institution: InsertInstitution) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(institutions).values(institution);
  return result[0].insertId;
}

export async function getAllInstitutions() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(institutions);
}

export async function getInstitutionByCanonical(canonical: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(institutions)
    .where(eq(institutions.canonical, canonical))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}
