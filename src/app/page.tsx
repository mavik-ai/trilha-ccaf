"use client";

import { useState } from "react";
import { QuizContainer } from "@/components/quiz/quiz-container";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const [showQuiz, setShowQuiz] = useState(false);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-foreground relative overflow-hidden font-sans select-none py-12">
      {/* Luz de fundo sutil */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-2xl w-full text-center flex flex-col items-center z-10 gap-8 transition-all duration-300">
        {/* Badge superior */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs text-muted-foreground font-mono">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>Fase 2 · Produto Público</span>
        </div>

        {/* Título Principal */}
        <div className="flex flex-col gap-4">
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-none text-foreground font-sans">
            Trilha <span className="text-primary">CCA-F</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto font-sans leading-relaxed">
            Seu planejador de estudos pessoal e datado para a certificação oficial 
            <span className="text-foreground font-semibold"> Claude Certified Architect (Associate)</span> da Anthropic.
          </p>
          
          {/* Estatística de Impacto & Motivação */}
          <div className="mt-2 text-xs sm:text-sm text-primary/95 font-mono tracking-wide max-w-md mx-auto flex flex-col gap-1.5 border border-primary/20 bg-primary/5 rounded-lg px-4 py-3">
            <p>🇧🇷 Menos de 0.1% dos profissionais de tecnologia no Brasil possuem esta credencial.</p>
            <p className="text-muted-foreground italic font-sans text-xs">
              {"\"Seja um dos pioneiros. O mercado recompensa quem constrói o futuro primeiro.\""}
            </p>
          </div>
        </div>

        {/* Exibição condicional da Landing ou do Quiz */}
        {!showQuiz ? (
          <div className="flex flex-col items-center gap-8 w-full max-w-md transition-all duration-300">
            {/* CTA principal */}
            <Button
              onClick={() => setShowQuiz(true)}
              size="lg"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/95 font-bold font-sans text-base py-6 rounded-xl shadow-lg hover:shadow-primary/10 transition-all group cursor-pointer"
            >
              Montar meu plano
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            {/* Simulador de Terminal MAVIK */}
            <div className="w-full bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 text-left font-mono text-sm shadow-2xl">
              <div className="flex gap-1.5 mb-4 border-b border-border/40 pb-3">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-primary/60" />
              </div>
              <div className="space-y-2 text-xs">
                <p className="text-muted-foreground">$ npm run dev</p>
                <p className="text-primary/90">&gt; trilha-ccaf@1.0.0 dev</p>
                <p className="text-foreground">&gt; next dev</p>
                <p className="text-emerald-400/90">✓ Ready in 1.2s</p>
                <p className="text-muted-foreground mt-4">{"// Status do motor de planejamento"}</p>
                <p className="text-foreground">
                  [<span className="text-primary">engine</span>] pronto para gerar cronogramas semanais
                </p>
                <p className="text-foreground">
                  [<span className="text-primary">dataset</span>] carregado com 179 aulas (25h totais)
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full transition-all duration-300">
            <QuizContainer />
          </div>
        )}

        {/* Rodapé / Créditos */}
        <div className="flex flex-col gap-2 mt-4 text-xs text-muted-foreground font-mono">
          <p>MAVIK © {new Date().getFullYear()}</p>
        </div>
      </div>
    </main>
  );
}
