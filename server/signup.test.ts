import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { createSignupRequest, verifySignupCode } from "./db";

function createPublicContext(): TrpcContext {
  return {
    user: undefined,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Signup System", () => {
  const testEmail = `test-${Date.now()}@papayanews.com`;
  const testName = "Test User";
  let generatedCode = "";

  it("should request verification code with valid name and email", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.signup.requestCode({
      name: testName,
      email: testEmail,
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("Código de verificação");
    expect(result.devCode).toBeDefined();
    expect(result.devCode).toHaveLength(6);
    
    generatedCode = result.devCode || "";
  });

  it("should reject invalid email format", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.signup.requestCode({
        name: testName,
        email: "invalid-email",
      })
    ).rejects.toThrow();
  });

  it("should reject name with less than 2 characters", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.signup.requestCode({
        name: "A",
        email: testEmail,
      })
    ).rejects.toThrow();
  });

  it("should verify code successfully with correct code", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const uniqueEmail = `verify-${Date.now()}@papayanews.com`;

    // Primeiro solicitar código
    const requestResult = await caller.signup.requestCode({
      name: testName,
      email: uniqueEmail,
    });

    // Depois verificar com o código correto usando o MESMO email
    const verifyResult = await caller.signup.verifyCode({
      email: uniqueEmail,
      code: requestResult.devCode || "",
    });

    expect(verifyResult.success).toBe(true);
    expect(verifyResult.message).toContain("verificado com sucesso");
  });

  it("should reject verification with wrong code", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.signup.verifyCode({
        email: testEmail,
        code: "000000",
      })
    ).rejects.toThrow();
  });

  it("should reject code with incorrect length", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.signup.verifyCode({
        email: testEmail,
        code: "123",
      })
    ).rejects.toThrow();
  });
});

describe("Database Signup Functions", () => {
  it("should create signup request in database", async () => {
    const email = `db-test-${Date.now()}@papayanews.com`;
    const code = "123456";

    await expect(
      createSignupRequest("Test User", email, code)
    ).resolves.not.toThrow();
  });

  it("should verify code correctly", async () => {
    const email = `verify-db-${Date.now()}@papayanews.com`;
    const code = "654321";

    await createSignupRequest("Test User", email, code);
    
    const result = await verifySignupCode(email, code);
    
    expect(result.success).toBe(true);
    expect(result.name).toBe("Test User");
    expect(result.email).toBe(email);
  });

  it("should reject wrong verification code", async () => {
    const email = `wrong-code-${Date.now()}@papayanews.com`;
    const correctCode = "111111";
    const wrongCode = "999999";

    await createSignupRequest("Test User", email, correctCode);
    
    const result = await verifySignupCode(email, wrongCode);
    
    expect(result.success).toBe(false);
    expect(result.error).toContain("inválido");
  });

  it("should reject already used code", async () => {
    const email = `used-code-${Date.now()}@papayanews.com`;
    const code = "222222";

    await createSignupRequest("Test User", email, code);
    
    // Primeira verificação deve funcionar
    const firstResult = await verifySignupCode(email, code);
    expect(firstResult.success).toBe(true);
    
    // Segunda verificação deve falhar
    const secondResult = await verifySignupCode(email, code);
    expect(secondResult.success).toBe(false);
    expect(secondResult.error).toContain("já foi utilizado");
  });
});
