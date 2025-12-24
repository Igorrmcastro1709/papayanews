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
      return db.getUserGamificationProfile(ctx.user.id);
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

  // Forum routes
  forum: router({
    listThreads: protectedProcedure.query(async () => {
      const threads = await db.getForumThreads();
      // Adicionar contagem de respostas
      const threadsWithReplies = await Promise.all(
        threads.map(async (thread: any) => {
          const replies = await db.getForumReplies(thread.id);
          return {
            ...thread,
            authorName: thread.userName,
            replyCount: replies.length,
          };
        })
      );
      return threadsWithReplies;
    }),

    getThread: protectedProcedure
      .input(z.object({ threadId: z.number() }))
      .query(async ({ input }) => {
        const thread = await db.getForumThread(input.threadId);
        if (!thread) return null;
        const replies = await db.getForumReplies(input.threadId);
        return {
          ...thread,
          authorName: thread.userName,
          replies: replies.map((r: any) => ({ ...r, authorName: r.userName })),
        };
      }),

    createThread: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        content: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createForumThread({
          userId: ctx.user.id,
          title: input.title,
          content: input.content,
          category: 'geral',
        });
        return { success: true };
      }),

    createReply: protectedProcedure
      .input(z.object({
        threadId: z.number(),
        content: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createForumReply({
          threadId: input.threadId,
          userId: ctx.user.id,
          content: input.content,
        });
        // Adicionar pontos por responder
        await db.addPoints(ctx.user.id, 10, 'forum_reply', 'Respondeu no fórum');
        return { success: true };
      }),

    upvoteThread: protectedProcedure
      .input(z.object({ threadId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.toggleUpvote({ userId: ctx.user.id, threadId: input.threadId });
        return { success: true };
      }),
  }),

  // Streak and engagement routes
  engagement: router({
    getStreak: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserStreak(ctx.user.id);
    }),

    updateStreak: protectedProcedure.mutation(async ({ ctx }) => {
      return db.updateUserStreak(ctx.user.id);
    }),

    getChallenges: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserChallengeProgress(ctx.user.id);
    }),

    getTopMembers: publicProcedure.query(async () => {
      return db.getTopMembers(10);
    }),

    getBadgeProgress: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserBadgeProgress(ctx.user.id);
    }),
  }),

  // Chat da Comunidade com LLM
  chat: router({
    getMessages: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }).optional())
      .query(async ({ input }) => {
        return db.getChatMessages(input?.limit || 50);
      }),

    sendMessage: protectedProcedure
      .input(z.object({
        message: z.string().min(1, "Mensagem não pode estar vazia"),
        replyToId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Salvar mensagem do usuário
        await db.createChatMessage({
          userId: ctx.user.id,
          message: input.message,
          isAiResponse: 0,
          replyToId: input.replyToId || null,
        });

        // Verificar se é uma pergunta para o assistente (começa com @papaya ou menciona o bot)
        const isAiQuestion = input.message.toLowerCase().includes('@papaya') || 
                            input.message.toLowerCase().includes('@assistente') ||
                            input.message.toLowerCase().startsWith('/');

        if (isAiQuestion) {
          try {
            // Buscar contexto da comunidade
            const context = await db.getCommunityContext();
            const { invokeLLM } = await import('./_core/llm');

            // Criar prompt com contexto temporal
            const now = new Date();
            const brazilTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
            const currentDate = brazilTime.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            const currentTime = brazilTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            
            // Calcular dias até os eventos
            const eventsWithDays = context?.upcomingEvents?.map(e => {
              const eventDate = new Date(e.eventDate);
              const diffTime = eventDate.getTime() - brazilTime.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              let timeInfo = '';
              if (diffDays === 0) timeInfo = '(HOJE!)';
              else if (diffDays === 1) timeInfo = '(amanhã)';
              else if (diffDays < 0) timeInfo = '(já passou)';
              else if (diffDays <= 7) timeInfo = `(em ${diffDays} dias)`;
              else if (diffDays <= 30) timeInfo = `(em ${Math.ceil(diffDays / 7)} semanas)`;
              else timeInfo = `(em ${Math.ceil(diffDays / 30)} meses)`;
              return `- ${e.title}: ${e.description} - ${new Date(e.eventDate).toLocaleDateString('pt-BR')} ${timeInfo}`;
            }) || [];

            const systemPrompt = `Você é o Papaya, o assistente virtual da comunidade PapayaNews. Você ajuda os membros a descobrir novidades sobre IA, startups e inovação.

📅 DATA E HORA ATUAL:
Hoje é ${currentDate}, são ${currentTime} (horário de Brasília).

Contexto atual da comunidade:

CONTEÚDOS RECENTES:
${context?.recentContent?.map(c => `- ${c.title}: ${c.description} (${c.category})`).join('\n') || 'Nenhum conteúdo disponível'}

PRÓXIMOS EVENTOS:
${eventsWithDays.join('\n') || 'Nenhum evento agendado'}

NEWSLETTERS RECENTES:
${context?.recentNewsletters?.map(n => `- ${n.title}: ${n.subject}`).join('\n') || 'Nenhuma newsletter enviada'}

IMPORTANTE: Use a data e hora atual para contextualizar suas respostas. Por exemplo:
- Se perguntarem sobre eventos, diga quantos dias faltam
- Se for de manhã, cumprimente com "Bom dia"
- Se for à tarde, cumprimente com "Boa tarde"
- Se for à noite, cumprimente com "Boa noite"

Responda de forma amigável, útil e concisa em português brasileiro. Use emojis ocasionalmente para tornar a conversa mais leve. Se não souber algo, sugira que o usuário explore os conteúdos disponíveis ou entre em contato com a equipe.`;

            const userMessage = input.message.replace(/@papaya/gi, '').replace(/@assistente/gi, '').replace(/^\//g, '').trim();

            const response = await invokeLLM({
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
              ],
            });

            const aiResponse = response.choices[0]?.message?.content || 'Desculpe, não consegui processar sua pergunta. Tente novamente!';

            // Salvar resposta da IA
            await db.createChatMessage({
              userId: ctx.user.id, // Usar o mesmo userId para manter a referência
              message: typeof aiResponse === 'string' ? aiResponse : JSON.stringify(aiResponse),
              isAiResponse: 1,
              replyToId: null,
            });

            return { success: true, aiResponse: true };
          } catch (error) {
            console.error('Erro ao processar pergunta com IA:', error);
            // Salvar mensagem de erro
            await db.createChatMessage({
              userId: ctx.user.id,
              message: '🤔 Desculpe, estou com dificuldades técnicas no momento. Tente novamente em alguns instantes!',
              isAiResponse: 1,
              replyToId: null,
            });
            return { success: true, aiResponse: true };
          }
        }

        return { success: true, aiResponse: false };
      }),

    getCommunityContext: protectedProcedure.query(async () => {
      return db.getCommunityContext();
    }),

    // Upload de arquivo para o chat
    uploadAttachment: protectedProcedure
      .input(z.object({
        messageId: z.number(),
        fileName: z.string(),
        fileData: z.string(), // Base64 encoded
        fileType: z.string(),
        fileSize: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { storagePut } = await import('./storage');
        
        // Gerar chave única para o arquivo
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const sanitizedFileName = input.fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileKey = `chat/${ctx.user.id}/${timestamp}-${randomSuffix}-${sanitizedFileName}`;
        
        // Converter base64 para buffer
        const fileBuffer = Buffer.from(input.fileData, 'base64');
        
        // Upload para S3
        const { url } = await storagePut(fileKey, fileBuffer, input.fileType);
        
        // Salvar referência no banco
        await db.createChatAttachment({
          messageId: input.messageId,
          fileName: input.fileName,
          fileUrl: url,
          fileKey: fileKey,
          fileType: input.fileType,
          fileSize: input.fileSize,
        });
        
        return { success: true, url, fileKey };
      }),

    // Enviar mensagem com anexos
    sendMessageWithAttachments: protectedProcedure
      .input(z.object({
        message: z.string(),
        replyToId: z.number().optional(),
        attachments: z.array(z.object({
          fileName: z.string(),
          fileData: z.string(), // Base64 encoded
          fileType: z.string(),
          fileSize: z.number(),
        })).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { storagePut } = await import('./storage');
        
        // Criar mensagem primeiro
        const messageResult = await db.createChatMessage({
          userId: ctx.user.id,
          message: input.message || '[📎 Arquivo anexado]',
          isAiResponse: 0,
          replyToId: input.replyToId || null,
        });
        
        // Buscar o ID da mensagem recém criada
        const messages = await db.getChatMessages(1);
        const newMessage = messages[messages.length - 1];
        
        if (!newMessage) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao criar mensagem' });
        }
        
        // Upload de anexos se houver
        const uploadedAttachments = [];
        const documentsToAnalyze: { url: string; fileName: string; fileType: string; mimeType: string }[] = [];
        
        if (input.attachments && input.attachments.length > 0) {
          for (const attachment of input.attachments) {
            const timestamp = Date.now();
            const randomSuffix = Math.random().toString(36).substring(2, 8);
            const sanitizedFileName = attachment.fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
            const fileKey = `chat/${ctx.user.id}/${timestamp}-${randomSuffix}-${sanitizedFileName}`;
            
            const fileBuffer = Buffer.from(attachment.fileData, 'base64');
            const { url } = await storagePut(fileKey, fileBuffer, attachment.fileType);
            
            await db.createChatAttachment({
              messageId: newMessage.id,
              fileName: attachment.fileName,
              fileUrl: url,
              fileKey: fileKey,
              fileType: attachment.fileType,
              fileSize: attachment.fileSize,
            });
            
            uploadedAttachments.push({ fileName: attachment.fileName, url, fileType: attachment.fileType });
            
            // Verificar se é um documento que pode ser analisado pela IA
            const isPdf = attachment.fileType.includes('pdf');
            const isImage = attachment.fileType.includes('image');
            if (isPdf || isImage) {
              documentsToAnalyze.push({
                url,
                fileName: attachment.fileName,
                fileType: isPdf ? 'pdf' : 'image',
                mimeType: attachment.fileType,
              });
            }
          }
        }
        
        // Analisar documentos automaticamente e postar resumo no chat
        if (documentsToAnalyze.length > 0) {
          try {
            const { invokeLLM } = await import('./_core/llm');
            
            for (const doc of documentsToAnalyze) {
              let content: any[] = [];
              
              if (doc.fileType === 'pdf') {
                content = [
                  { type: 'text', text: `Analise este documento PDF "${doc.fileName}" e forneça um resumo conciso com os principais pontos, contexto e conclusões.` },
                  { type: 'file_url', file_url: { url: doc.url, mime_type: 'application/pdf' } }
                ];
              } else if (doc.fileType === 'image') {
                content = [
                  { type: 'text', text: `Analise esta imagem "${doc.fileName}" e descreva seu conteúdo, contexto e principais informações.` },
                  { type: 'image_url', image_url: { url: doc.url, detail: 'high' } }
                ];
              }
              
              const systemPrompt = `Você é o Papaya, assistente da comunidade PapayaNews. Analise o documento e crie um resumo útil para a comunidade.

Formato da resposta:
📝 **Resumo**: [2-3 frases sobre o conteúdo principal]
📌 **Contexto**: [1-2 frases sobre o propósito/origem]
🎯 **Destaques**: [3-5 pontos principais em lista]

Seja conciso e foque em informações relevantes para profissionais de IA, startups e inovação.`;
              
              const response = await invokeLLM({
                messages: [
                  { role: 'system', content: systemPrompt },
                  { role: 'user', content: content }
                ],
              });
              
              const aiSummary = response.choices[0]?.message?.content;
              if (aiSummary && typeof aiSummary === 'string') {
                // Postar resumo como resposta da IA no chat
                await db.createChatMessage({
                  userId: ctx.user.id,
                  message: `🤖 **Análise automática de "${doc.fileName}"**\n\n${aiSummary}`,
                  isAiResponse: 1,
                  replyToId: null,
                });
              }
            }
          } catch (analysisError) {
            console.error('Erro ao analisar documentos:', analysisError);
            // Continua sem análise - não bloqueia o envio
          }
        }
        
        // Verificar se é uma pergunta para o assistente
        const isAiQuestion = input.message.toLowerCase().includes('@papaya') || 
                            input.message.toLowerCase().includes('@assistente') ||
                            input.message.toLowerCase().startsWith('/');

        if (isAiQuestion) {
          try {
            const context = await db.getCommunityContext();
            const { invokeLLM } = await import('./_core/llm');

            const now = new Date();
            const brazilTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
            const currentDate = brazilTime.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            const currentTime = brazilTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            
            const eventsWithDays = context?.upcomingEvents?.map(e => {
              const eventDate = new Date(e.eventDate);
              const diffTime = eventDate.getTime() - brazilTime.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              let timeInfo = '';
              if (diffDays === 0) timeInfo = '(HOJE!)';
              else if (diffDays === 1) timeInfo = '(amanhã)';
              else if (diffDays < 0) timeInfo = '(já passou)';
              else if (diffDays <= 7) timeInfo = `(em ${diffDays} dias)`;
              else if (diffDays <= 30) timeInfo = `(em ${Math.ceil(diffDays / 7)} semanas)`;
              else timeInfo = `(em ${Math.ceil(diffDays / 30)} meses)`;
              return `- ${e.title}: ${e.description} - ${new Date(e.eventDate).toLocaleDateString('pt-BR')} ${timeInfo}`;
            }) || [];

            const systemPrompt = `Você é o Papaya, o assistente virtual da comunidade PapayaNews.

📅 DATA E HORA ATUAL: ${currentDate}, ${currentTime} (horário de Brasília).

CONTEÚDOS RECENTES:
${context?.recentContent?.map(c => `- ${c.title}: ${c.description}`).join('\n') || 'Nenhum'}

PRÓXIMOS EVENTOS:
${eventsWithDays.join('\n') || 'Nenhum'}

Responda de forma amigável e concisa em português brasileiro. Use emojis ocasionalmente.`;

            const userMessage = input.message.replace(/@papaya/gi, '').replace(/@assistente/gi, '').replace(/^\//g, '').trim();

            const response = await invokeLLM({
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
              ],
            });

            const aiResponse = response.choices[0]?.message?.content || 'Desculpe, não consegui processar sua pergunta.';

            await db.createChatMessage({
              userId: ctx.user.id,
              message: typeof aiResponse === 'string' ? aiResponse : JSON.stringify(aiResponse),
              isAiResponse: 1,
              replyToId: null,
            });

            return { success: true, aiResponse: true, attachments: uploadedAttachments };
          } catch (error) {
            console.error('Erro ao processar pergunta com IA:', error);
            return { success: true, aiResponse: false, attachments: uploadedAttachments };
          }
        }
        
        return { success: true, aiResponse: false, attachments: uploadedAttachments };
      }),

    // Buscar mensagens com anexos
    getMessagesWithAttachments: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }).optional())
      .query(async ({ input }) => {
        return db.getMessagesWithAttachments(input?.limit || 50);
      }),

    // Gerar resumo diário
    generateDailySummary: protectedProcedure
      .mutation(async ({ ctx }) => {
        // Apenas admins podem gerar resumo manualmente
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Apenas administradores podem gerar resumos' });
        }
        
        const { invokeLLM } = await import('./_core/llm');
        
        // Buscar mensagens do dia
        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        
        const messages = await db.getMessagesForDateRange(startOfDay, now);
        const context = await db.getCommunityContext();
        
        if (messages.length === 0) {
          return { success: false, message: 'Nenhuma mensagem hoje para resumir' };
        }
        
        const systemPrompt = `Você é um assistente que cria resumos diários para a comunidade PapayaNews.
Crie um resumo conciso e informativo das atividades do dia, incluindo:
- Principais tópicos discutidos
- Notícias ou conteúdos compartilhados
- Eventos mencionados
- Destaques da comunidade

Formato: Use emojis, seja breve e objetivo. Máximo 300 palavras.`;
        
        const messagesText = messages
          .filter(m => m.isAiResponse === 0)
          .map(m => m.message)
          .join('\n');
        
        const response = await invokeLLM({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Mensagens do dia:\n${messagesText}\n\nConteúdos recentes: ${context?.recentContent?.map(c => c.title).join(', ')}` },
          ],
        });
        
        const summaryContent = response.choices[0]?.message?.content || 'Não foi possível gerar o resumo.';
        
        // Salvar resumo
        await db.createDailySummary({
          summaryDate: now,
          content: typeof summaryContent === 'string' ? summaryContent : JSON.stringify(summaryContent),
          newsCount: context?.recentContent?.length || 0,
          messagesCount: messages.length,
        });
        
        // Postar resumo no chat
        await db.createChatMessage({
          userId: ctx.user.id,
          message: `📰 **Resumo do Dia - ${now.toLocaleDateString('pt-BR')}**\n\n${summaryContent}`,
          isAiResponse: 1,
          replyToId: null,
        });
        
        return { success: true, summary: summaryContent };
      }),

    // Buscar resumos recentes
    getRecentSummaries: protectedProcedure
      .input(z.object({ limit: z.number().default(7) }).optional())
      .query(async ({ input }) => {
        return db.getRecentDailySummaries(input?.limit || 7);
      }),
  }),

  // User Profiles & Connections
  profile: router({
    // Obter perfil do usuário atual
    getMyProfile: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserProfileWithUser(ctx.user.id);
    }),

    // Obter perfil de outro usuário
    getUserProfile: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return db.getUserProfileWithUser(input.userId);
      }),

    // Atualizar perfil
    updateProfile: protectedProcedure
      .input(z.object({
        bio: z.string().max(500).optional(),
        headline: z.string().max(255).optional(),
        company: z.string().max(255).optional(),
        position: z.string().max(255).optional(),
        location: z.string().max(255).optional(),
        linkedinUrl: z.string().url().optional().or(z.literal('')),
        githubUrl: z.string().url().optional().or(z.literal('')),
        websiteUrl: z.string().url().optional().or(z.literal('')),
        interests: z.array(z.string()).optional(),
        isPublic: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const data = {
          ...input,
          interests: input.interests ? JSON.stringify(input.interests) : undefined,
          isPublic: input.isPublic !== undefined ? (input.isPublic ? 1 : 0) : undefined,
          linkedinUrl: input.linkedinUrl || null,
          githubUrl: input.githubUrl || null,
          websiteUrl: input.websiteUrl || null,
        };
        return db.createOrUpdateProfile(ctx.user.id, data);
      }),

    // Upload de avatar
    uploadAvatar: protectedProcedure
      .input(z.object({
        imageData: z.string(), // Base64 encoded
        mimeType: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { storagePut } = await import('./storage');
        
        const timestamp = Date.now();
        const extension = input.mimeType.split('/')[1] || 'png';
        const avatarKey = `avatars/${ctx.user.id}/${timestamp}.${extension}`;
        
        const imageBuffer = Buffer.from(input.imageData, 'base64');
        const { url } = await storagePut(avatarKey, imageBuffer, input.mimeType);
        
        await db.createOrUpdateProfile(ctx.user.id, {
          avatarUrl: url,
          avatarKey: avatarKey,
        });
        
        return { success: true, avatarUrl: url };
      }),

    // Listar membros (diretório)
    listMembers: publicProcedure
      .input(z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
        search: z.string().optional(),
        interests: z.array(z.string()).optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getAllPublicProfiles(input || {});
      }),
  }),

  // Conexões entre usuários
  connections: router({
    // Enviar solicitação de conexão
    sendRequest: protectedProcedure
      .input(z.object({
        receiverId: z.number(),
        message: z.string().max(500).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (input.receiverId === ctx.user.id) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Você não pode se conectar consigo mesmo' });
        }
        return db.sendConnectionRequest(ctx.user.id, input.receiverId, input.message);
      }),

    // Responder solicitação
    respondToRequest: protectedProcedure
      .input(z.object({
        connectionId: z.number(),
        accept: z.boolean(),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.respondToConnectionRequest(input.connectionId, ctx.user.id, input.accept);
      }),

    // Listar conexões
    getMyConnections: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserConnections(ctx.user.id);
    }),

    // Solicitações pendentes
    getPendingRequests: protectedProcedure.query(async ({ ctx }) => {
      return db.getPendingConnectionRequests(ctx.user.id);
    }),

    // Status da conexão com outro usuário
    getConnectionStatus: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input, ctx }) => {
        return db.getConnectionStatus(ctx.user.id, input.userId);
      }),

    // Remover conexão
    removeConnection: protectedProcedure
      .input(z.object({ connectionId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return db.removeConnection(input.connectionId, ctx.user.id);
      }),
  }),

  // Biblioteca de Documentos com Análise LLM
  documents: router({
    // Listar documentos
    list: protectedProcedure
      .input(z.object({
        category: z.string().optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      }).optional())
      .query(async ({ input }) => {
        return db.getDocuments({
          category: input?.category,
          isPublic: true,
          limit: input?.limit || 20,
          offset: input?.offset || 0,
        });
      }),

    // Meus documentos
    myDocuments: protectedProcedure
      .input(z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
      }).optional())
      .query(async ({ input, ctx }) => {
        return db.getDocuments({
          userId: ctx.user.id,
          limit: input?.limit || 20,
          offset: input?.offset || 0,
        });
      }),

    // Obter documento por ID
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getDocumentById(input.id);
      }),

    // Buscar documentos
    search: protectedProcedure
      .input(z.object({ query: z.string().min(2) }))
      .query(async ({ input }) => {
        return db.searchDocuments(input.query);
      }),

    // Upload de documento com análise LLM
    upload: protectedProcedure
      .input(z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        fileName: z.string(),
        fileData: z.string(), // Base64 encoded
        fileType: z.string(),
        fileSize: z.number().max(15 * 1024 * 1024, "Arquivo deve ter no máximo 15MB"),
        mimeType: z.string(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        isPublic: z.boolean().default(true),
        analyzeWithAI: z.boolean().default(true),
      }))
      .mutation(async ({ input, ctx }) => {
        const { storagePut } = await import('./storage');
        
        // Gerar chave única para o arquivo
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const sanitizedFileName = input.fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileKey = `documents/${ctx.user.id}/${timestamp}-${randomSuffix}-${sanitizedFileName}`;
        
        // Converter base64 para buffer
        const fileBuffer = Buffer.from(input.fileData, 'base64');
        
        // Upload para S3
        const { url } = await storagePut(fileKey, fileBuffer, input.mimeType);
        
        // Determinar tipo de arquivo
        let fileType = 'other';
        if (input.mimeType.includes('pdf')) fileType = 'pdf';
        else if (input.mimeType.includes('word') || input.mimeType.includes('document')) fileType = 'document';
        else if (input.mimeType.includes('image')) fileType = 'image';
        else if (input.mimeType.includes('spreadsheet') || input.mimeType.includes('excel')) fileType = 'spreadsheet';
        else if (input.mimeType.includes('presentation') || input.mimeType.includes('powerpoint')) fileType = 'presentation';
        else if (input.mimeType.includes('text')) fileType = 'text';
        
        // Criar registro no banco
        await db.createDocument({
          userId: ctx.user.id,
          title: input.title,
          description: input.description || null,
          fileName: input.fileName,
          fileUrl: url,
          fileKey: fileKey,
          fileType: fileType,
          fileSize: input.fileSize,
          mimeType: input.mimeType,
          category: input.category || null,
          tags: input.tags ? JSON.stringify(input.tags) : null,
          isPublic: input.isPublic ? 1 : 0,
        });
        
        // Buscar o documento recém criado
        const docs = await db.getDocuments({ userId: ctx.user.id, limit: 1 });
        const newDoc = docs[0];
        
        // Analisar com LLM se solicitado e se for um tipo suportado
        if (input.analyzeWithAI && newDoc && ['pdf', 'image'].includes(fileType)) {
          try {
            const { invokeLLM } = await import('./_core/llm');
            
            // Preparar conteúdo para análise
            let content: any[] = [];
            
            if (fileType === 'pdf') {
              content = [
                { type: 'text', text: `Analise este documento PDF chamado "${input.title}" e forneça um resumo estruturado.` },
                { type: 'file_url', file_url: { url: url, mime_type: 'application/pdf' } }
              ];
            } else if (fileType === 'image') {
              content = [
                { type: 'text', text: `Analise esta imagem chamada "${input.title}" e descreva seu conteúdo.` },
                { type: 'image_url', image_url: { url: url, detail: 'high' } }
              ];
            }
            
            const systemPrompt = `Você é um assistente especializado em análise de documentos para a comunidade PapayaNews.
Sua tarefa é analisar o documento fornecido e criar um resumo estruturado.

Resposta DEVE ser em JSON válido com esta estrutura:
{
  "summary": "Resumo conciso do documento em 2-3 parágrafos",
  "context": "Contexto e propósito do documento",
  "outcomes": "Principais conclusões, insights ou ações recomendadas"
}

Seja objetivo e foque nos pontos mais relevantes para profissionais de IA, startups e inovação.`;
            
            const response = await invokeLLM({
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: content }
              ],
              response_format: {
                type: 'json_schema',
                json_schema: {
                  name: 'document_analysis',
                  strict: true,
                  schema: {
                    type: 'object',
                    properties: {
                      summary: { type: 'string', description: 'Resumo do documento' },
                      context: { type: 'string', description: 'Contexto e propósito' },
                      outcomes: { type: 'string', description: 'Conclusões e insights' }
                    },
                    required: ['summary', 'context', 'outcomes'],
                    additionalProperties: false
                  }
                }
              }
            });
            
            const analysisText = response.choices[0]?.message?.content;
            if (analysisText && typeof analysisText === 'string') {
              try {
                const analysis = JSON.parse(analysisText);
                await db.updateDocumentAISummary(newDoc.id, {
                  aiSummary: analysis.summary,
                  aiContext: analysis.context,
                  aiOutcomes: analysis.outcomes,
                });
              } catch (parseError) {
                console.error('Erro ao parsear análise:', parseError);
              }
            }
          } catch (aiError) {
            console.error('Erro na análise com IA:', aiError);
            // Continua sem análise - não bloqueia o upload
          }
        }
        
        return { success: true, documentId: newDoc?.id, url, fileKey };
      }),

    // Analisar documento existente com LLM
    analyzeDocument: protectedProcedure
      .input(z.object({ documentId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const doc = await db.getDocumentById(input.documentId);
        
        if (!doc) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Documento não encontrado' });
        }
        
        // Verificar se o usuário tem permissão (dono ou admin)
        if (doc.userId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Sem permissão para analisar este documento' });
        }
        
        // Verificar tipo suportado
        if (!['pdf', 'image'].includes(doc.fileType)) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Tipo de arquivo não suportado para análise' });
        }
        
        try {
          const { invokeLLM } = await import('./_core/llm');
          
          let content: any[] = [];
          
          if (doc.fileType === 'pdf') {
            content = [
              { type: 'text', text: `Analise este documento PDF chamado "${doc.title}" e forneça um resumo estruturado.` },
              { type: 'file_url', file_url: { url: doc.fileUrl, mime_type: 'application/pdf' } }
            ];
          } else if (doc.fileType === 'image') {
            content = [
              { type: 'text', text: `Analise esta imagem chamada "${doc.title}" e descreva seu conteúdo.` },
              { type: 'image_url', image_url: { url: doc.fileUrl, detail: 'high' } }
            ];
          }
          
          const systemPrompt = `Você é um assistente especializado em análise de documentos para a comunidade PapayaNews.
Sua tarefa é analisar o documento fornecido e criar um resumo estruturado.

Resposta DEVE ser em JSON válido com esta estrutura:
{
  "summary": "Resumo conciso do documento em 2-3 parágrafos",
  "context": "Contexto e propósito do documento",
  "outcomes": "Principais conclusões, insights ou ações recomendadas"
}

Seja objetivo e foque nos pontos mais relevantes para profissionais de IA, startups e inovação.`;
          
          const response = await invokeLLM({
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: content }
            ],
            response_format: {
              type: 'json_schema',
              json_schema: {
                name: 'document_analysis',
                strict: true,
                schema: {
                  type: 'object',
                  properties: {
                    summary: { type: 'string', description: 'Resumo do documento' },
                    context: { type: 'string', description: 'Contexto e propósito' },
                    outcomes: { type: 'string', description: 'Conclusões e insights' }
                  },
                  required: ['summary', 'context', 'outcomes'],
                  additionalProperties: false
                }
              }
            }
          });
          
          const analysisText = response.choices[0]?.message?.content;
          if (analysisText && typeof analysisText === 'string') {
            const analysis = JSON.parse(analysisText);
            await db.updateDocumentAISummary(input.documentId, {
              aiSummary: analysis.summary,
              aiContext: analysis.context,
              aiOutcomes: analysis.outcomes,
            });
            
            return { success: true, analysis };
          }
          
          throw new Error('Resposta inválida da IA');
        } catch (error) {
          console.error('Erro na análise:', error);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao analisar documento' });
        }
      }),

    // Registrar download
    registerDownload: protectedProcedure
      .input(z.object({ documentId: z.number() }))
      .mutation(async ({ input }) => {
        await db.incrementDocumentDownload(input.documentId);
        return { success: true };
      }),

    // Deletar documento
    delete: protectedProcedure
      .input(z.object({ documentId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return db.deleteDocument(input.documentId, ctx.user.id);
      }),

    // Estatísticas da biblioteca
    getStats: protectedProcedure.query(async () => {
      return db.getDocumentStats();
    }),
  }),

  // ==================== PAPAYA SHOP ====================
  shop: router({
    // Listar produtos
    getProducts: publicProcedure
      .input(z.object({ category: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return db.getShopProducts(input?.category);
      }),

    // Obter produto por ID
    getProduct: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getShopProduct(input.id);
      }),

    // Resgatar produto com pontos
    redeemWithPoints: protectedProcedure
      .input(z.object({
        productId: z.number(),
        quantity: z.number().default(1),
        // Dados de entrega (para produtos físicos)
        shippingName: z.string().optional(),
        shippingAddress: z.string().optional(),
        shippingCity: z.string().optional(),
        shippingState: z.string().optional(),
        shippingZip: z.string().optional(),
        shippingCountry: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.user!.id;
        
        // Verificar produto
        const product = await db.getShopProduct(input.productId);
        if (!product) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Produto não encontrado' });
        }
        if (!product.isActive) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Produto não disponível' });
        }
        if (product.pointsPrice <= 0) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Este produto não aceita pontos' });
        }

        // Verificar nível do usuário
        const userGamification = await db.getUserGamificationProfile(userId);
        const userLevel = userGamification?.points?.level || 1;
        if (userLevel < product.minLevel) {
          throw new TRPCError({ code: 'FORBIDDEN', message: `Você precisa ser nível ${product.minLevel} para resgatar este produto` });
        }

        // Verificar pontos suficientes
        const totalCost = product.pointsPrice * input.quantity;
        if ((userGamification?.points?.totalPoints || 0) < totalCost) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Pontos insuficientes' });
        }

        // Verificar estoque
        if (product.stock !== -1 && product.stock < input.quantity) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Estoque insuficiente' });
        }

        // Criar pedido
        const result = await db.createShopOrder({
          userId,
          productId: input.productId,
          quantity: input.quantity,
          paymentMethod: 'points',
          pointsSpent: totalCost,
          cashSpent: 0,
          shippingName: input.shippingName,
          shippingAddress: input.shippingAddress,
          shippingCity: input.shippingCity,
          shippingState: input.shippingState,
          shippingZip: input.shippingZip,
          shippingCountry: input.shippingCountry,
          notes: input.notes,
        });

        if (!result || !result.success) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: result?.error || 'Erro ao criar pedido' });
        }

        // Debitar pontos
        await db.addPoints(userId, -totalCost, 'shop_redeem', `Resgate: ${product.name}`);

        return { success: true, orderId: result.orderId };
      }),

    // Listar pedidos do usuário
    getMyOrders: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserOrders(ctx.user!.id);
    }),

    // ===== ADMIN =====
    
    // Criar produto (admin)
    createProduct: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        imageKey: z.string().optional(),
        category: z.enum(['physical', 'digital', 'experience', 'badge']),
        pointsPrice: z.number().default(0),
        cashPrice: z.number().default(0),
        stock: z.number().default(-1),
        minLevel: z.number().default(1),
        isLimited: z.boolean().default(false),
        isActive: z.boolean().default(true),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Apenas admins podem criar produtos' });
        }

        await db.createShopProduct({
          ...input,
          isLimited: input.isLimited ? 1 : 0,
          isActive: input.isActive ? 1 : 0,
        });

        return { success: true };
      }),

    // Atualizar produto (admin)
    updateProduct: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        imageKey: z.string().optional(),
        category: z.enum(['physical', 'digital', 'experience', 'badge']).optional(),
        pointsPrice: z.number().optional(),
        cashPrice: z.number().optional(),
        stock: z.number().optional(),
        minLevel: z.number().optional(),
        isLimited: z.boolean().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Apenas admins podem atualizar produtos' });
        }

        const { id, isLimited, isActive, ...data } = input;
        const updateData: any = { ...data };
        if (isLimited !== undefined) updateData.isLimited = isLimited ? 1 : 0;
        if (isActive !== undefined) updateData.isActive = isActive ? 1 : 0;

        await db.updateShopProduct(id, updateData);
        return { success: true };
      }),

    // Deletar produto (admin)
    deleteProduct: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Apenas admins podem deletar produtos' });
        }

        await db.deleteShopProduct(input.id);
        return { success: true };
      }),

    // Listar todos os pedidos (admin)
    getAllOrders: protectedProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Apenas admins podem ver todos os pedidos' });
        }

        return db.getAllOrders(input?.status);
      }),

    // Atualizar status do pedido (admin)
    updateOrderStatus: protectedProcedure
      .input(z.object({
        orderId: z.number(),
        status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
        trackingCode: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Apenas admins podem atualizar pedidos' });
        }

        await db.updateOrderStatus(input.orderId, input.status, input.trackingCode);
        return { success: true };
      }),

    // Estatísticas da loja (admin)
    getStats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Apenas admins podem ver estatísticas' });
      }

      return db.getShopStats();
    }),
  }),

  // ==================== PROGRAMA DE REFERRAL ====================
  referral: router({
    // Obter ou gerar código de referral do usuário
    getMyCode: protectedProcedure.query(async ({ ctx }) => {
      let code = await db.getUserReferralCode(ctx.user.id);
      
      // Se não tem código, gerar um novo
      if (!code) {
        code = await db.generateReferralCode(ctx.user.id, ctx.user.name);
      }
      
      return code;
    }),

    // Obter estatísticas de referral do usuário
    getMyStats: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserReferralStats(ctx.user.id);
    }),

    // Obter histórico de indicações
    getMyHistory: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserReferralHistory(ctx.user.id);
    }),

    // Validar código de referral (público - para quem está se cadastrando)
    validateCode: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        const referral = await db.validateReferralCode(input.code);
        
        if (!referral) {
          return { valid: false, referrerName: null };
        }
        
        return {
          valid: true,
          referrerName: referral.userName,
        };
      }),

    // Registrar indicação (chamado após cadastro bem-sucedido)
    registerReferral: protectedProcedure
      .input(z.object({ code: z.string() }))
      .mutation(async ({ ctx, input }) => {
        // Verificar se usuário já foi indicado
        const wasReferred = await db.wasUserReferred(ctx.user.id);
        if (wasReferred) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Você já foi indicado por alguém' });
        }

        // Validar código
        const referral = await db.validateReferralCode(input.code);
        if (!referral) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Código de indicação inválido' });
        }

        // Não pode se auto-indicar
        if (referral.userId === ctx.user.id) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Você não pode usar seu próprio código' });
        }

        // Registrar indicação
        const result = await db.registerReferral(referral.userId, ctx.user.id, referral.id);
        
        return {
          success: true,
          referrerPoints: result?.referrerPoints || 500,
          referredPoints: result?.referredPoints || 200,
        };
      }),

    // Obter ranking de indicadores
    getLeaderboard: publicProcedure
      .input(z.object({ limit: z.number().optional().default(10) }))
      .query(async ({ input }) => {
        return db.getReferralLeaderboard(input.limit);
      }),
  }),
});

export type AppRouter = typeof appRouter;