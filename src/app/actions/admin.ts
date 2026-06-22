"use server";

import { db } from "@/db";
import { getSession } from "@/lib/auth/server";
import { sql } from "drizzle-orm";
import { getClientIp, isRateLimited } from "./plan";

export interface LeadInfo {
  id: string;
  email: string;
  segment: string;
  whatsapp: string | null;
  instagram: string | null;
  createdAt: string;
  completedLessonsCount: number;
}

/**
 * Server Action para buscar a lista de todos os leads cadastrados (apenas para administradores).
 */
export async function getLeadsAction() {
  const ip = await getClientIp();
  if (isRateLimited(ip)) {
    return { error: "Muitas requisições. Aguarde 2 segundos." };
  }

  try {
    const sessionRes = await getSession();
    const sessionData = sessionRes && "data" in sessionRes ? sessionRes.data : null;
    
    if (!sessionData?.user?.id) {
      return { error: "Não autorizado." };
    }

    const email = sessionData.user.email;
    const adminEmails = (process.env.ADMIN_EMAILS || "admin@mavik.com.br,contato@mavik.com.br").split(",");
    
    if (!adminEmails.includes(email)) {
      return { error: "Acesso restrito apenas a administradores." };
    }

    // Query principal com JOIN no schema gerenciado neon_auth.users_sync
    const query = sql`
      SELECT 
        p.id as "id",
        COALESCE(u.email, 'Desconhecido') as "email",
        p.segment as "segment",
        p.whatsapp as "whatsapp",
        p.instagram as "instagram",
        p.created_at as "createdAt",
        (SELECT COUNT(*)::int FROM progress pr WHERE pr.user_id = p.id) as "completedLessonsCount"
      FROM public.profiles p
      LEFT JOIN neon_auth.users_sync u ON p.id = u.id
      ORDER BY p.created_at DESC
    `;

    let rows: LeadInfo[] = [];

    try {
      const result = await db.execute(query);
      rows = result.rows as unknown as LeadInfo[];
    } catch (error) {
      console.warn("Falha ao consultar neon_auth.users_sync. Utilizando fallback sem JOIN...", error);
      
      // Fallback robusto para bancos locais ou testes onde o schema neon_auth não existe
      const fallbackQuery = sql`
        SELECT 
          p.id as "id",
          'usuario.teste@local.com' as "email",
          p.segment as "segment",
          p.whatsapp as "whatsapp",
          p.instagram as "instagram",
          p.created_at as "createdAt",
          (SELECT COUNT(*)::int FROM progress pr WHERE pr.user_id = p.id) as "completedLessonsCount"
        FROM public.profiles p
        ORDER BY p.created_at DESC
      `;
      
      const result = await db.execute(fallbackQuery);
      rows = result.rows as unknown as LeadInfo[];
    }

    return { data: rows };
  } catch (error) {
    console.error("Erro ao buscar leads no servidor:", error);
    return { error: "Falha interna ao carregar os leads." };
  }
}
