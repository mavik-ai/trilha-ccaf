"use client";

import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function SavePlanCTA() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="w-full bg-card/10 border border-border/40 rounded-xl h-24 animate-pulse" />
    );
  }

  const handleSavePlan = () => {
    // Captura a URL completa atual com os parâmetros de estudo (?hoursWeek=5&...)
    const currentUrl = window.location.href;
    const redirectUrl = `/auth/sign-up?callbackUrl=${encodeURIComponent(currentUrl)}`;
    router.push(redirectUrl);
  };

  if (session) {
    return (
      <div className="w-full bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-center gap-3 justify-center text-xs sm:text-sm font-sans text-foreground">
        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
        <span>Seu plano e progresso estão salvos e sincronizados com sua conta <strong>{session.user.email}</strong>.</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-card/25 backdrop-blur-sm border border-border rounded-xl p-5 sm:p-6 hover:border-primary/20 transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-md">
      <div className="space-y-1.5 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-primary uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Fase 3 · Sincronização</span>
        </div>
        <h3 className="text-base sm:text-lg font-bold font-sans text-foreground">
          Salvar seu Cronograma de Estudos
        </h3>
        <p className="text-xs text-muted-foreground font-sans max-w-lg leading-relaxed">
          Crie uma conta gratuita em segundos para salvar seu progresso nas 179 aulas, acessar de qualquer dispositivo e não perder suas datas-alvo.
        </p>
      </div>

      <Button
        onClick={handleSavePlan}
        className="bg-primary hover:bg-primary/95 text-background font-sans font-bold px-6 py-2.5 h-11 rounded-xl cursor-pointer w-full sm:w-auto shadow-md"
      >
        Salvar na minha conta
      </Button>
    </div>
  );
}
