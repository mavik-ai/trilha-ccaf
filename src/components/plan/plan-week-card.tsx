import { PlanWeek } from "@/lib/types";
import { courses as allCourses } from "@/data/courses";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ExternalLink, Clock, BadgeAlert } from "lucide-react";

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

  return (
    <div className="w-full bg-card/25 backdrop-blur-sm border border-border rounded-xl p-5 sm:p-6 hover:border-primary/20 transition-all duration-300 flex flex-col gap-6 shadow-md hover:shadow-xl group">
      
      {/* Cabeçalho da Semana */}
      <div className="flex items-start justify-between border-b border-border/20 pb-4">
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight font-sans text-foreground group-hover:text-primary transition-colors">
            Semana {week.index}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-sans uppercase tracking-wide">
            {dateRangeStr}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
          {/* Badge de Alta Importância */}
          {week.highWeight && (
            <div className="inline-flex items-center gap-1 bg-primary text-primary-foreground font-mono text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded-md uppercase border border-primary/20 animate-pulse">
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
                      <li
                        key={lesson.id}
                        className="text-xs sm:text-sm text-muted-foreground hover:text-foreground font-sans flex items-start gap-2.5 transition-colors duration-150 py-0.5"
                      >
                        {/* Indicador de Lição provisório (no SPEC-007 vira checkbox) */}
                        <div className="w-4 h-4 rounded border border-border/50 flex-shrink-0 mt-0.5 bg-card/10 flex items-center justify-center font-mono text-[9px] text-muted-foreground/60 select-none">
                          •
                        </div>
                        <span className="leading-snug">{lesson.name}</span>
                      </li>
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
