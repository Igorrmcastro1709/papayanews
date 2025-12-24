import { eq, and, gte, count, sql, desc, or, lte, between } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, signupRequests, featuredContent, InsertFeaturedContent, events, InsertEvent, contentViews, eventViews, comments, InsertComment, userPoints, badges, userBadges, pointsHistory, InsertBadge, newsletters, InsertNewsletter, newsletterSubscribers, notifications, forumThreads, forumReplies, forumUpvotes, InsertNotification, userStreaks, weeklyChallenges, userChallengeProgress, chatMessages, InsertChatMessage, chatAttachments, InsertChatAttachment, dailySummaries, InsertDailySummary, userProfiles, InsertUserProfile, userConnections, InsertUserConnection, documentLibrary, InsertDocumentLibrary, shopProducts, InsertShopProduct, shopOrders, InsertShopOrder } from "../drizzle/schema";
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

export async function getUserGamificationProfile(userId: number) {
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

// Search queries
export async function searchContents(query: string) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(featuredContent)
    .where(
      or(
        sql`LOWER(${featuredContent.title}) LIKE LOWER(${`%${query}%`})`,
        sql`LOWER(${featuredContent.description}) LIKE LOWER(${`%${query}%`})`
      )
    )
    .limit(10);
}

export async function searchEvents(query: string) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(events)
    .where(
      or(
        sql`LOWER(${events.title}) LIKE LOWER(${`%${query}%`})`,
        sql`LOWER(${events.description}) LIKE LOWER(${`%${query}%`})`,
        sql`LOWER(${events.location}) LIKE LOWER(${`%${query}%`})`
      )
    )
    .limit(10);
}

export async function searchMembers(query: string) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(
      or(
        sql`LOWER(${users.name}) LIKE LOWER(${`%${query}%`})`,
        sql`LOWER(${users.email}) LIKE LOWER(${`%${query}%`})`
      )
    )
    .limit(10);
}

// Forum queries
export async function createForumThread(data: { userId: number; title: string; content: string; category: string }) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(forumThreads).values(data);
  return result;
}

