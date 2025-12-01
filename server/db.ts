import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, signupRequests, featuredContent, InsertFeaturedContent, events, InsertEvent } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
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

// Signup request queries
export async function createSignupRequest(name: string, email: string, code: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15); // Código expira em 15 minutos

  await db.insert(signupRequests).values({
    name,
    email,
    verificationCode: code,
    verified: 0,
    expiresAt,
  });
}

export async function verifySignupCode(email: string, code: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const requests = await db
    .select()
    .from(signupRequests)
    .where(eq(signupRequests.email, email))
    .orderBy(signupRequests.createdAt)
    .limit(1);

  if (requests.length === 0) {
    return { success: false, error: "Solicitação não encontrada" };
  }

  const request = requests[0];

  if (request.verified === 1) {
    return { success: false, error: "Código já foi utilizado" };
  }

  if (new Date() > request.expiresAt) {
    return { success: false, error: "Código expirado" };
  }

  if (request.verificationCode !== code) {
    return { success: false, error: "Código inválido" };
  }

  // Marcar como verificado
  await db
    .update(signupRequests)
    .set({ verified: 1 })
    .where(eq(signupRequests.id, request.id));

  return { success: true, name: request.name, email: request.email };
}

export async function deleteOldSignupRequests() {
  const db = await getDb();
  if (!db) return;

  const now = new Date();
  await db.delete(signupRequests).where(eq(signupRequests.expiresAt, now));
}

// Featured Content queries
export async function getAllFeaturedContent() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(featuredContent)
    .where(eq(featuredContent.active, 1))
    .orderBy(featuredContent.order);
}

export async function createFeaturedContent(content: InsertFeaturedContent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(featuredContent).values(content);
}

export async function updateFeaturedContent(id: number, content: Partial<InsertFeaturedContent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(featuredContent).set(content).where(eq(featuredContent.id, id));
}

export async function deleteFeaturedContent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(featuredContent).set({ active: 0 }).where(eq(featuredContent.id, id));
}

// Events queries
export async function getAllActiveEvents() {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  return await db
    .select()
    .from(events)
    .where(eq(events.active, 1))
    .orderBy(events.eventDate);
}

export async function createEvent(event: InsertEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(events).values(event);
}

export async function updateEvent(id: number, event: Partial<InsertEvent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(events).set(event).where(eq(events.id, id));
}

export async function deleteEvent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(events).set({ active: 0 }).where(eq(events.id, id));
}

// TODO: add feature queries here as your schema grows.
