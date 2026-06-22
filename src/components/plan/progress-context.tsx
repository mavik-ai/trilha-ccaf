"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getLocalProgress, toggleLocalProgress } from "@/lib/local-progress";

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
}

export function ProgressProvider({ children, allPlanLessonIds }: ProgressProviderProps) {
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carrega o progresso inicial apenas após a montagem no cliente para evitar erros de hidratação (SSR)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCompletedLessons(getLocalProgress());
    setIsLoaded(true);
  }, []);

  const toggleLesson = (lessonId: string) => {
    const nextCompleted = toggleLocalProgress(lessonId);
    setCompletedLessons(nextCompleted);
  };

  const isCompleted = (lessonId: string) => {
    return completedLessons.includes(lessonId);
  };

  // Filtra as aulas concluídas que de fato pertencem ao plano atual para calcular a porcentagem correta
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