export async function getForumThreads(category?: string) {
  const db = await getDb();
  if (!db) return [];

  let query = db
    .select({
      id: forumThreads.id,
      userId: forumThreads.userId,
      title: forumThreads.title,
      content: forumThreads.content,
      category: forumThreads.category,
      upvotes: forumThreads.upvotes,
      views: forumThreads.views,
      createdAt: forumThreads.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(forumThreads)
    .leftJoin(users, eq(forumThreads.userId, users.id))
    .orderBy(desc(forumThreads.createdAt));

  if (category) {
    return query.where(eq(forumThreads.category, category));
  }

  return query;
}

export async function getForumThread(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select({
      id: forumThreads.id,
      userId: forumThreads.userId,
      title: forumThreads.title,
      content: forumThreads.content,
      category: forumThreads.category,
      upvotes: forumThreads.upvotes,
      views: forumThreads.views,
      createdAt: forumThreads.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(forumThreads)
    .leftJoin(users, eq(forumThreads.userId, users.id))
    .where(eq(forumThreads.id, id))
    .limit(1);

  return result[0] || null;
}

export async function incrementThreadViews(id: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(forumThreads).set({ views: sql`${forumThreads.views} + 1` }).where(eq(forumThreads.id, id));
}

export async function createForumReply(data: { threadId: number; userId: number; content: string }) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(forumReplies).values(data);
  return result;
}

export async function getForumReplies(threadId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: forumReplies.id,
      threadId: forumReplies.threadId,
      userId: forumReplies.userId,
      content: forumReplies.content,
      upvotes: forumReplies.upvotes,
      createdAt: forumReplies.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(forumReplies)
    .leftJoin(users, eq(forumReplies.userId, users.id))
    .where(eq(forumReplies.threadId, threadId))
    .orderBy(forumReplies.createdAt);
}

export async function toggleUpvote(data: { userId: number; threadId?: number; replyId?: number }) {
  const db = await getDb();
  if (!db) return { success: false };

  // Check if already upvoted
  const existing = await db
    .select()
    .from(forumUpvotes)
    .where(
      and(
        eq(forumUpvotes.userId, data.userId),
        data.threadId ? eq(forumUpvotes.threadId, data.threadId) : sql`${forumUpvotes.threadId} IS NULL`,
        data.replyId ? eq(forumUpvotes.replyId, data.replyId) : sql`${forumUpvotes.replyId} IS NULL`
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Remove upvote
    await db.delete(forumUpvotes).where(eq(forumUpvotes.id, existing[0].id));

    // Decrement count
    if (data.threadId) {
      await db.update(forumThreads).set({ upvotes: sql`${forumThreads.upvotes} - 1` }).where(eq(forumThreads.id, data.threadId));
    } else if (data.replyId) {
      await db.update(forumReplies).set({ upvotes: sql`${forumReplies.upvotes} - 1` }).where(eq(forumReplies.id, data.replyId));
    }

    return { success: true, action: 'removed' };
  } else {
    // Add upvote
    await db.insert(forumUpvotes).values(data);

    // Increment count
    if (data.threadId) {
      await db.update(forumThreads).set({ upvotes: sql`${forumThreads.upvotes} + 1` }).where(eq(forumThreads.id, data.threadId));
    } else if (data.replyId) {
      await db.update(forumReplies).set({ upvotes: sql`${forumReplies.upvotes} + 1` }).where(eq(forumReplies.id, data.replyId));
    }

    return { success: true, action: 'added' };
  }
}

export async function getUserUpvotes(userId: number) {
  const db = await getDb();
  if (!db) return { threadIds: [], replyIds: [] };

  const upvotes = await db
    .select()
    .from(forumUpvotes)
    .where(eq(forumUpvotes.userId, userId));

  return {
    threadIds: upvotes.filter(u => u.threadId).map(u => u.threadId!),
    replyIds: upvotes.filter(u => u.replyId).map(u => u.replyId!),
  };
}

// Streak functions
export async function updateUserStreak(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Get current streak
  const existing = await db.select().from(userStreaks).where(eq(userStreaks.userId, userId)).limit(1);

  if (existing.length === 0) {
    // First access - create streak
    await db.insert(userStreaks).values({
      userId,
      currentStreak: 1,
      longestStreak: 1,
      lastAccessDate: today,
    });
    return { currentStreak: 1, longestStreak: 1, isNewDay: true };
  }

  const streak = existing[0];
  const lastAccess = streak.lastAccessDate ? new Date(streak.lastAccessDate) : null;
  
  if (lastAccess) {
    lastAccess.setHours(0, 0, 0, 0);
    
    // Same day - no update needed
    if (lastAccess.getTime() === today.getTime()) {
      return { currentStreak: streak.currentStreak, longestStreak: streak.longestStreak, isNewDay: false };
    }
    
    // Yesterday - continue streak
    if (lastAccess.getTime() === yesterday.getTime()) {
      const newStreak = streak.currentStreak + 1;
      const newLongest = Math.max(newStreak, streak.longestStreak);
      
      await db.update(userStreaks)
        .set({ currentStreak: newStreak, longestStreak: newLongest, lastAccessDate: today })
        .where(eq(userStreaks.userId, userId));
      
      // Bonus points for streak
      if (newStreak % 7 === 0) {
        await addPoints(userId, 50, 'streak_bonus', `Bônus de ${newStreak} dias de streak!`);
      }
      
      return { currentStreak: newStreak, longestStreak: newLongest, isNewDay: true };
    }
  }
  
  // Streak broken - reset to 1
  await db.update(userStreaks)
    .set({ currentStreak: 1, lastAccessDate: today })
    .where(eq(userStreaks.userId, userId));
  
  return { currentStreak: 1, longestStreak: streak.longestStreak, isNewDay: true };
}

export async function getUserStreak(userId: number) {
  const db = await getDb();
  if (!db) return { currentStreak: 0, longestStreak: 0 };

  const result = await db.select().from(userStreaks).where(eq(userStreaks.userId, userId)).limit(1);
  
  if (result.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }
  
  return { currentStreak: result[0].currentStreak, longestStreak: result[0].longestStreak };
}

// Weekly challenges functions
export async function getActiveChallenges() {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  
  return db.select()
    .from(weeklyChallenges)
    .where(and(
      eq(weeklyChallenges.isActive, 1),
      gte(weeklyChallenges.endDate, now)
    ));
}

export async function getUserChallengeProgress(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const challenges = await getActiveChallenges();
  const progress = await db.select()
    .from(userChallengeProgress)
    .where(eq(userChallengeProgress.userId, userId));

  return challenges.map(challenge => {
    const userProgress = progress.find(p => p.challengeId === challenge.id);
    return {
      ...challenge,
      currentProgress: userProgress?.currentProgress || 0,
      completed: userProgress?.completed === 1,
    };
  });
}

export async function updateChallengeProgress(userId: number, action: string) {
  const db = await getDb();
  if (!db) return;

  const challenges = await getActiveChallenges();
  const relevantChallenges = challenges.filter(c => c.targetAction === action);

  for (const challenge of relevantChallenges) {
    const existing = await db.select()
      .from(userChallengeProgress)
      .where(and(
        eq(userChallengeProgress.userId, userId),
        eq(userChallengeProgress.challengeId, challenge.id)
      ))
      .limit(1);

    if (existing.length === 0) {
      // Create progress
      const completed = 1 >= challenge.targetCount ? 1 : 0;
      await db.insert(userChallengeProgress).values({
        userId,
        challengeId: challenge.id,
        currentProgress: 1,
        completed,
        completedAt: completed ? new Date() : undefined,
      });
      
      if (completed) {
        await addPoints(userId, challenge.pointsReward, 'challenge_complete', `Desafio concluído: ${challenge.title}`);
      }
    } else if (existing[0].completed === 0) {
      const newProgress = existing[0].currentProgress + 1;
      const completed = newProgress >= challenge.targetCount ? 1 : 0;
      
      await db.update(userChallengeProgress)
        .set({
          currentProgress: newProgress,
          completed,
          completedAt: completed ? new Date() : undefined,
        })
        .where(eq(userChallengeProgress.id, existing[0].id));
      
      if (completed) {
        await addPoints(userId, challenge.pointsReward, 'challenge_complete', `Desafio concluído: ${challenge.title}`);
      }
    }
  }
}

// Get top members for ranking
export async function getTopMembers(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  return db.select({
    userId: userPoints.userId,
    totalPoints: userPoints.totalPoints,
    level: userPoints.level,
    userName: users.name,
    userEmail: users.email,
  })
    .from(userPoints)
    .leftJoin(users, eq(userPoints.userId, users.id))
    .orderBy(desc(userPoints.totalPoints))
    .limit(limit);
}

// Get user progress to next badge
export async function getUserBadgeProgress(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const userPointsData = await db.select().from(userPoints).where(eq(userPoints.userId, userId)).limit(1);
  const currentPoints = userPointsData[0]?.totalPoints || 0;

  const allBadges = await db.select().from(badges).orderBy(badges.pointsRequired);
  const earnedBadges = await db.select().from(userBadges).where(eq(userBadges.userId, userId));
  const earnedBadgeIds = earnedBadges.map(b => b.badgeId);

  const nextBadge = allBadges.find(b => !earnedBadgeIds.includes(b.id) && b.pointsRequired > currentPoints);
  
  if (!nextBadge) {
    return { currentPoints, nextBadge: null, pointsNeeded: 0, progress: 100 };
  }

  const previousBadge = allBadges.filter(b => b.pointsRequired <= currentPoints).pop();
  const basePoints = previousBadge?.pointsRequired || 0;
  const pointsNeeded = nextBadge.pointsRequired - currentPoints;
  const progress = Math.round(((currentPoints - basePoints) / (nextBadge.pointsRequired - basePoints)) * 100);

  return {
    currentPoints,
    nextBadge,
    pointsNeeded,
    progress: Math.min(progress, 100),
  };
}

// Chat Community Functions

export async function getChatMessages(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  const messages = await db
    .select({
      id: chatMessages.id,
      userId: chatMessages.userId,
      message: chatMessages.message,
      isAiResponse: chatMessages.isAiResponse,
      replyToId: chatMessages.replyToId,
      createdAt: chatMessages.createdAt,
    })
    .from(chatMessages)
    .orderBy(desc(chatMessages.createdAt))
    .limit(limit);

  // Buscar informações dos usuários
  const userIds = Array.from(new Set(messages.map(m => m.userId)));
  const usersData = await db.select().from(users).where(
    userIds.length > 0 ? sql`${users.id} IN (${sql.join(userIds.map(id => sql`${id}`), sql`, `)})` : sql`1=0`
  );

  const usersMap = new Map(usersData.map(u => [u.id, u]));

  return messages.reverse().map(m => ({
    ...m,
    userName: usersMap.get(m.userId)?.name || 'Usuário',
    userEmail: usersMap.get(m.userId)?.email || '',
  }));
}

export async function createChatMessage(data: InsertChatMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(chatMessages).values(data);
  return result;
}

export async function getCommunityContext() {
  const db = await getDb();
  if (!db) return null;

  // Buscar conteúdos recentes
  const recentContent = await db
    .select()
    .from(featuredContent)
    .where(eq(featuredContent.active, 1))
    .orderBy(desc(featuredContent.createdAt))
    .limit(5);

  // Buscar eventos próximos
  const upcomingEvents = await db
    .select()
    .from(events)
    .where(eq(events.active, 1))
    .orderBy(events.eventDate)
    .limit(5);

  // Buscar newsletters recentes
  const recentNewsletters = await db
    .select()
    .from(newsletters)
    .where(eq(newsletters.status, 'sent'))
    .orderBy(desc(newsletters.sentAt))
    .limit(3);

  return {
    recentContent,
    upcomingEvents,
    recentNewsletters,
  };
}

// Chat Attachments functions
export async function createChatAttachment(attachment: InsertChatAttachment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(chatAttachments).values(attachment);
  return result;
}

export async function getAttachmentsByMessageId(messageId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(chatAttachments)
    .where(eq(chatAttachments.messageId, messageId));
}

export async function getMessagesWithAttachments(limit = 50) {
  const db = await getDb();
  if (!db) return [];

  const messages = await db
    .select()
    .from(chatMessages)
    .orderBy(desc(chatMessages.createdAt))
    .limit(limit);

  // Buscar informações dos usuários
  const userIds = Array.from(new Set(messages.map(m => m.userId)));
  const usersData = userIds.length > 0 
    ? await db.select().from(users).where(sql`${users.id} IN (${sql.join(userIds.map(id => sql`${id}`), sql`, `)})`)
    : [];
  const usersMap = new Map(usersData.map(u => [u.id, u]));

  // Buscar anexos para cada mensagem
  const messagesWithAttachments = await Promise.all(
    messages.map(async (msg) => {
      const attachments = await getAttachmentsByMessageId(msg.id);
      return { 
        ...msg, 
        attachments,
        userName: usersMap.get(msg.userId)?.name || 'Usuário',
        userEmail: usersMap.get(msg.userId)?.email || '',
      };
    })
  );

  return messagesWithAttachments.reverse();
}

// Daily Summary functions
export async function createDailySummary(summary: InsertDailySummary) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(dailySummaries).values(summary);
}

export async function getDailySummary(date: Date) {
  const db = await getDb();
  if (!db) return null;

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const summaries = await db
    .select()
    .from(dailySummaries)
    .where(between(dailySummaries.summaryDate, startOfDay, endOfDay))
    .limit(1);

  return summaries[0] || null;
}

export async function getRecentDailySummaries(limit = 7) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(dailySummaries)
    .orderBy(desc(dailySummaries.summaryDate))
    .limit(limit);
}

export async function getMessagesForDateRange(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(chatMessages)
    .where(between(chatMessages.createdAt, startDate, endDate))
    .orderBy(chatMessages.createdAt);
}

// ==================== User Profiles ====================

export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const profiles = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  return profiles[0] || null;
}

export async function getUserProfileWithUser(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select({
      profile: userProfiles,
      user: users,
    })
    .from(users)
    .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
    .where(eq(users.id, userId))
    .limit(1);

  if (!result[0]) return null;

  return {
    ...result[0].user,
    profile: result[0].profile,
  };
}

export async function createOrUpdateProfile(userId: number, data: Partial<InsertUserProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existingProfile = await getUserProfile(userId);

  if (existingProfile) {
    await db
      .update(userProfiles)
      .set(data)
      .where(eq(userProfiles.userId, userId));
  } else {
    await db.insert(userProfiles).values({
      userId,
      ...data,
    });
  }

  return await getUserProfile(userId);
}

export async function getAllPublicProfiles(options: { limit?: number; offset?: number; search?: string; interests?: string[] } = {}) {
  const db = await getDb();
  if (!db) return [];

  const { limit = 50, offset = 0, search, interests } = options;

  let query = db
    .select({
      user: users,
      profile: userProfiles,
      points: userPoints,
    })
    .from(users)
    .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
    .leftJoin(userPoints, eq(users.id, userPoints.userId))
    .where(
      or(
        eq(userProfiles.isPublic, 1),
        sql`${userProfiles.isPublic} IS NULL`
      )
    )
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);

  const results = await query;

  // Filtrar por busca e interesses no lado do servidor
  let filtered = results.map(r => ({
    id: r.user.id,
    name: r.user.name,
    email: r.user.email,
    createdAt: r.user.createdAt,
    profile: r.profile,
    totalPoints: r.points?.totalPoints || 0,
    level: r.points?.level || 1,
  }));

  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(u => 
      u.name?.toLowerCase().includes(searchLower) ||
      u.profile?.headline?.toLowerCase().includes(searchLower) ||
      u.profile?.company?.toLowerCase().includes(searchLower)
    );
  }

  if (interests && interests.length > 0) {
    filtered = filtered.filter(u => {
      if (!u.profile?.interests) return false;
      try {
        const userInterests = JSON.parse(u.profile.interests) as string[];
        return interests.some(i => userInterests.includes(i));
      } catch {
        return false;
      }
    });
  }

  return filtered;
}

