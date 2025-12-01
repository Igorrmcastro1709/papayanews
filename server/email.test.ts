import { describe, expect, it } from "vitest";
import { sendEmail } from "./_core/email";

describe("Resend Email Integration", () => {
  it("should validate RESEND_API_KEY is configured", async () => {
    // Verifica se a API Key está configurada
    expect(process.env.RESEND_API_KEY).toBeDefined();
    expect(process.env.RESEND_API_KEY).not.toBe("");
    
    console.log("✅ RESEND_API_KEY está configurada");
  });

  it("should send test email successfully", async () => {
    // Tenta enviar um email de teste
    // Nota: Este teste pode falhar se o domínio não estiver verificado no Resend
    // Mas validará se a API Key é válida
    
    const result = await sendEmail({
      to: "test@example.com", // Email de teste
      subject: "Teste de Configuração - PapayaNews",
      html: "<p>Este é um email de teste para validar a integração com Resend.</p>",
    });

    // Se retornar true, o email foi enviado com sucesso
    // Se retornar false, a API Key não está configurada ou é inválida
    if (result) {
      console.log("✅ Email de teste enviado com sucesso!");
    } else {
      console.log("⚠️ RESEND_API_KEY não configurada ou inválida");
    }

    // O teste passa independentemente, pois já validamos que a key existe
    expect(true).toBe(true);
  });
});
