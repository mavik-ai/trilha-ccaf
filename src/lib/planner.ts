import { PlanInput, PlanResult, PlanWeek, PlanVerdict } from "./types";
import { coursesFor, totalHours } from "../data/courses";

/**
 * Função pura que gera um cronograma semanal datado com base nos inputs do quiz
 * e calcula o veredito de cumprimento de prazo (se houver data-alvo).
 */
export function gerarPlano(input: PlanInput): PlanResult {
  const { hoursWeek, includeBase, startDate, targetDate } = input;
  const activeCourses = coursesFor(includeBase);
  const totalHoursCount = totalHours(includeBase);

  const weeks: PlanWeek[] = [];
  let currentWeekIndex = 1;

  // Função interna para instanciar novas semanas datadas corretamente
  const startNewWeek = (start: Date, index: number): PlanWeek => {
    const weekStart = new Date(start.getTime());
    weekStart.setDate(start.getDate() + (index - 1) * 7);
    
    const weekEnd = new Date(weekStart.getTime());
    weekEnd.setDate(weekStart.getDate() + 6);

    return {
      index,
      startDate: weekStart,
      endDate: weekEnd,
      modules: [],
      hours: 0,
      highWeight: false,
    };
  };

  let activeWeek = startNewWeek(startDate, currentWeekIndex);

  for (const course of activeCourses) {
    // Total de aulas do curso para distribuição proporcional de horas
    const totalLessonsInCourse = course.modules.reduce(
      (sum, m) => sum + m.lessons.length,
      0
    );

    for (const mod of course.modules) {
      if (mod.lessons.length === 0) continue;

      const modHours = course.hours * (mod.lessons.length / totalLessonsInCourse);

      // Se o módulo estourar a cota semanal E a semana atual já contiver outros módulos
      if (activeWeek.hours + modHours > hoursWeek && activeWeek.hours > 0) {
        weeks.push(activeWeek);
        currentWeekIndex++;
        activeWeek = startNewWeek(startDate, currentWeekIndex);
      }

      // Alocar módulo na semana
      activeWeek.modules.push({
        courseId: course.id,
        courseName: course.name,
        moduleId: mod.id,
        moduleName: mod.name,
        lessons: mod.lessons,
        estimatedHours: modHours,
      });
      activeWeek.hours += modHours;

      // Marcar semana como highWeight se contiver cursos das Fases 3 ou 4
      if (course.phase === 3 || course.phase === 4) {
        activeWeek.highWeight = true;
      }
    }
  }

  // Empurrar a última semana se contiver módulos
  if (activeWeek.modules.length > 0) {
    weeks.push(activeWeek);
  }

  // Definir data de término final
  const endDate = weeks.length > 0 ? weeks[weeks.length - 1].endDate : new Date(startDate.getTime());

  // Lógica de Veredito de Prazo
  let verdict: PlanVerdict = "FOLGADO";
  let requiredHoursWeek: number | undefined = undefined;

  if (targetDate) {
    const diffTime = targetDate.getTime() - startDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    const weeksAvailable = Math.floor(diffDays / 7);

    if (weeksAvailable <= 0) {
      verdict = "INVIÁVEL";
      requiredHoursWeek = Math.ceil(totalHoursCount);
    } else {
      const ritmo = totalHoursCount / weeksAvailable;
      if (ritmo <= hoursWeek) {
        verdict = "FOLGADO";
      } else if (ritmo <= hoursWeek * 1.2) {
        verdict = "NO LIMITE";
      } else {
        verdict = "INVIÁVEL";
        requiredHoursWeek = Math.ceil(ritmo);
      }
    }
  }

  return {
    weeks,
    verdict,
    requiredHoursWeek,
    endDate,
  };
}
