/**
 * Utilitário para envio de notificações por E-mail (Brevo) e WhatsApp (Evolution API).
 */

interface SendNotificationResult {
  success: boolean;
  error?: string;
}

/**
 * Envia lembrete semanal por e-mail via API de transações do Brevo.
 */
export async function sendEmailReminder(
  email: string,
  weekIndex: number
): Promise<SendNotificationResult> {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.log(`[MOCK EMAIL] Enviando lembrete da Semana ${weekIndex} para ${email}`);
    return { success: true };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "Trilha CCA-F MAVIK", email: "no-reply@mavik.com.br" },
        to: [{ email }],
        subject: `Sua Semana ${weekIndex} de Estudos Trilha Começou! 🚀`,
        htmlContent: `
          <html>
            <body style="font-family: sans-serif; background-color: #121212; color: #ffffff; padding: 20px;">
              <h1 style="color: #F1FD44;">Trilha Claude Certified Architect</h1>
              <p>Olá,</p>
              <p>Uma nova semana de estudos começou para você! 📅</p>
              <p><strong>Semana atual: Semana ${weekIndex}</strong></p>
              <p>Acesse o seu cronograma personalizado para marcar as aulas concluídas e continuar no ritmo ideal para passar no exame da Anthropic.</p>
              <br/>
              <a href="${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/plano" style="background-color: #F1FD44; color: #000000; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Ver Meu Cronograma
              </a>
              <br/><br/>
              <p style="font-size: 11px; color: #a0a0a0;">Caso não queira mais receber estes lembretes semanais, você pode alterar as configurações em sua conta.</p>
            </body>
          </html>
        `,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return { success: false, error: `Brevo API erro: ${errText}` };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao disparar e-mail via Brevo:", error);
    return { success: false, error: error instanceof Error ? error.message : "Erro desconhecido" };
  }
}

/**
 * Envia lembrete semanal por WhatsApp via Evolution API.
 */
export async function sendWhatsAppReminder(
  phone: string,
  weekIndex: number
): Promise<SendNotificationResult> {
  const apiUrl = process.env.EVOLUTION_API_URL;
  const apiKey = process.env.EVOLUTION_API_KEY;
  const instance = process.env.EVOLUTION_INSTANCE;

  if (!apiUrl || !apiKey || !instance) {
    console.log(`[MOCK WHATSAPP] Enviando lembrete da Semana ${weekIndex} para o número +${phone}`);
    return { success: true };
  }

  // Higieniza número garantindo que não contenha caracteres não-numéricos
  const sanitizedPhone = phone.replace(/\D/g, "");

  try {
    const response = await fetch(`${apiUrl}/message/sendText/${instance}`, {
      method: "POST",
      headers: {
        "apikey": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        number: sanitizedPhone,
        options: {
          delay: 1200,
          presence: "composing",
        },
        textMessage: {
          text: `*MAVIK Trilha Claude Architect* 🚀\n\nOlá! Passando para lembrar que sua *Semana ${weekIndex}* de estudos começou hoje! 📅\n\nMantenha o foco e marque as aulas concluídas no seu painel:\n${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/plano`
        }
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return { success: false, error: `Evolution API erro: ${errText}` };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao disparar WhatsApp via Evolution API:", error);
    return { success: false, error: error instanceof Error ? error.message : "Erro desconhecido" };
  }
}
