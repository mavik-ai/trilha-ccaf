import { NextResponse } from "next/server";
import { db } from "@/db";
import { plans, profiles } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { sendEmailReminder, sendWhatsAppReminder } from "@/lib/notify/send";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Proteção básica por token via Header ou parâmetro de consulta
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const authHeader = req.headers.get("authorization");
  
  const expectedSecret = process.env.CRON_SECRET || "default_cron_secret";
  const isAuth = authHeader === `Bearer ${expectedSecret}` || token === expectedSecret;

  // Em produção exigimos validação estrita de segurança
  if (process.env.NODE_ENV === "production" && !isAuth) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const allPlans = await db.select().from(plans);
    const today = new Date();
    today.setHours(12, 0, 0, 0); // Normalização neutra de data/hora

    const sentReminders: Array<{ email: string; week: number }> = [];

    for (const plan of allPlans) {
      const planStart = new Date(plan.startDate);
      planStart.setHours(12, 0, 0, 0);
      
      const diffMs = today.getTime() - planStart.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      // Se passou um múltiplo exato de 7 dias, uma nova semana se inicia
      if (diffDays >= 0 && diffDays % 7 === 0) {
        const weekIndex = Math.floor(diffDays / 7) + 1;

        // Busca o perfil do usuário correspondente
        const userProfileList = await db
          .select()
          .from(profiles)
          .where(eq(profiles.id, plan.userId))
          .limit(1);

        const profile = userProfileList[0];
        if (!profile) continue;

        // Se o cadastro estiver incompleto (Pending), pulamos para não enviar spams
        if (profile.segment === "Pending") {
          continue;
        }

        // Tenta obter o e-mail do usuário associado no Neon Auth
        let email = "aluno@trilha-ccaf.com.br";
        try {
          const emailQuery = await db.execute(
            sql`SELECT email FROM neon_auth.users_sync WHERE id = ${plan.userId} LIMIT 1`
          );
          if (emailQuery.rows.length > 0) {
            email = emailQuery.rows[0].email as string;
          }
        } catch {
          // Fallback silencioso em bancos locais sem o schema de sincronização de auth
          email = `usuario_${plan.userId.substring(0, 8)}@trilha-ccaf.com.br`;
        }

        // Dispara e-mail via Brevo (ou log mock)
        await sendEmailReminder(email, weekIndex);

        // Dispara mensagem WhatsApp se o contato opcional estiver preenchido
        if (profile.whatsapp) {
          await sendWhatsAppReminder(profile.whatsapp, weekIndex);
        }

        sentReminders.push({ email, week: weekIndex });
      }
    }

    return NextResponse.json({
      success: true,
      processedCount: allPlans.length,
      sentCount: sentReminders.length,
      reminders: sentReminders,
    });
  } catch (error) {
    console.error("Erro na execução do cronjob de lembretes:", error);
    return NextResponse.json(
      { success: false, error: "Falha interna na execução do cronjob" },
      { status: 500 }
    );
  }
}
