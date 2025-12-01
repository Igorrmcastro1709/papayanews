import { eq, and, gte, count, sql, desc, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, signupRequests, featuredContent, InsertFeaturedContent, events, InsertEvent, contentViews, eventViews, comments, InsertComment } from "../drizzle/schema";
import { ENV } from './_core/env';
import { notifyOwner } from './_core/notification';
import { sendVerificationEmail as sendVerificationEmailResend } from './_core/email';

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

  // Enviar notificação com código de verificação
  try {
    await sendVerificationEmail(email, name, code);
  } catch (error) {
    console.error('❌ Erro ao enviar email de verificação:', error);
    // Não falhar o cadastro se o email não for enviado
  }
}

/**
 * Envia email de verificação para o usuário
 * Se RESEND_API_KEY estiver configurada, envia email real
 * Caso contrário, envia notificação ao proprietário
 */
export async function sendVerificationEmail(email: string, name: string, code: string) {
  // Tentar enviar email real primeiro
  const emailSent = await sendVerificationEmailResend(email, name, code);
  
  if (emailSent) {
    console.log(`✅ Email de verificação enviado para ${email}`);
    return;
  }
  
  // Fallback: notificar proprietário se email não foi enviado
  const message = `
🆕 Novo cadastro na comunidade PapayaNews!

👤 Nome: ${name}
📧 Email: ${email}
🔐 Código de verificação: ${code}

⏰ Válido por 15 minutos

⚠️ RESEND_API_KEY não configurada - email não foi enviado ao usuário.
  `.trim();

  await notifyOwner({
    title: 'Novo Cadastro - PapayaNews (Email não enviado)',
    content: message,
  });

  console.log(`📧 Notificação de cadastro enviada ao proprietário`);
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

// Analytics queries
export async function getAnalytics() {
  const db = await getDb();
  if (!db) return null;

  // Total de membros
  const totalMembers = await db.select({ count: count() }).from(users);
  
  // Membros ativos (últimos 30 dias)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const activeMembers = await db
    .select({ count: count() })
    .from(users)
    .where(gte(users.lastSignedIn, thirtyDaysAgo));

  // Conteúdos mais acessados
  const topContent = await db
    .select({
      contentId: contentViews.contentId,
      views: count(contentViews.id),
    })
    .from(contentViews)
    .groupBy(contentViews.contentId)
    .orderBy(sql`count(${contentViews.id}) DESC`)
    .limit(5);

  // Eventos mais visualizados
  const topEvents = await db
    .select({
      eventId: eventViews.eventId,
      views: count(eventViews.id),
    })
    .from(eventViews)
    .groupBy(eventViews.eventId)
    .orderBy(sql`count(${eventViews.id}) DESC`)
    .limit(5);

  // Total de visualizações de conteúdo
  const totalContentViews = await db.select({ count: count() }).from(contentViews);
  
  // Total de visualizações de eventos
  const totalEventViews = await db.select({ count: count() }).from(eventViews);

  return {
    totalMembers: totalMembers[0]?.count || 0,
    activeMembers: activeMembers[0]?.count || 0,
    totalContentViews: totalContentViews[0]?.count || 0,
    totalEventViews: totalEventViews[0]?.count || 0,
    topContent,
    topEvents,
  };
}

export async function trackContentView(contentId: number, userId?: number) {
  const db = await getDb();
  if (!db) return;

  await db.insert(contentViews).values({
    contentId,
    userId: userId || null,
  });
}

export async function trackEventView(eventId: number, userId?: number) {
  const db = await getDb();
  if (!db) return;

  await db.insert(eventViews).values({
    eventId,
    userId: userId || null,
  });
}

// Comments queries
export async function createComment(comment: InsertComment) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(comments).values(comment);
  return result;
}

export async function getContentComments(contentId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: comments.id,
      text: comments.text,
      createdAt: comments.createdAt,
      approved: comments.approved,
      userName: users.name,
      userEmail: users.email,
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(and(eq(comments.contentId, contentId), eq(comments.approved, 1)))
    .orderBy(desc(comments.createdAt));
}

export async function getEventComments(eventId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: comments.id,
      text: comments.text,
      createdAt: comments.createdAt,
      approved: comments.approved,
      userName: users.name,
      userEmail: users.email,
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(and(eq(comments.eventId, eventId), eq(comments.approved, 1)))
    .orderBy(desc(comments.createdAt));
}

export async function getPendingComments() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: comments.id,
      text: comments.text,
      contentId: comments.contentId,
      eventId: comments.eventId,
      createdAt: comments.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.approved, 0))
    .orderBy(desc(comments.createdAt));
}

export async function approveComment(commentId: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(comments).set({ approved: 1 }).where(eq(comments.id, commentId));
}

export async function deleteComment(commentId: number) {
  const db = await getDb();
  if (!db) return;

  await db.delete(comments).where(eq(comments.id, commentId));
}

// TODO: add feature queries here as your schema grows.
