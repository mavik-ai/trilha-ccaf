const STORAGE_KEY = "trilha_progress_v1";

/**
 * Recupera de forma segura a lista de IDs de lições concluídas do localStorage.
 * Retorna um array vazio se não estiver no navegador ou se houver erro.
 */
export function getLocalProgress(): string[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Erro ao ler progresso local:", error);
    return [];
  }
}

/**
 * Salva a lista de IDs de lições concluídas no localStorage.
 */
export function saveLocalProgress(completed: string[]): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
  } catch (error) {
    console.error("Erro ao salvar progresso local:", error);
  }
}

/**
 * Adiciona ou remove uma lição da lista de conclusão no localStorage.
 * Retorna o novo estado.
 */
export function toggleLocalProgress(lessonId: string): string[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const current = getLocalProgress();
    const isCompleted = current.includes(lessonId);
    let next: string[];

    if (isCompleted) {
      next = current.filter((id) => id !== lessonId);
    } else {
      next = [...current, lessonId];
    }

    saveLocalProgress(next);
    return next;
  } catch (error) {
    console.error("Erro ao alterar progresso local:", error);
    return [];
  }
}
