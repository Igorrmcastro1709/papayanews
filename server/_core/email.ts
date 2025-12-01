import { Resend } from 'resend';

/**
 * Módulo de envio de emails usando Resend
 * Para ativar, adicione a variável de ambiente RESEND_API_KEY
 */

let resend: Resend | null = null;

function getResendClient() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Envia email usando Resend
 * Retorna true se enviado com sucesso, false caso contrário
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  const client = getResendClient();
  
  if (!client) {
    console.warn('⚠️ RESEND_API_KEY não configurada. Email não será enviado.');
    console.log(`📧 [SIMULADO] Email para: ${options.to}`);
    console.log(`   Assunto: ${options.subject}`);
    return false;
  }

  try {
    const { data, error } = await client.emails.send({
      from: options.from || 'PapayaNews <ppapayanews@gmail.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error('❌ Erro ao enviar email:', error);
      return false;
    }

    console.log('✅ Email enviado com sucesso:', data?.id);
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    return false;
  }
}

/**
 * Template de email para código de verificação
 */
export function getVerificationEmailTemplate(name: string, code: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Código de Verificação - PapayaNews</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f97316 0%, #fbbf24 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">PapayaNews</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">Comunidade de Inovação e IA</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 24px; font-weight: 600;">Olá, ${name}! 👋</h2>
              
              <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                Bem-vindo(a) à comunidade PapayaNews! Use o código abaixo para verificar seu email e completar seu cadastro:
              </p>
              
              <!-- Verification Code -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center" style="background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%); border-radius: 8px; padding: 30px;">
                    <p style="margin: 0 0 10px 0; color: #78350f; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Seu Código de Verificação</p>
                    <p style="margin: 0; color: #92400e; font-size: 48px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">${code}</p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                ⏰ Este código expira em <strong>15 minutos</strong>.<br>
                🔒 Se você não solicitou este código, ignore este email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                © 2025 PapayaNews. Todos os direitos reservados.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Seu shot diário de inovação, startups e IA
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Envia email de verificação para novo cadastro
 */
export async function sendVerificationEmail(email: string, name: string, code: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `Código de Verificação: ${code} - PapayaNews`,
    html: getVerificationEmailTemplate(name, code),
  });
}
