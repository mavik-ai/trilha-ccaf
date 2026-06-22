export interface Lesson {
  id: string;      // ID único estável: curso_modulo_aula (ex: "api_m1_l5")
  name: string;    // Nome da aula (ex: "Introdução à API de Mensagens")
}

export interface Module {
  id: string;      // ID único: curso_modulo (ex: "api_m1")
  name: string;    // Nome do módulo
  lessons: Lesson[];
}

export interface Course {
  id: string;          // ID único: curso (ex: "building_api")
  name: string;        // Nome amigável do curso
  url: string;         // Link oficial no Skilljar
  phase: number;       // Fase (0 = Base, 1 a 4 = Técnico)
  hours: number;       // Carga horária total estimada
  domainTag: string;   // Tag do domínio do exame
  optionalBase: boolean; // Indica se é opcional da Fase 0
  approx?: boolean;    // Indica se a grade foi aproximada por tópicos
  modules: Module[];
}

export interface PlanInput {
  hoursWeek: number;      // 3, 5, 8, 10, etc.
  includeBase: boolean;
  startDate: Date;
  targetDate?: Date | null;
}

export interface PlanWeekModule {
  courseId: string;
  courseName: string;
  moduleId: string;
  moduleName: string;
  lessons: Lesson[];
  estimatedHours: number;
}

export interface PlanWeek {
  index: number;         // 1-based (Semana 1, Semana 2...)
  startDate: Date;
  endDate: Date;
  modules: PlanWeekModule[];
  hours: number;
  highWeight: boolean;   // true se contiver cursos de Fase 3 ou 4
}

export type PlanVerdict = "FOLGADO" | "NO LIMITE" | "INVIÁVEL";

export interface PlanResult {
  weeks: PlanWeek[];
  verdict: PlanVerdict;
  requiredHoursWeek?: number; // Carga horária ideal recomendada se for inviável
  endDate: Date;
}
