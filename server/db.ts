import { eq, and, gte, count, sql, desc, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, signupRequests, featuredContent, InsertFeaturedContent, events, InsertEvent, contentViews, eventViews, comments, InsertComment, userPoints, badges, userBadges, pointsHistory, InsertBadge, newsletters, InsertNewsletter, newsletterSubscribers, notifications, InsertNotification } from "../drizzle/schema";
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
  
  // Adicionar pontos por visualizar conteúdo (apenas para usuários logados)
  if (userId) {
    await addPoints(userId, 5, 'content_view', 'Visualizou um conteúdo');
  }
}

export async function trackEventView(eventId: number, userId?: number) {
  const db = await getDb();
  if (!db) return;

  await db.insert(eventViews).values({
    eventId,
    userId: userId || null,
  });
  
  // Adicionar pontos por visualizar evento (apenas para usuários logados)
  if (userId) {
    await addPoints(userId, 5, 'event_view', 'Visualizou um evento');
  }
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

// Gamification queries
export async function addPoints(userId: number, points: number, action: string, description?: string) {
  const db = await getDb();
  if (!db) return;

  // Adicionar pontos ao histórico
  await db.insert(pointsHistory).values({
    userId,
    points,
    action,
    description: description || null,
  });

  // Atualizar total de pontos do usuário
  const existing = await db.select().from(userPoints).where(eq(userPoints.userId, userId)).limit(1);
  
  if (existing.length > 0) {
    const newTotal = existing[0].totalPoints + points;
    const newLevel = Math.floor(newTotal / 100) + 1; // 1 nível a cada 100 pontos
    
    await db.update(userPoints)
      .set({ totalPoints: newTotal, level: newLevel })
      .where(eq(userPoints.userId, userId));
  } else {
    await db.insert(userPoints).values({
      userId,
      totalPoints: points,
      level: 1,
    });
  }

  // Verificar se ganhou novos badges
  await checkAndAwardBadges(userId);
}

export async function checkAndAwardBadges(userId: number) {
  const db = await getDb();
  if (!db) return;

  const userPointsData = await db.select().from(userPoints).where(eq(userPoints.userId, userId)).limit(1);
  if (userPointsData.length === 0) return;

  const totalPoints = userPointsData[0].totalPoints;

  // Buscar badges que o usuário pode ganhar
  const availableBadges = await db.select().from(badges).where(sql`${badges.pointsRequired} <= ${totalPoints}`);
  
  // Buscar badges que o usuário já tem
  const earnedBadges = await db.select().from(userBadges).where(eq(userBadges.userId, userId));
  const earnedBadgeIds = earnedBadges.map(b => b.badgeId);

  // Conceder novos badges
  for (const badge of availableBadges) {
    if (!earnedBadgeIds.includes(badge.id)) {
      await db.insert(userBadges).values({
        userId,
        badgeId: badge.id,
      });
      
      // Criar notificação de novo badge
      await createNotification({
        userId,
        type: 'badge',
        title: '🏆 Novo Badge Conquistado!',
        message: `Parabéns! Você conquistou o badge "${badge.name}": ${badge.description}`,
        link: '/profile',
      });
    }
  }
}

export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const points = await db.select().from(userPoints).where(eq(userPoints.userId, userId)).limit(1);
  const userBadgesList = await db
    .select({
      id: badges.id,
      name: badges.name,
      description: badges.description,
      icon: badges.icon,
      color: badges.color,
      earnedAt: userBadges.earnedAt,
    })
    .from(userBadges)
    .leftJoin(badges, eq(userBadges.badgeId, badges.id))
    .where(eq(userBadges.userId, userId));

  return {
    points: points[0] || { totalPoints: 0, level: 1 },
    badges: userBadgesList,
  };
}

export async function getLeaderboard(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      userId: userPoints.userId,
      userName: users.name,
      totalPoints: userPoints.totalPoints,
      level: userPoints.level,
    })
    .from(userPoints)
    .leftJoin(users, eq(userPoints.userId, users.id))
    .orderBy(desc(userPoints.totalPoints))
    .limit(limit);
}

export async function createBadge(badge: InsertBadge) {
  const db = await getDb();
  if (!db) return null;

  return db.insert(badges).values(badge);
}

export async function listBadges() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(badges).orderBy(badges.pointsRequired);
}

// Newsletter queries
export async function createNewsletter(newsletter: InsertNewsletter) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(newsletters).values(newsletter);
  return result;
}

export async function listNewsletters() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(newsletters).orderBy(desc(newsletters.createdAt));
}

export async function getNewsletter(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(newsletters).where(eq(newsletters.id, id)).limit(1);
  return result[0] || null;
}

export async function updateNewsletter(id: number, data: Partial<InsertNewsletter>) {
  const db = await getDb();
  if (!db) return;

  await db.update(newsletters).set(data).where(eq(newsletters.id, id));
}

export async function deleteNewsletter(id: number) {
  const db = await getDb();
  if (!db) return;

  await db.delete(newsletters).where(eq(newsletters.id, id));
}

export async function getSubscribers() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      userId: newsletterSubscribers.userId,
      email: users.email,
      name: users.name,
      subscribedAt: newsletterSubscribers.subscribedAt,
    })
    .from(newsletterSubscribers)
    .leftJoin(users, eq(newsletterSubscribers.userId, users.id))
    .where(eq(newsletterSubscribers.subscribed, 1));
}

export async function subscribeToNewsletter(userId: number) {
  const db = await getDb();
  if (!db) return;

  const existing = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.userId, userId)).limit(1);
  
  if (existing.length > 0) {
    await db.update(newsletterSubscribers)
      .set({ subscribed: 1, unsubscribedAt: null })
      .where(eq(newsletterSubscribers.userId, userId));
  } else {
    await db.insert(newsletterSubscribers).values({ userId });
  }
}

export async function unsubscribeFromNewsletter(userId: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(newsletterSubscribers)
    .set({ subscribed: 0, unsubscribedAt: new Date() })
    .where(eq(newsletterSubscribers.userId, userId));
}

// Notifications queries
export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(notifications).values(notification);
  return result;
}

export async function getUserNotifications(userId: number, unreadOnly = false) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(notifications.userId, userId)];
  if (unreadOnly) {
    conditions.push(eq(notifications.read, 0));
  }

  return db
    .select()
    .from(notifications)
    .where(and(...conditions))
    .orderBy(desc(notifications.createdAt))
    .limit(50);
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(notifications).set({ read: 1 }).where(eq(notifications.id, id));
}

export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(notifications).set({ read: 1 }).where(eq(notifications.userId, userId));
}

export async function getUnreadNotificationsCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select({ count: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.read, 0)));

  return result[0]?.count || 0;
}

// TODO: add feature queries here as your schema grows.
