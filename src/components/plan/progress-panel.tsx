"use client";

import { useProgress } from "./progress-context";
import { Sparkles, Trophy, Award } from "lucide-react";

export function PlanProgressPanel() {
  const { overallPercentage, completedLessons } = useProgress();

  // Frases motivacionais baseadas no progresso
  let motivationalPhrase = "";
  if (overallPercentage === 0) {
    motivationalPhrase = "O primeiro passo é o mais importante. Marque sua primeira aula para começar!";
  } else if (overallPercentage <= 20) {
    motivationalPhrase = "Excelente começo! A consistência é a chave para dominar a arquitetura do Claude.";
  } else if (overallPercentage <= 50) {
    motivationalPhrase = "Ótimo ritmo! Você já está dominando conceitos fundamentais. Continue firme!";
  } else if (overallPercentage <= 80) {
    motivationalPhrase = "Mais da metade do caminho! Seu repertório de IA avançada está se consolidando.";
  } else if (overallPercentage < 100) {
    motivationalPhrase = "Reta final! Pouco separa você da preparação completa para o exame CCA-F.";
  } else {
    motivationalPhrase = "Sensacional! Você completou 100% da trilha. Está pronto para conquistar o certificado!";
  }

  // Estatística de escassez no Brasil
  const totalCompleted = completedLessons.length;

  return (
    <div className="bg-card/25 backdrop-blur-sm border border-border rounded-xl p-5 sm:p-6 hover:border-primary/20 transition-all duration-300 flex flex-col gap-4 shadow-md">
      
      {/* Progresso Numérico e Título */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          <h2 className="text-sm sm:text-base font-bold font-sans text-foreground">
            Seu Progresso de Estudos
          </h2>
        </div>
        <span className="font-mono text-lg font-bold text-primary">
          {overallPercentage}%
        </span>
      </div>

      {/* Barra de Progresso Geral */}
      <div className="w-full bg-muted/40 h-3 rounded-full overflow-hidden border border-border/20">
        <div
          className="bg-primary h-full transition-all duration-700 ease-out"
          style={{ width: `${overallPercentage}%` }}
        />
      </div>

      {/* Frase Motivacional */}
      <div className="flex items-start gap-2.5 bg-primary/5 border border-primary/10 rounded-lg p-3 text-xs sm:text-sm text-foreground">
        <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed font-sans">{motivationalPhrase}</p>
      </div>

      {/* Curiosidade/Status Elite (Scarcity) */}
      <div className="flex items-start gap-2.5 bg-muted/20 border border-border/30 rounded-lg p-3 text-[11px] sm:text-xs text-muted-foreground">
        <Award className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        <div className="space-y-1 font-sans">
          <p className="font-bold text-foreground">Apenas ~0,05% dos profissionais de tecnologia no Brasil possuem esta certificação.</p>
          <p className="leading-relaxed">
            A certificação Claude Certified Associate - Foundation é de elite mundial. Você já marcou{" "}
            <span className="text-primary font-bold font-mono">{totalCompleted}</span>{" "}
            {totalCompleted === 1 ? "aula concluída" : "aulas concluídas"}!
          </p>
        </div>
      </div>
    </div>
  );
}
