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
});

export type AppRouter = typeof appRouter;