// ==================== User Connections ====================

export async function sendConnectionRequest(requesterId: number, receiverId: number, message?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verificar se já existe uma conexão
  const existing = await db
    .select()
    .from(userConnections)
    .where(
      or(
        and(
          eq(userConnections.requesterId, requesterId),
          eq(userConnections.receiverId, receiverId)
        ),
        and(
          eq(userConnections.requesterId, receiverId),
          eq(userConnections.receiverId, requesterId)
        )
      )
    )
    .limit(1);

  if (existing.length > 0) {
    throw new Error("Já existe uma solicitação de conexão entre esses usuários");
  }

  await db.insert(userConnections).values({
    requesterId,
    receiverId,
    message,
    status: "pending",
  });

  return true;
}

export async function respondToConnectionRequest(connectionId: number, userId: number, accept: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verificar se o usuário é o receiver da solicitação
  const connection = await db
    .select()
    .from(userConnections)
    .where(
      and(
        eq(userConnections.id, connectionId),
        eq(userConnections.receiverId, userId)
      )
    )
    .limit(1);

  if (!connection[0]) {
    throw new Error("Solicitação de conexão não encontrada");
  }

  await db
    .update(userConnections)
    .set({ status: accept ? "accepted" : "rejected" })
    .where(eq(userConnections.id, connectionId));

  return true;
}

