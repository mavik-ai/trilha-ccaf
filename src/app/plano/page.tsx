import { gerarPlano } from "@/lib/planner";
import { PlanVerdictBanner } from "@/components/plan/plan-verdict";
import { PlanWeekCard } from "@/components/plan/plan-week-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Sparkles } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PageProps {
  searchParams: Promise<{
    hoursWeek?: string;
    includeBase?: string;
    startDate?: string;
    targetDate?: string;
  }>;
}

export default async function PlanoPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Parâmetros de entrada e sanitização com fallbacks seguros
  const hoursWeek = parseInt(params.hoursWeek || "5", 10);
  const includeBase = params.includeBase === "true";
  
  // Trata timezones anexando horário neutro
  const startStr = params.startDate || format(new Date(), "yyyy-MM-dd");
  const startDate = new Date(`${startStr}T12:00:00Z`);
  
  const targetDate = params.targetDate ? new Date(`${params.targetDate}T12:00:00Z`) : null;

  // Invoca o motor de planejamento pura
  const plano = gerarPlano({
    hoursWeek,
    includeBase,
    startDate,
    targetDate,
  });

  return (
    <main className="min-h-screen bg-background text-foreground py-10 px-4 sm:px-6 relative overflow-hidden font-sans select-none print:py-0 print:px-0">
      
      {/* Luz de fundo sutil (oculto na impressão) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[140px] pointer-events-none print:hidden" />

      <div className="max-w-3xl w-full mx-auto flex flex-col gap-8 z-10 relative print:max-w-none">
        
        {/* Cabeçalho superior (oculto na impressão) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
          <div className="space-y-1.5 text-left">
            <Link
              href="/"
              className="inline-flex items-center text-xs font-mono text-muted-foreground hover:text-primary transition-colors gap-1.5 group cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Ajustar respostas</span>
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight font-sans text-foreground">
              Seu Cronograma <span className="text-primary">Trilha</span>
            </h1>
            <p className="text-sm text-muted-foreground font-sans">
              Plano de estudos datado e sequencial gerado para a certificação Claude Architect.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Botão de Impressão PDF */}
            <Button
              variant="outline"
              size="sm"
              id="btn-export-pdf"
              className="border-border bg-card/25 hover:bg-card/45 hover:border-primary/45 font-sans text-xs cursor-pointer flex items-center gap-1.5 h-9"
            >
              <Printer className="w-4 h-4 text-primary" />
              <span>Exportar PDF</span>
            </Button>
          </div>
        </div>

        {/* Cabeçalho da versão Impressa (visível apenas na impressão) */}
        <div className="hidden print:flex flex-col gap-2 border-b border-border/40 pb-5 mb-5">
          <h1 className="text-2xl font-bold font-sans text-black dark:text-white">
            Trilha CCA-F — Plano de Estudos Claude Certified Architect
          </h1>
          <p className="text-xs font-mono text-zinc-500">
            Gerado em: {format(new Date(), "PPP", { locale: ptBR })} | Disponibilidade: {hoursWeek}h/semana
          </p>
        </div>

        {/* Banner do Veredito da Data-Alvo */}
        <PlanVerdictBanner
          verdict={plano.verdict}
          requiredHoursWeek={plano.requiredHoursWeek}
          hoursWeek={hoursWeek}
        />

        {/* Resumo Rápido */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-card/20 backdrop-blur-sm border border-border/45 rounded-xl p-3.5 flex flex-col gap-1.5 shadow-sm">
            <span className="text-[10px] sm:text-xs text-muted-foreground font-sans uppercase">Semanas de preparação</span>
            <span className="text-lg sm:text-xl font-bold font-mono text-primary">{plano.weeks.length} semanas</span>
          </div>
          <div className="bg-card/20 backdrop-blur-sm border border-border/45 rounded-xl p-3.5 flex flex-col gap-1.5 shadow-sm">
            <span className="text-[10px] sm:text-xs text-muted-foreground font-sans uppercase">Término previsto</span>
            <span className="text-lg sm:text-xl font-bold font-sans text-foreground">
              {format(plano.endDate, "dd/MM/yyyy", { locale: ptBR })}
            </span>
          </div>
          <div className="bg-card/20 backdrop-blur-sm border border-border/45 rounded-xl p-3.5 flex flex-col gap-1.5 shadow-sm col-span-2 sm:col-span-1">
            <span className="text-[10px] sm:text-xs text-muted-foreground font-sans uppercase">Base incluída?</span>
            <span className="text-lg sm:text-xl font-bold font-sans text-foreground">
              {includeBase ? "Sim (Fase 0)" : "Não (Fases 1-4)"}
            </span>
          </div>
        </div>

        {/* Lista de Cards de Semanas */}
        <div className="flex flex-col gap-5 print:gap-4 print:break-inside-avoid-page">
          {plano.weeks.map((week) => (
            <PlanWeekCard key={week.index} week={week} />
          ))}
        </div>

        {/* Rodapé do Plano (oculto na impressão) */}
        <div className="flex flex-col items-center gap-2 mt-6 text-xs text-muted-foreground font-mono print:hidden">
          <div className="inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-primary" />
            <span>MAVIK Trilha CCA-F · Motor Pura V1.0</span>
          </div>
        </div>
      </div>

      {/* Script nativo para possibilitar window.print() em Server Components sem acoplamento client */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            const btn = document.getElementById('btn-export-pdf');
            if (btn) btn.onclick = () => window.print();
          `,
        }}
      />
    </main>
  );
}
