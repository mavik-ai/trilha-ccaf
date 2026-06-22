"use server";

import { db } from "@/db";
import { progress } from "@/db/schema";
import { getSession } from "@/lib/auth/server";
import { and, eq } from "drizzle-orm";

/**
 * Server Action para alternar (adicionar/remover) a conclusão de uma aula no banco de dados.
 */
export async function toggleLessonAction(lessonId: string, completed: boolean) {
  try {
    const sessionRes = await getSession();
    const sessionData = sessionRes && "data" in sessionRes ? sessionRes.data : null;
    
    if (!sessionData?.user?.id) {
      return { error: "Não autorizado. Faça login para alterar seu progresso." };
    }

    const userId = sessionData.user.id;

    if (completed) {
      // Adiciona o progresso
      await db
        .insert(progress)
        .values({
          userId,
          lessonId,
        })
        .onConflictDoNothing({ target: [progress.userId, progress.lessonId] });
    } else {
      // Remove o progresso
      await db
        .delete(progress)
        .where(and(eq(progress.userId, userId), eq(progress.lessonId, lessonId)));
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao alternar progresso da aula:", error);
    return { error: "Falha interna ao atualizar o progresso." };
  }
}