export async function getUserConnections(userId: number) {
  const db = await getDb();
  if (!db) return [];

  // Buscar conexões aceitas onde o usuário é requester ou receiver
  const connections = await db
    .select()
    .from(userConnections)
    .where(
      and(
        eq(userConnections.status, "accepted"),
        or(
          eq(userConnections.requesterId, userId),
          eq(userConnections.receiverId, userId)
        )
      )
    );

  // Buscar dados dos usuários conectados
  const connectedUserIds = connections.map(c => 
    c.requesterId === userId ? c.receiverId : c.requesterId
  );

  if (connectedUserIds.length === 0) return [];

  const connectedUsers = await db
    .select({
      user: users,
      profile: userProfiles,
    })
    .from(users)
    .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
    .where(sql`${users.id} IN (${sql.join(connectedUserIds.map(id => sql`${id}`), sql`, `)})`);

  return connectedUsers.map(u => ({
    id: u.user.id,
    name: u.user.name,
    email: u.user.email,
    profile: u.profile,
    connectionId: connections.find(c => 
      c.requesterId === u.user.id || c.receiverId === u.user.id
    )?.id,
  }));
}

export async function getPendingConnectionRequests(userId: number) {
  const db = await getDb();
  if (!db) return [];

  // Solicitações recebidas pendentes
  const requests = await db
    .select()
    .from(userConnections)
    .where(
      and(
        eq(userConnections.receiverId, userId),
        eq(userConnections.status, "pending")
      )
    );

  if (requests.length === 0) return [];

  const requesterIds = requests.map(r => r.requesterId);

  const requesters = await db
    .select({
      user: users,
      profile: userProfiles,
    })
    .from(users)
    .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
    .where(sql`${users.id} IN (${sql.join(requesterIds.map(id => sql`${id}`), sql`, `)})`);

  return requests.map(r => {
    const requester = requesters.find(u => u.user.id === r.requesterId);
    return {
      connectionId: r.id,
      message: r.message,
      createdAt: r.createdAt,
      requester: requester ? {
        id: requester.user.id,
        name: requester.user.name,
        email: requester.user.email,
        profile: requester.profile,
      } : null,
    };
  });
}

