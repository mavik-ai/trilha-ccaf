import { Course, Module, Lesson } from "../lib/types";

// Helper para gerar módulos e lições sequencialmente
function generateModules(
  courseId: string,
  modulesConfig: { name: string; lessonsCount: number }[]
): Module[] {
  let overallLessonIndex = 1;
  return modulesConfig.map((mod, modIdx) => {
    const modId = `${courseId}_m${modIdx + 1}`;
    const lessons: Lesson[] = [];
    
    for (let i = 0; i < mod.lessonsCount; i++) {
      lessons.push({
        id: `${courseId}_m${modIdx + 1}_l${overallLessonIndex}`,
        name: `Aula ${overallLessonIndex}: Tópico de estudo ${overallLessonIndex}`,
      });
      overallLessonIndex++;
    }
    
    return {
      id: modId,
      name: mod.name,
      lessons,
    };
  });
}

// Dataset único dos 9 cursos oficiais
export const courses: Course[] = [
  {
    id: "claude_101",
    name: "Claude 101",
    url: "https://academy.anthropic.com/courses/claude-101",
    phase: 0,
    hours: 2.5,
    domainTag: "Fundação",
    optionalBase: true,
    modules: generateModules("claude_101", [
      { name: "Fundamentos e Interface do Claude", lessonsCount: 7 },
      { name: "Uso Prático e Estruturas de Prompts", lessonsCount: 7 },
    ]),
  },
  {
    id: "ai_fluency",
    name: "AI Fluency",
    url: "https://academy.anthropic.com/courses/ai-fluency",
    phase: 0,
    hours: 3.5,
    domainTag: "Fundação",
    optionalBase: true,
    modules: generateModules("ai_fluency", [
      { name: "Conceitos e Fluência de IA", lessonsCount: 8 },
      { name: "Casos de Uso no Fluxo de Trabalho", lessonsCount: 7 },
    ]),
  },
  {
    id: "building_api",
    name: "Building with the Claude API",
    url: "https://academy.anthropic.com/courses/building-with-the-claude-api",
    phase: 1,
    hours: 8.0,
    domainTag: "Desenvolvimento e API",
    optionalBase: false,
    modules: generateModules("building_api", [
      { name: "Introdução à API de Mensagens", lessonsCount: 15 },
      { name: "Engenharia de Prompt para API", lessonsCount: 15 },
      { name: "Parâmetros, Contexto e Streaming", lessonsCount: 20 },
      { name: "Uso de Ferramentas (Tool Use/Function Calling)", lessonsCount: 20 },
      { name: "Segurança, Mitigação de Latência e Boas Práticas", lessonsCount: 15 },
    ]),
  },
  {
    id: "platform_101",
    name: "Claude Platform 101",
    url: "https://academy.anthropic.com/courses/claude-platform-101",
    phase: 1,
    hours: 1.5,
    domainTag: "Plataforma e Ferramental",
    optionalBase: false,
    modules: generateModules("platform_101", [
      { name: "Console e Workbench da Anthropic", lessonsCount: 7 },
      { name: "Administração de Projetos e Avaliações", lessonsCount: 7 },
    ]),
  },
  {
    id: "claude_code",
    name: "Claude Code in Action",
    url: "https://academy.anthropic.com/courses/claude-code-in-action",
    phase: 2,
    hours: 3.0,
    domainTag: "Aplicações Práticas",
    optionalBase: false,
    modules: generateModules("claude_code", [
      { name: "Conhecendo o Claude Code CLI", lessonsCount: 10 },
      { name: "Desenvolvimento Ágil Auxiliado por Agente", lessonsCount: 11 },
    ]),
  },
  {
    id: "agent_skills",
    name: "Agent Skills",
    url: "https://academy.anthropic.com/courses/agent-skills",
    phase: 2,
    hours: 1.0,
    domainTag: "Arquiteturas Agênticas",
    optionalBase: false,
    approx: true,
    modules: generateModules("agent_skills", [
      { name: "Habilidades Agênticas Críticas (Grade por Tópicos)", lessonsCount: 8 },
    ]),
  },
  {
    id: "intro_mcp",
    name: "Introduction to MCP",
    url: "https://academy.anthropic.com/courses/introduction-to-mcp",
    phase: 3,
    hours: 2.5,
    domainTag: "Model Context Protocol (MCP)",
    optionalBase: false,
    modules: generateModules("intro_mcp", [
      { name: "Conceitos Fundamentais e Arquitetura", lessonsCount: 7 },
      { name: "Configuração de Clientes e Uso de Servidores", lessonsCount: 7 },
    ]),
  },
  {
    id: "advanced_mcp",
    name: "MCP: Advanced Topics",
    url: "https://academy.anthropic.com/courses/mcp-advanced-topics",
    phase: 3,
    hours: 2.0,
    domainTag: "Model Context Protocol (MCP)",
    optionalBase: false,
    approx: true,
    modules: generateModules("advanced_mcp", [
      { name: "Desenvolvimento de Servidores e Protocolo de Transporte", lessonsCount: 4 },
    ]),
  },
  {
    id: "subagents",
    name: "Introduction to Subagents",
    url: "https://academy.anthropic.com/courses/introduction-to-subagents",
    phase: 4,
    hours: 1.0,
    domainTag: "Orquestração Agêntica",
    optionalBase: false,
    modules: generateModules("subagents", [
      { name: "Design e Comunicação entre Subagentes", lessonsCount: 4 },
    ]),
  },
];

// Filtra os cursos conforme a necessidade de incluir a base (Fase 0)
export function coursesFor(includeBase: boolean): Course[] {
  return courses.filter((c) => !c.optionalBase || includeBase);
}

// Retorna a soma das horas estimadas dos cursos selecionados
export function totalHours(includeBase: boolean): number {
  return coursesFor(includeBase).reduce((sum, c) => sum + c.hours, 0);
}
