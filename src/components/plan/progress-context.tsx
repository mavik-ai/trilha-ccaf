"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getLocalProgress, toggleLocalProgress } from "@/lib/local-progress";
import { syncLocalProgressAction } from "@/app/actions/plan";
import { toggleLessonAction } from "@/app/actions/progress";

interface ProgressContextType {
  completedLessons: string[];
  toggleLesson: (lessonId: string) => void;
  isCompleted: (lessonId: string) => boolean;
  overallPercentage: number;
  getWeekPercentage: (lessonIds: string[]) => number;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

interface ProgressProviderProps {
  children: React.ReactNode;
  allPlanLessonIds: string[];
  isLoggedIn: boolean;
  initialCompletedLessons: string[];
}

export function ProgressProvider({
  children,
  allPlanLessonIds,
  isLoggedIn,
  initialCompletedLessons,
}: ProgressProviderProps) {
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carrega e sincroniza o progresso inicial após a montagem no cliente para evitar erros de hidratação (SSR)
  useEffect(() => {
    async function initializeProgress() {
      if (isLoggedIn) {
        const localProgress = getLocalProgress();
        
        if (localProgress.length > 0) {
          try {
            // Sincroniza o progresso anônimo do localStorage com o banco Neon
            await syncLocalProgressAction(localProgress);
            
            // Limpa o localStorage para evitar sincronizações duplicadas
            window.localStorage.removeItem("trilha_progress_v1");
            
            // Mescla o progresso existente no banco com o progresso que estava salvo no localStorage
            const merged = Array.from(new Set([...initialCompletedLessons, ...localProgress]));
            setCompletedLessons(merged);
          } catch (error) {
            console.error("Erro ao sincronizar progresso local pós-login:", error);
            setCompletedLessons(initialCompletedLessons);
          }
        } else {
          setCompletedLessons(initialCompletedLessons);
        }
      } else {
        // Usuário anônimo carrega estritamente do localStorage
        setCompletedLessons(getLocalProgress());
      }
      setIsLoaded(true);
    }

    initializeProgress();
  }, [isLoggedIn, initialCompletedLessons]);

  const toggleLesson = async (lessonId: string) => {
    const isCurrentlyCompleted = completedLessons.includes(lessonId);
    const nextCompletedState = !isCurrentlyCompleted;

    // Atualização otimista (Optimistic UI) para feedback visual imediato
    if (nextCompletedState) {
      setCompletedLessons((prev) => [...prev, lessonId]);
    } else {
      setCompletedLessons((prev) => prev.filter((id) => id !== lessonId));
    }

    try {
      if (isLoggedIn) {
        // Salva diretamente no Neon
        const res = await toggleLessonAction(lessonId, nextCompletedState);
        if (res?.error) {
          console.error("Erro ao alternar progresso no servidor:", res.error);
          // Reverte o estado em caso de erro no servidor
          if (isCurrentlyCompleted) {
            setCompletedLessons((prev) => [...prev, lessonId]);
          } else {
            setCompletedLessons((prev) => prev.filter((id) => id !== lessonId));
          }
        }
      } else {
        // Salva localmente no localStorage
        toggleLocalProgress(lessonId);
      }
    } catch (error) {
      console.error("Erro ao alternar progresso da aula:", error);
      // Reverte em caso de exceção de rede
      if (isCurrentlyCompleted) {
        setCompletedLessons((prev) => [...prev, lessonId]);
      } else {
        setCompletedLessons((prev) => prev.filter((id) => id !== lessonId));
      }
    }
  };

  const isCompleted = (lessonId: string) => {
    return completedLessons.includes(lessonId);
  };

  // Filtra as aulas concluídas que pertencem ao plano atual
  const activeCompletedCount = allPlanLessonIds.filter((id) =>
    completedLessons.includes(id)
  ).length;

  const overallPercentage =
    allPlanLessonIds.length > 0
      ? Math.round((activeCompletedCount / allPlanLessonIds.length) * 100)
      : 0;

  const getWeekPercentage = (lessonIds: string[]) => {
    if (lessonIds.length === 0) return 0;
    const completedInWeek = lessonIds.filter((id) => completedLessons.includes(id)).length;
    return Math.round((completedInWeek / lessonIds.length) * 100);
  };

  return (
    <ProgressContext.Provider
      value={{
        completedLessons,
        toggleLesson,
        isCompleted,
        overallPercentage: isLoaded ? overallPercentage : 0,
        getWeekPercentage: (ids) => (isLoaded ? getWeekPercentage(ids) : 0),
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress deve ser usado dentro de um ProgressProvider");
  }
  return context;
}