export async function getConnectionStatus(userId1: number, userId2: number) {
  const db = await getDb();
  if (!db) return null;

  const connection = await db
    .select()
    .from(userConnections)
    .where(
      or(
        and(
          eq(userConnections.requesterId, userId1),
          eq(userConnections.receiverId, userId2)
        ),
        and(
          eq(userConnections.requesterId, userId2),
          eq(userConnections.receiverId, userId1)
        )
      )
    )
    .limit(1);

  if (!connection[0]) return null;

  return {
    id: connection[0].id,
    status: connection[0].status,
    isRequester: connection[0].requesterId === userId1,
  };
}

export async function removeConnection(connectionId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verificar se o usuário faz parte da conexão
  const connection = await db
    .select()
    .from(userConnections)
    .where(
      and(
        eq(userConnections.id, connectionId),
        or(
          eq(userConnections.requesterId, userId),
          eq(userConnections.receiverId, userId)
        )
      )
    )
    .limit(1);

  if (!connection[0]) {
    throw new Error("Conexão não encontrada");
  }

  await db
    .delete(userConnections)
    .where(eq(userConnections.id, connectionId));

  return true;
}

// TODO: add feature queries here as your schema grows.


// ==================== Biblioteca de Documentos ====================

export async function createDocument(data: InsertDocumentLibrary) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(documentLibrary).values(data);
  return result;
}

