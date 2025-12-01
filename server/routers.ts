import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createSignupRequest, verifySignupCode } from "./db";
import { TRPCError } from "@trpc/server";

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
          await createSignupRequest(input.name, input.email, code);

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
        const result = await verifySignupCode(input.email, input.code);

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

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
