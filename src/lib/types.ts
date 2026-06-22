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