export async function getDocuments(options?: { 
  category?: string; 
  userId?: number; 
  isPublic?: boolean;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db
    .select({
      id: documentLibrary.id,
      userId: documentLibrary.userId,
      title: documentLibrary.title,
      description: documentLibrary.description,
      fileName: documentLibrary.fileName,
      fileUrl: documentLibrary.fileUrl,
      fileKey: documentLibrary.fileKey,
      fileType: documentLibrary.fileType,
      fileSize: documentLibrary.fileSize,
      mimeType: documentLibrary.mimeType,
      category: documentLibrary.category,
      tags: documentLibrary.tags,
      aiSummary: documentLibrary.aiSummary,
      aiContext: documentLibrary.aiContext,
      aiOutcomes: documentLibrary.aiOutcomes,
      aiProcessedAt: documentLibrary.aiProcessedAt,
      downloadCount: documentLibrary.downloadCount,
      isPublic: documentLibrary.isPublic,
      chatMessageId: documentLibrary.chatMessageId,
      createdAt: documentLibrary.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(documentLibrary)
    .leftJoin(users, eq(documentLibrary.userId, users.id))
    .orderBy(desc(documentLibrary.createdAt));

  const conditions = [];
  
  if (options?.category) {
    conditions.push(eq(documentLibrary.category, options.category));
  }
  
  if (options?.userId) {
    conditions.push(eq(documentLibrary.userId, options.userId));
  }
  
  if (options?.isPublic !== undefined) {
    conditions.push(eq(documentLibrary.isPublic, options.isPublic ? 1 : 0));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }

  if (options?.limit) {
    query = query.limit(options.limit) as typeof query;
  }

  if (options?.offset) {
    query = query.offset(options.offset) as typeof query;
  }

  return query;
}

export async function getDocumentById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select({
      id: documentLibrary.id,
      userId: documentLibrary.userId,
      title: documentLibrary.title,
      description: documentLibrary.description,
      fileName: documentLibrary.fileName,
      fileUrl: documentLibrary.fileUrl,
      fileKey: documentLibrary.fileKey,
      fileType: documentLibrary.fileType,
      fileSize: documentLibrary.fileSize,
      mimeType: documentLibrary.mimeType,
      category: documentLibrary.category,
      tags: documentLibrary.tags,
      aiSummary: documentLibrary.aiSummary,
      aiContext: documentLibrary.aiContext,
      aiOutcomes: documentLibrary.aiOutcomes,
      aiProcessedAt: documentLibrary.aiProcessedAt,
      downloadCount: documentLibrary.downloadCount,
      isPublic: documentLibrary.isPublic,
      chatMessageId: documentLibrary.chatMessageId,
      createdAt: documentLibrary.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(documentLibrary)
    .leftJoin(users, eq(documentLibrary.userId, users.id))
    .where(eq(documentLibrary.id, id))
    .limit(1);

  return result[0] || null;
}

export async function updateDocumentAISummary(id: number, data: {
  aiSummary: string;
  aiContext: string;
  aiOutcomes: string;
}) {
  const db = await getDb();
  if (!db) return null;

  await db.update(documentLibrary)
    .set({
      aiSummary: data.aiSummary,
      aiContext: data.aiContext,
      aiOutcomes: data.aiOutcomes,
      aiProcessedAt: new Date(),
    })
    .where(eq(documentLibrary.id, id));

  return { success: true };
}

export async function incrementDocumentDownload(id: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(documentLibrary)
    .set({ downloadCount: sql`${documentLibrary.downloadCount} + 1` })
    .where(eq(documentLibrary.id, id));
}

export async function searchDocuments(query: string) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: documentLibrary.id,
      userId: documentLibrary.userId,
      title: documentLibrary.title,
      description: documentLibrary.description,
      fileName: documentLibrary.fileName,
      fileUrl: documentLibrary.fileUrl,
      fileType: documentLibrary.fileType,
      fileSize: documentLibrary.fileSize,
      category: documentLibrary.category,
      aiSummary: documentLibrary.aiSummary,
      createdAt: documentLibrary.createdAt,
      userName: users.name,
    })
    .from(documentLibrary)
    .leftJoin(users, eq(documentLibrary.userId, users.id))
    .where(
      and(
        eq(documentLibrary.isPublic, 1),
        or(
          sql`LOWER(${documentLibrary.title}) LIKE LOWER(${`%${query}%`})`,
          sql`LOWER(${documentLibrary.description}) LIKE LOWER(${`%${query}%`})`,
          sql`LOWER(${documentLibrary.aiSummary}) LIKE LOWER(${`%${query}%`})`,
          sql`LOWER(${documentLibrary.fileName}) LIKE LOWER(${`%${query}%`})`
        )
      )
    )
    .orderBy(desc(documentLibrary.createdAt))
    .limit(20);
}

export async function deleteDocument(id: number, userId: number) {
  const db = await getDb();
  if (!db) return { success: false };

  // Verificar se o documento pertence ao usuário
  const doc = await db
    .select()
    .from(documentLibrary)
    .where(and(eq(documentLibrary.id, id), eq(documentLibrary.userId, userId)))
    .limit(1);

  if (doc.length === 0) {
    return { success: false, error: 'Documento não encontrado ou sem permissão' };
  }

  await db.delete(documentLibrary).where(eq(documentLibrary.id, id));
  return { success: true };
}

export async function getDocumentStats() {
  const db = await getDb();
  if (!db) return { total: 0, totalSize: 0, byCategory: [] };

  const total = await db.select({ count: count() }).from(documentLibrary);
  const totalSize = await db.select({ sum: sql<number>`SUM(${documentLibrary.fileSize})` }).from(documentLibrary);
  
  const byCategory = await db
    .select({
      category: documentLibrary.category,
      count: count(),
    })
    .from(documentLibrary)
    .groupBy(documentLibrary.category);

  return {
    total: total[0]?.count || 0,
    totalSize: totalSize[0]?.sum || 0,
    byCategory,
  };
}


// ==================== PAPAYA SHOP ====================

// Listar produtos ativos
export async function getShopProducts(category?: string) {
  const db = await getDb();
  if (!db) return [];

  let query = db
    .select()
    .from(shopProducts)
    .where(eq(shopProducts.isActive, 1))
    .orderBy(desc(shopProducts.createdAt));

  if (category) {
    return db
      .select()
      .from(shopProducts)
      .where(and(eq(shopProducts.isActive, 1), eq(shopProducts.category, category as any)))
      .orderBy(desc(shopProducts.createdAt));
  }

  return query;
}

// Obter produto por ID
export async function getShopProduct(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(shopProducts)
    .where(eq(shopProducts.id, id))
    .limit(1);

  return result[0] || null;
}

// Criar produto (admin)
export async function createShopProduct(data: InsertShopProduct) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(shopProducts).values(data);
  return result;
}

