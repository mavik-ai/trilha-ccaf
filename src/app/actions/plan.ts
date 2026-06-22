"use server";

import { db } from "@/db";
import { plans, progress } from "@/db/schema";
import { getSession } from "@/lib/auth/server";
import { eq } from "drizzle-orm";

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
