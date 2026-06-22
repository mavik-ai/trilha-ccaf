import { gerarPlano } from "@/lib/planner";
import { PlanVerdictBanner } from "@/components/plan/plan-verdict";
import { PlanWeekCard } from "@/components/plan/plan-week-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Sparkles } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ProgressProvider } from "@/components/plan/progress-context";
import { PlanProgressPanel } from "@/components/plan/progress-panel";
import { SavePlanCTA } from "@/components/plan/save-cta";
import { getSession } from "@/lib/auth/server";
import { db } from "@/db";
import { progress, profiles, plans } from "@/db/schema";
import { eq } from "drizzle-orm";

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

  // Lê a sessão do usuário no servidor
  const sessionRes = await getSession();
  const sessionData = sessionRes && "data" in sessionRes ? sessionRes.data : null;
  const isLoggedIn = !!sessionData?.user?.id;

  // Parâmetros de entrada e sanitização com fallbacks seguros (serão atualizados se houver plano no banco)
  let hoursWeek = parseInt(params.hoursWeek || "5", 10);
  let includeBase = params.includeBase === "true";
  
  // Trata timezones anexando horário neutro
  const startStr = params.startDate || format(new Date(), "yyyy-MM-dd");
  let startDate = new Date(`${startStr}T12:00:00Z`);
  
  let targetDate = params.targetDate ? new Date(`${params.targetDate}T12:00:00Z`) : null;

  // Carrega o progresso, perfil e plano do banco de dados se o usuário estiver autenticado
  let initialCompletedLessons: string[] = [];
  let userProfile: typeof profiles.$inferSelect | null = null;

  if (isLoggedIn && sessionData?.user?.id) {
    try {
      const [dbProgress, dbProfile, dbPlanList] = await Promise.all([
        db
          .select({ lessonId: progress.lessonId })
          .from(progress)
          .where(eq(progress.userId, sessionData.user.id)),
        db
          .select()
          .from(profiles)
          .where(eq(profiles.id, sessionData.user.id))
          .limit(1),
        db
          .select()
          .from(plans)
          .where(eq(plans.userId, sessionData.user.id))
          .limit(1)
      ]);
      
      initialCompletedLessons = dbProgress.map((p) => p.lessonId);
      userProfile = dbProfile[0] || null;

      const dbPlan = dbPlanList[0];
      if (dbPlan) {
        // Hidrata com dados salvos no banco
        hoursWeek = dbPlan.hoursWeek;
        includeBase = dbPlan.includeBase;
        startDate = dbPlan.startDate;
        targetDate = dbPlan.targetDate;
      } else {
        // Salva de forma "lazy" os dados atuais da URL caso não exista plano
        if (!userProfile) {
          const inserted = await db
            .insert(profiles)
            .values({
              id: sessionData.user.id,
              segment: "Pending",
            })
            .returning();
          userProfile = inserted[0] || null;
        }

        await db.insert(plans).values({
          userId: sessionData.user.id,
          hoursWeek,
          includeBase,
          startDate,
          targetDate,
        });
      }
    } catch (error) {
      console.error("Erro ao buscar/salvar dados do banco para a página do plano:", error);
    }
  }

  // Invoca o motor de planejamento pura
  const plano = gerarPlano({
    hoursWeek,
    includeBase,
    startDate,
    targetDate,
  });

  // Extrai todas as lições do plano gerado para o Provedor de Progresso
  const allPlanLessonIds = plano.weeks.flatMap((w) =>
    w.modules.flatMap((m) => m.lessons.map((l) => l.id))
  );

  const hasMissingProfileLead = isLoggedIn && (!userProfile?.segment || userProfile.segment === "Pending");
  
  // Define permissão admin básica
  const adminEmails = (process.env.ADMIN_EMAILS || "admin@mavik.com.br,contato@mavik.com.br").split(",");
  const isAdmin = isLoggedIn && sessionData?.user?.email && adminEmails.includes(sessionData.user.email);

  return (
    <ProgressProvider
      allPlanLessonIds={allPlanLessonIds}
      isLoggedIn={isLoggedIn}
      initialCompletedLessons={initialCompletedLessons}
    >
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
                <span>Voltar ao Quiz</span>
              </Link>
              <h1 className="text-3xl font-extrabold tracking-tight font-sans text-foreground">
                Seu Cronograma <span className="text-primary">Trilha</span>
              </h1>
              <p className="text-sm text-muted-foreground font-sans">
                Plano de estudos datado e sequencial gerado para a certificação Claude Architect.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {isLoggedIn && (
                <>
                  {isAdmin && (
                    <Link href="/admin">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-border bg-card/25 hover:bg-card/45 hover:border-primary/45 font-sans text-xs cursor-pointer flex items-center gap-1.5 h-9"
                      >
                        <span>Painel Admin</span>
                      </Button>
                    </Link>
                  )}
                  <Link href="/conta/recalcular">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border bg-card/25 hover:bg-card/45 hover:border-primary/45 font-sans text-xs cursor-pointer flex items-center gap-1.5 h-9"
                    >
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span>Recalcular Plano</span>
                    </Button>
                  </Link>
                  <Link href="/conta/perfil">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border bg-card/25 hover:bg-card/45 hover:border-primary/45 font-sans text-xs cursor-pointer flex items-center gap-1.5 h-9"
                    >
                      <span>Meu Perfil</span>
                    </Button>
                  </Link>
                </>
              )}
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

          {/* Banner de Preenchimento Obrigatório de Perfil (Lead Capture) */}
          {hasMissingProfileLead && (
            <div className="bg-primary/10 border border-primary text-foreground rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse print:hidden">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
                <p className="text-xs sm:text-sm font-sans">
                  <strong>Ação necessária:</strong> Selecione seu segmento profissional para garantir a sincronização em nuvem do seu cronograma.
                </p>
              </div>
              <Link href="/conta/perfil">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-background font-sans font-bold whitespace-nowrap cursor-pointer">
                  Completar Perfil
                </Button>
              </Link>
            </div>
          )}

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

          {/* Painel de Progresso Geral */}
          <div className="print:hidden">
            <PlanProgressPanel />
          </div>

          {/* Lista de Cards de Semanas */}
          <div className="flex flex-col gap-5 print:gap-4 print:break-inside-avoid-page">
            {plano.weeks.map((week) => (
              <PlanWeekCard key={week.index} week={week} />
            ))}
          </div>

          {/* Chamada para Ação para Salvar Cronograma */}
          <div className="print:hidden">
            <SavePlanCTA />
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
    </ProgressProvider>
  );
}
