import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  signup: router({
    requestCode: publicProcedure
      .input(
        z.object({
          name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
          email: z.string().email("Email inválido"),
        })
      )
      .mutation(async ({ input }) => {
        // Gerar código de 6 dígitos
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        try {
          await db.createSignupRequest(input.name, input.email, code);

          // TODO: Enviar email com o código
          // Por enquanto, vamos apenas retornar o código (em produção, isso seria enviado por email)
          console.log(`Código de verificação para ${input.email}: ${code}`);

          return {
            success: true,
            message: "Código de verificação enviado para seu email",
            // REMOVER EM PRODUÇÃO - apenas para desenvolvimento
            devCode: code,
          };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao criar solicitação de cadastro",
          });
        }
      }),

    verifyCode: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          code: z.string().length(6),
        })
      )
      .mutation(async ({ input }) => {
        const result = await db.verifySignupCode(input.email, input.code);

        if (!result.success) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: result.error || "Código inválido",
          });
        }

        return {
          success: true,
          message: "Email verificado com sucesso! Agora faça login com Manus OAuth.",
          name: result.name,
          email: result.email,
        };
      }),
  }),

  content: router({
    list: publicProcedure.query(async () => {
      return await db.getAllFeaturedContent();
    }),

    create: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1),
          description: z.string().min(1),
          link: z.string().url(),
          category: z.string(),
          order: z.number().default(0),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem criar conteúdo" });
        }
        await db.createFeaturedContent(input);
        return { success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          link: z.string().url().optional(),
          category: z.string().optional(),
          order: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        const { id, ...data } = input;
        await db.updateFeaturedContent(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await db.deleteFeaturedContent(input.id);
        return { success: true };
      }),
  }),

  events: router({
    list: publicProcedure.query(async () => {
      return await db.getAllActiveEvents();
    }),

    create: protectedProcedure
      .input(
        z.object({
          title: z.string().min(1),
          description: z.string().min(1),
          eventDate: z.date(),
          location: z.string().optional(),
          link: z.string().url().optional(),
          imageUrl: z.string().url().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Apenas administradores podem criar eventos" });
        }
        await db.createEvent(input);
        return { success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          eventDate: z.date().optional(),
          location: z.string().optional(),
          link: z.string().url().optional(),
          imageUrl: z.string().url().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        const { id, ...data } = input;
        await db.updateEvent(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        await db.deleteEvent(input.id);
        return { success: true };
      }),
  }),

  // Newsletter routes
  newsletter: router({  
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
      }
      return db.listNewsletters();
    }),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        subject: z.string().min(1),
        content: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        await db.createNewsletter({
          ...input,
          createdBy: ctx.user.id,
        });
        return { success: true };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        subject: z.string().optional(),
        content: z.string().optional(),
        status: z.enum(['draft', 'scheduled', 'sent']).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        const { id, ...data } = input;
        await db.updateNewsletter(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        await db.deleteNewsletter(input.id);
        return { success: true };
      }),

    getSubscribers: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
      }
      return db.getSubscribers();
    }),

    subscribe: protectedProcedure.mutation(async ({ ctx }) => {
      await db.subscribeToNewsletter(ctx.user.id);
      return { success: true };
    }),

    unsubscribe: protectedProcedure.mutation(async ({ ctx }) => {
      await db.unsubscribeFromNewsletter(ctx.user.id);
      return { success: true };
    }),
  }),

  // Notifications routes
  notifications: router({
    list: protectedProcedure
      .input(z.object({ unreadOnly: z.boolean().optional() }).optional())
      .query(async ({ input, ctx }) => {
        return db.getUserNotifications(ctx.user.id, input?.unreadOnly);
      }),

    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      return db.getUnreadNotificationsCount(ctx.user.id);
    }),

    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.markNotificationAsRead(input.id);
        return { success: true };
      }),

    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
      await db.markAllNotificationsAsRead(ctx.user.id);
      return { success: true };
    }),
  }),

  // Gamification routes
  gamification: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserProfile(ctx.user.id);
    }),

    getLeaderboard: publicProcedure.query(async () => {
      return db.getLeaderboard(10);
    }),

    listBadges: publicProcedure.query(async () => {
      return db.listBadges();
    }),
  }),

  // Comments routes
  comments: router({
    getContentComments: publicProcedure
      .input(z.object({ contentId: z.number() }))
      .query(async ({ input }) => {
        return db.getContentComments(input.contentId);
      }),

    getEventComments: publicProcedure
      .input(z.object({ eventId: z.number() }))
      .query(async ({ input }) => {
        return db.getEventComments(input.eventId);
      }),

    createComment: protectedProcedure
      .input(z.object({
        contentId: z.number().optional(),
        eventId: z.number().optional(),
        text: z.string().min(1).max(1000),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!input.contentId && !input.eventId) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Especifique contentId ou eventId' });
        }
        await db.createComment({
          userId: ctx.user.id,
          contentId: input.contentId || null,
          eventId: input.eventId || null,
          text: input.text,
        });
        
        // Adicionar pontos por comentar
        await db.addPoints(ctx.user.id, 10, 'comment', 'Comentou em um conteúdo');
        
        return { success: true };
      }),

    getPending: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
      }
      return db.getPendingComments();
    }),

    approve: protectedProcedure
      .input(z.object({ commentId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        await db.approveComment(input.commentId);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ commentId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        await db.deleteComment(input.commentId);
        return { success: true };
      }),
  }),

  // Analytics routes
  analytics: router({  
    getStats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
      }
      return db.getAnalytics();
    }),

    trackContentView: publicProcedure
      .input(z.object({ contentId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.trackContentView(input.contentId, ctx.user?.id);
        return { success: true };
      }),

    trackEventView: publicProcedure
      .input(z.object({ eventId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.trackEventView(input.eventId, ctx.user?.id);
        return { success: true };
      }),
  }),

  // Admin routes
  admin: router({
    // Conteúdos
    listContent: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
      }
      return db.getAllFeaturedContent();
    }),

    createContent: protectedProcedure
      .input(z.object({
        category: z.string(),
        title: z.string().min(1),
        description: z.string(),
        link: z.string().url(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        await db.createFeaturedContent(input);
        return { success: true };
      }),

    updateContent: protectedProcedure
      .input(z.object({
        id: z.number(),
        category: z.string().optional(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        link: z.string().url().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        const { id, ...updates } = input;
        await db.updateFeaturedContent(id, updates);
        return { success: true };
      }),

    deleteContent: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        await db.deleteFeaturedContent(input.id);
        return { success: true };
      }),

    // Eventos
    listEvents: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
      }
      return db.getAllActiveEvents();
    }),

    createEvent: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string(),
        eventDate: z.date(),
        location: z.string(),
        link: z.string().url().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        await db.createEvent(input);
        return { success: true };
      }),

    updateEvent: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        eventDate: z.date().optional(),
        location: z.string().optional(),
        link: z.string().url().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        const { id, ...updates } = input;
        await db.updateEvent(id, updates);
        return { success: true };
      }),

    deleteEvent: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso negado' });
        }
        await db.deleteEvent(input.id);
        return { success: true };
      }),
  }),

  // Search routes
  search: router({
    global: publicProcedure
      .input(z.object({ 
        query: z.string(),
        filter: z.enum(['all', 'content', 'events', 'members']).optional()
      }))
      .query(async ({ input }) => {
        const { query, filter = 'all' } = input;
        const results: any = { contents: [], events: [], members: [] };

        if (filter === 'all' || filter === 'content') {
          results.contents = await db.searchContents(query);
        }
        if (filter === 'all' || filter === 'events') {
          results.events = await db.searchEvents(query);
        }
        if (filter === 'all' || filter === 'members') {
          results.members = await db.searchMembers(query);
        }

        return results;
      }),
  }),
});

export type AppRouter = typeof appRouter;
