"use client";

import { PlanWeek } from "@/lib/types";
import { courses as allCourses } from "@/data/courses";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ExternalLink, Clock, BadgeAlert, CheckCircle2 } from "lucide-react";
import { useProgress } from "./progress-context";
import { LessonChecklist } from "./lesson-checklist";

interface PlanWeekCardProps {
  week: PlanWeek;
}

interface GroupedCourse {
  courseId: string;
  courseName: string;
  url: string;
  phase: number;
  modules: {
    moduleId: string;
    moduleName: string;
    lessons: { id: string; name: string }[];
    estimatedHours: number;
  }[];
}

export function PlanWeekCard({ week }: PlanWeekCardProps) {
  const { getWeekPercentage } = useProgress();

  // Agrupa os módulos da semana por curso para exibição limpa
  const coursesMap = new Map<string, GroupedCourse>();
  
  for (const mod of week.modules) {
    if (!coursesMap.has(mod.courseId)) {
      const fullCourse = allCourses.find((c) => c.id === mod.courseId);
      coursesMap.set(mod.courseId, {
        courseId: mod.courseId,
        courseName: mod.courseName,
        url: fullCourse?.url || "",
        phase: fullCourse?.phase ?? 0,
        modules: [],
      });
    }
    
    coursesMap.get(mod.courseId)!.modules.push({
      moduleId: mod.moduleId,
      moduleName: mod.moduleName,
      lessons: mod.lessons,
      estimatedHours: mod.estimatedHours,
    });
  }

  const groupedCourses = Array.from(coursesMap.values());

  // Formata o intervalo de datas da semana
  const dateRangeStr = `${format(week.startDate, "dd 'de' MMM", { locale: ptBR })} a ${format(
    week.endDate,
    "dd 'de' MMM",
    { locale: ptBR }
  )}`;

  // Coleta todos os IDs de lições desta semana para calcular a porcentagem
  const weekLessonIds = week.modules.flatMap((m) => m.lessons.map((l) => l.id));
  const weekPercentage = getWeekPercentage(weekLessonIds);

  return (
    <div className="w-full bg-card/25 backdrop-blur-sm border border-border rounded-xl p-5 sm:p-6 hover:border-primary/20 transition-all duration-300 flex flex-col gap-6 shadow-md hover:shadow-xl group relative overflow-hidden">
      
      {/* Indicador de progresso de borda superior */}
      <div
        className="absolute top-0 left-0 h-[2px] bg-primary transition-all duration-500 ease-out"
        style={{ width: `${weekPercentage}%` }}
      />

      {/* Cabeçalho da Semana */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/20 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight font-sans text-foreground group-hover:text-primary transition-colors">
              Semana {week.index}
            </h2>
            {weekPercentage === 100 && (
              <CheckCircle2 className="w-4 h-4 text-primary animate-bounce" />
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground font-sans uppercase tracking-wide">
            {dateRangeStr}
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
          {/* Barra de Progresso da Semana */}
          <div className="flex items-center gap-2 bg-muted/20 border border-border/30 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-muted-foreground font-sans">Progresso:</span>
            <div className="w-16 sm:w-20 bg-muted/65 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-500 ease-out"
                style={{ width: `${weekPercentage}%` }}
              />
            </div>
            <span className="font-mono text-foreground font-bold">{weekPercentage}%</span>
          </div>

          {/* Badge de Alta Importância */}
          {week.highWeight && (
            <div className="inline-flex items-center gap-1 bg-primary text-primary-foreground font-mono text-[9px] font-extrabold tracking-wider px-2 py-1 rounded-md uppercase border border-primary/20">
              <BadgeAlert className="w-3 h-3" />
              <span>Alto Peso</span>
            </div>
          )}

          {/* Horas Acumuladas */}
          <div className="inline-flex items-center gap-1.5 bg-muted/30 border border-border/40 px-2.5 py-1 rounded-lg text-xs font-mono text-foreground">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>{week.hours.toFixed(1)}h</span>
          </div>
        </div>
      </div>

      {/* Lista de Cursos e Lições */}
      <div className="space-y-6">
        {groupedCourses.map((c) => (
          <div key={c.courseId} className="space-y-4">
            
            {/* Título do Curso */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 rounded-full bg-primary" />
                <h3 className="text-sm sm:text-base font-bold font-sans text-foreground">
                  {c.courseName}
                </h3>
                <span className="text-[10px] font-mono text-muted-foreground border border-border/40 px-1.5 py-0.5 rounded">
                  Fase {c.phase}
                </span>
              </div>
              
              {c.url && (
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs font-mono text-primary hover:text-primary/80 transition-colors gap-1 cursor-pointer print:hidden"
                >
                  <span>abrir</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Módulos do Curso na Semana */}
            <div className="pl-3.5 space-y-4 border-l border-border/20">
              {c.modules.map((m) => (
                <div key={m.moduleId} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                    <span className="text-primary/90 font-semibold">{m.moduleName}</span>
                    <span>{m.estimatedHours.toFixed(1)}h</span>
                  </div>

                  {/* Aulas do Módulo */}
                  <ul className="space-y-1.5 pl-1.5">
                    {m.lessons.map((lesson) => (
                      <LessonChecklist
                        key={lesson.id}
                        lessonId={lesson.id}
                        lessonName={lesson.name}
                      />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