// Atualizar produto (admin)
export async function updateShopProduct(id: number, data: Partial<InsertShopProduct>) {
  const db = await getDb();
  if (!db) return null;

  await db.update(shopProducts).set(data).where(eq(shopProducts.id, id));
  return { success: true };
}

// Deletar produto (admin)
export async function deleteShopProduct(id: number) {
  const db = await getDb();
  if (!db) return null;

  await db.delete(shopProducts).where(eq(shopProducts.id, id));
  return { success: true };
}

// Criar pedido (resgate)
export async function createShopOrder(data: InsertShopOrder) {
  const db = await getDb();
  if (!db) return null;

  // Verificar estoque
  const product = await getShopProduct(data.productId);
  if (!product) return { success: false, error: 'Produto não encontrado' };
  if (product.stock !== -1 && product.stock < (data.quantity || 1)) {
    return { success: false, error: 'Estoque insuficiente' };
  }

  // Criar pedido
  const result = await db.insert(shopOrders).values(data);

  // Atualizar estoque se não for ilimitado
  if (product.stock !== -1) {
    await db.update(shopProducts)
      .set({ 
        stock: sql`${shopProducts.stock} - ${data.quantity || 1}`,
        totalSold: sql`${shopProducts.totalSold} + ${data.quantity || 1}`
      })
      .where(eq(shopProducts.id, data.productId));
  } else {
    await db.update(shopProducts)
      .set({ totalSold: sql`${shopProducts.totalSold} + ${data.quantity || 1}` })
      .where(eq(shopProducts.id, data.productId));
  }

  return { success: true, orderId: result[0].insertId };
}

