"use server";

import { db } from "@/db";
import { profiles } from "@/db/schema";
import { getSession } from "@/lib/auth/server";
import { eq } from "drizzle-orm";
import { getClientIp, isRateLimited } from "./plan";

interface UpdateProfileInput {
  segment: string;
  whatsapp?: string | null;
  instagram?: string | null;
}

/**
 * Server Action para buscar o perfil do usuário autenticado.
 */
export async function getProfileAction() {
  try {
    const sessionRes = await getSession();
    const sessionData = sessionRes && "data" in sessionRes ? sessionRes.data : null;
    
    if (!sessionData?.user?.id) {
      return { error: "Não autorizado. Faça login para ver seu perfil." };
    }

    const userId = sessionData.user.id;

    const userProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    return { data: userProfile[0] || null };
  } catch (error) {
    console.error("Erro ao buscar perfil no servidor:", error);
    return { error: "Falha interna ao carregar o perfil." };
  }
}

/**
 * Server Action para atualizar ou criar (upsert) o perfil do usuário.
 */
export async function updateProfileAction(input: UpdateProfileInput) {
  const ip = await getClientIp();
  if (isRateLimited(ip)) {
    return { error: "Muitas requisições. Aguarde 2 segundos." };
  }

  try {
    const sessionRes = await getSession();
    const sessionData = sessionRes && "data" in sessionRes ? sessionRes.data : null;
    
    if (!sessionData?.user?.id) {
      return { error: "Não autorizado. Faça login para atualizar seu perfil." };
    }

    const userId = sessionData.user.id;

    // Validação obrigatória do segmento
    if (!input.segment || input.segment.trim() === "") {
      return { error: "O campo Segmento é obrigatório." };
    }

    // Sanitização e validação leve do WhatsApp
    let sanitizedWhatsapp = input.whatsapp ? input.whatsapp.trim() : null;
    if (sanitizedWhatsapp) {
      // Remove tudo o que não for número
      sanitizedWhatsapp = sanitizedWhatsapp.replace(/\D/g, "");
      if (sanitizedWhatsapp.length < 10 || sanitizedWhatsapp.length > 15) {
        return { error: "Número de WhatsApp inválido. Digite DDD + Número." };
      }
    }

    // Sanitização leve do Instagram
    let sanitizedInstagram = input.instagram ? input.instagram.trim() : null;
    if (sanitizedInstagram) {
      // Remove o caractere '@' inicial se o usuário digitou
      if (sanitizedInstagram.startsWith("@")) {
        sanitizedInstagram = sanitizedInstagram.substring(1);
      }
      if (sanitizedInstagram.length < 3) {
        return { error: "Usuário do Instagram inválido." };
      }
    }

    // Grava no banco usando upsert relacional
    await db
      .insert(profiles)
      .values({
        id: userId,
        segment: input.segment.trim(),
        whatsapp: sanitizedWhatsapp,
        instagram: sanitizedInstagram,
      })
      .onConflictDoUpdate({
        target: profiles.id,
        set: {
          segment: input.segment.trim(),
          whatsapp: sanitizedWhatsapp,
          instagram: sanitizedInstagram,
        },
      });

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar perfil no servidor:", error);
    return { error: "Falha interna ao salvar as alterações do perfil." };
  }
}
