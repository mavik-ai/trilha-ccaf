import { describe, it, expect } from "vitest";
import { gerarPlano } from "@/lib/planner";
import { totalHours } from "@/data/courses";

describe("Motor de Planejamento - gerarPlano()", () => {
  const hoje = new Date("2026-06-22T12:00:00Z");

  // 1. Caso: 3h/sem com base incluída -> plano longo, sem erro
  it("deve gerar um plano longo sem erros para cota de 3h/semana incluindo base", () => {
    const resultado = gerarPlano({
      hoursWeek: 3,
      includeBase: true,
      startDate: hoje,
      targetDate: null,
    });

    expect(resultado.weeks.length).toBeGreaterThanOrEqual(9); // Carga total 25h / 3h/sem = 8.3 semanas -> no mínimo 9 semanas
    expect(resultado.verdict).toBe("FOLGADO");
    expect(resultado.endDate).toBeInstanceOf(Date);
    expect(resultado.weeks[0].modules.length).toBeGreaterThan(0);
  });

  // 2. Caso: data-alvo no passado -> veredito inviável, sem throw
  it("deve retornar veredito INVIÁVEL e não lançar exceções se a data-alvo for no passado", () => {
    const ontem = new Date(hoje.getTime() - 24 * 60 * 60 * 1000);
    
    expect(() => {
      const resultado = gerarPlano({
        hoursWeek: 5,
        includeBase: false,
        startDate: hoje,
        targetDate: ontem,
      });

      expect(resultado.verdict).toBe("INVIÁVEL");
      expect(resultado.requiredHoursWeek).toBe(totalHours(false)); // Carga completa exigida
    }).not.toThrow();
  });

  // 3. Caso: 10h+/sem avançado -> poucas semanas
  it("deve alocar em poucas semanas quando a cota de horas semanal é alta", () => {
    const resultado = gerarPlano({
      hoursWeek: 12,
      includeBase: false,
      startDate: hoje,
      targetDate: null,
    });

    // Carga avançada = 19h. Com 12h/semana -> deve caber em 2 ou 3 semanas (devido à fronteira de módulo)
    expect(resultado.weeks.length).toBeLessThanOrEqual(3);
    expect(resultado.weeks.length).toBeGreaterThan(0);
  });

  // 4. Caso: integridade — soma de horas alocadas = total; nenhuma aula duplicada/perdida
  it("deve manter a integridade total do dataset (horas e lições exatas alocadas sem duplicidade)", () => {
    const includeBaseOptions = [true, false];

    for (const includeBase of includeBaseOptions) {
      const resultado = gerarPlano({
        hoursWeek: 5,
        includeBase,
        startDate: hoje,
        targetDate: null,
      });

      const totalHorasEsperado = totalHours(includeBase);
      const totalAulasEsperado = includeBase ? 179 : 150;

      let totalHorasAlocadas = 0;
      const lessonIds = new Set<string>();

      for (const week of resultado.weeks) {
        totalHorasAlocadas += week.hours;
        for (const mod of week.modules) {
          for (const lesson of mod.lessons) {
            expect(lessonIds.has(lesson.id)).toBe(false); // Nenhuma lição duplicada
            lessonIds.add(lesson.id);
          }
        }
      }

      // Soma das horas das semanas deve bater perfeitamente com o total do dataset
      expect(Math.abs(totalHorasAlocadas - totalHorasEsperado)).toBeLessThan(0.001);
      
      // Quantidade total de lições alocadas no plano deve bater exatamente
      expect(lessonIds.size).toBe(totalAulasEsperado);
    }
  });

  // 5. Caso: fronteira de módulo respeitada
  it("deve manter a fronteira rígida de módulos, garantindo que nenhum módulo seja dividido em duas semanas", () => {
    const resultado = gerarPlano({
      hoursWeek: 4,
      includeBase: true,
      startDate: hoje,
      targetDate: null,
    });

    const moduleWeeksMap = new Map<string, number>(); // moduleId -> index da semana em que foi alocado

    for (const week of resultado.weeks) {
      for (const mod of week.modules) {
        if (moduleWeeksMap.has(mod.moduleId)) {
          // O módulo foi encontrado em outra semana! Isso quebra a regra de fronteira rígida
          const semanaAnterior = moduleWeeksMap.get(mod.moduleId);
          throw new Error(
            `Módulo fatiado detectado: ${mod.moduleId} está alocado tanto na Semana ${semanaAnterior} quanto na Semana ${week.index}`
          );
        }
        moduleWeeksMap.set(mod.moduleId, week.index);
      }
    }
  });
});