// Listar pedidos do usuário
export async function getUserOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: shopOrders.id,
      productId: shopOrders.productId,
      quantity: shopOrders.quantity,
      paymentMethod: shopOrders.paymentMethod,
      pointsSpent: shopOrders.pointsSpent,
      cashSpent: shopOrders.cashSpent,
      status: shopOrders.status,
      createdAt: shopOrders.createdAt,
      productName: shopProducts.name,
      productImage: shopProducts.imageUrl,
      productCategory: shopProducts.category,
    })
    .from(shopOrders)
    .leftJoin(shopProducts, eq(shopOrders.productId, shopProducts.id))
    .where(eq(shopOrders.userId, userId))
    .orderBy(desc(shopOrders.createdAt));
}

// Listar todos os pedidos (admin)
export async function getAllOrders(status?: string) {
  const db = await getDb();
  if (!db) return [];

  let baseQuery = db
    .select({
      id: shopOrders.id,
      userId: shopOrders.userId,
      productId: shopOrders.productId,
      quantity: shopOrders.quantity,
      paymentMethod: shopOrders.paymentMethod,
      pointsSpent: shopOrders.pointsSpent,
      cashSpent: shopOrders.cashSpent,
      status: shopOrders.status,
      shippingName: shopOrders.shippingName,
      shippingAddress: shopOrders.shippingAddress,
      shippingCity: shopOrders.shippingCity,
      shippingState: shopOrders.shippingState,
      shippingZip: shopOrders.shippingZip,
      trackingCode: shopOrders.trackingCode,
      notes: shopOrders.notes,
      createdAt: shopOrders.createdAt,
      productName: shopProducts.name,
      productImage: shopProducts.imageUrl,
      userName: users.name,
      userEmail: users.email,
    })
    .from(shopOrders)
    .leftJoin(shopProducts, eq(shopOrders.productId, shopProducts.id))
    .leftJoin(users, eq(shopOrders.userId, users.id))
    .orderBy(desc(shopOrders.createdAt));

  if (status) {
    return db
      .select({
        id: shopOrders.id,
        userId: shopOrders.userId,
        productId: shopOrders.productId,
        quantity: shopOrders.quantity,
        paymentMethod: shopOrders.paymentMethod,
        pointsSpent: shopOrders.pointsSpent,
        cashSpent: shopOrders.cashSpent,
        status: shopOrders.status,
        shippingName: shopOrders.shippingName,
        shippingAddress: shopOrders.shippingAddress,
        shippingCity: shopOrders.shippingCity,
        shippingState: shopOrders.shippingState,
        shippingZip: shopOrders.shippingZip,
        trackingCode: shopOrders.trackingCode,
        notes: shopOrders.notes,
        createdAt: shopOrders.createdAt,
        productName: shopProducts.name,
        productImage: shopProducts.imageUrl,
        userName: users.name,
        userEmail: users.email,
      })
      .from(shopOrders)
      .leftJoin(shopProducts, eq(shopOrders.productId, shopProducts.id))
      .leftJoin(users, eq(shopOrders.userId, users.id))
      .where(eq(shopOrders.status, status as any))
      .orderBy(desc(shopOrders.createdAt));
  }

  return baseQuery;
}

// Atualizar status do pedido (admin)
export async function updateOrderStatus(orderId: number, status: string, trackingCode?: string) {
  const db = await getDb();
  if (!db) return null;

  const updateData: Record<string, any> = { status };
  
  if (status === 'confirmed') {
    updateData.confirmedAt = new Date();
  } else if (status === 'shipped') {
    updateData.shippedAt = new Date();
    if (trackingCode) updateData.trackingCode = trackingCode;
  } else if (status === 'delivered') {
    updateData.deliveredAt = new Date();
  }

  await db.update(shopOrders).set(updateData).where(eq(shopOrders.id, orderId));
  return { success: true };
}

// Obter estatísticas da loja (admin)
export async function getShopStats() {
  const db = await getDb();
  if (!db) return null;

  const [totalProducts] = await db.select({ count: count() }).from(shopProducts).where(eq(shopProducts.isActive, 1));
  const [totalOrders] = await db.select({ count: count() }).from(shopOrders);
  const [pendingOrders] = await db.select({ count: count() }).from(shopOrders).where(eq(shopOrders.status, 'pending'));
  const [totalPointsSpent] = await db.select({ total: sql<number>`COALESCE(SUM(${shopOrders.pointsSpent}), 0)` }).from(shopOrders);

  return {
    totalProducts: totalProducts?.count || 0,
    totalOrders: totalOrders?.count || 0,
    pendingOrders: pendingOrders?.count || 0,
    totalPointsSpent: totalPointsSpent?.total || 0,
  };
}
