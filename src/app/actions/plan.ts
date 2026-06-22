"use server";

import { db } from "@/db";
import { plans, progress } from "@/db/schema";
import { getSession } from "@/lib/auth/server";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

// Map em memória para gerenciar rate limits simples por IP do cliente
const rateLimitMap = new Map<string, number>();

/**
 * Limpa o mapa de rate limits em memória (útil para testes).
 */
export function clearRateLimits(): void {
  rateLimitMap.clear();
}

/**
 * Verifica se a requisição de um IP está sofrendo rate limit (máximo 1 req a cada 2 segundos).
 */
export function isRateLimited(key: string, limitMs: number = 2000): boolean {
  const now = Date.now();
  const lastTime = rateLimitMap.get(key);
  if (lastTime && now - lastTime < limitMs) {
    return true;
  }
  rateLimitMap.set(key, now);
  return false;
}

/**
 * Extrai de forma segura o endereço IP do cliente inspecionando os cabeçalhos do Next.js.
 */
export async function getClientIp(): Promise<string> {
  try {
    const headersList = await headers();
    const xForwardedFor = headersList.get("x-forwarded-for");
    if (xForwardedFor) {
      return xForwardedFor.split(",")[0].trim();
    }
    return headersList.get("x-real-ip") || "unknown-ip";
  } catch {
    // Fallback seguro durante a execução de testes offline
    return "test-ip";
  }
}

/**
 * Valida o token Turnstile diretamente com a API da Cloudflare.
 */
export async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY || "1x0000000000000000000000000000000AA"; // Chave de testes secreta padrão
  
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`,
    });
    
    const data = await res.json();
    return !!data.success;
  } catch (error) {
    console.error("Erro ao verificar token no Cloudflare Turnstile:", error);
    return false;
  }
}

/**
 * Server Action para verificar o captcha anti-bot Turnstile antes do cadastro.
 */
export async function signUpWithTurnstileAction(email: string, turnstileToken: string) {
  const ip = await getClientIp();
  if (isRateLimited(ip)) {
    return { error: "Muitas requisições. Aguarde 2 segundos." };
  }

  if (!email || !turnstileToken) {
    return { error: "Dados obrigatórios ausentes para o cadastro." };
  }

  const isValid = await verifyTurnstileToken(turnstileToken);
  if (!isValid) {
    return { error: "Verificação anti-bot inválida. Por favor, tente novamente." };
  }

  return { success: true };
}

interface SavePlanInput {
  hoursWeek: number;
  includeBase: boolean;
  startDate: string; // ISO string
  targetDate?: string | null; // ISO string ou null
}

/**
 * Server Action para salvar o plano de estudos do usuário autenticado.
 */
export async function savePlanAction(input: SavePlanInput) {
  const ip = await getClientIp();
  if (isRateLimited(ip)) {
    return { error: "Muitas requisições. Aguarde 2 segundos." };
  }

  try {
    const sessionRes = await getSession();
    const sessionData = sessionRes && "data" in sessionRes ? sessionRes.data : null;
    
    if (!sessionData?.user?.id) {
      return { error: "Não autorizado. Faça login para salvar seu plano." };
    }

    const userId = sessionData.user.id;

    // Remove qualquer plano anterior do usuário
    await db.delete(plans).where(eq(plans.userId, userId));

    // Insere o novo plano
    await db.insert(plans).values({
      userId,
      hoursWeek: input.hoursWeek,
      includeBase: input.includeBase,
      startDate: new Date(input.startDate),
      targetDate: input.targetDate ? new Date(input.targetDate) : null,
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao salvar plano no servidor:", error);
    return { error: "Falha interna ao salvar o plano." };
  }
}

/**
 * Server Action para sincronizar as aulas concluídas do localStorage para o banco de dados.
 */
export async function syncLocalProgressAction(lessonIds: string[]) {
  const ip = await getClientIp();
  if (isRateLimited(ip)) {
    return { error: "Muitas requisições. Aguarde 2 segundos." };
  }

  try {
    if (lessonIds.length === 0) {
      return { success: true };
    }

    const sessionRes = await getSession();
    const sessionData = sessionRes && "data" in sessionRes ? sessionRes.data : null;
    
    if (!sessionData?.user?.id) {
      return { error: "Não autorizado. Faça login para sincronizar progresso." };
    }

    const userId = sessionData.user.id;

    const values = lessonIds.map((lessonId) => ({
      userId,
      lessonId,
    }));

    // Insere as aulas concluídas de forma idempotente usando onConflictDoNothing
    await db
      .insert(progress)
      .values(values)
      .onConflictDoNothing({ target: [progress.userId, progress.lessonId] });

    return { success: true };
  } catch (error) {
    console.error("Erro ao sincronizar progresso no servidor:", error);
    return { error: "Falha interna ao sincronizar o progresso." };
  }
}
