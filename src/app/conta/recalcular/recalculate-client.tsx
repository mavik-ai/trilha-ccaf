"use client";

import { useState } from "react";
import { QuizContainer } from "@/components/quiz/quiz-container";
import { savePlanAction } from "@/app/actions/plan";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface RecalculateClientProps {
  hoursWeek: number;
  includeBase: boolean;
  startDateStr: string;
  targetDateStr: string | null;
}

export default function RecalculateClient({
  hoursWeek,
  includeBase,
  startDateStr,
  targetDateStr,
}: RecalculateClientProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRecalculate = async (data: {
    hoursWeek: number;
    includeBase: boolean;
    startDate: Date;
    targetDate: Date | null;
  }) => {
    setIsSaving(true);
    setError(null);

    try {
      const res = await savePlanAction({
        hoursWeek: data.hoursWeek,
        includeBase: data.includeBase,
        startDate: data.startDate.toISOString(),
        targetDate: data.targetDate ? data.targetDate.toISOString() : null,
      });

      if (res?.error) {
        setError(res.error);
        setIsSaving(false);
      } else {
        // Redireciona de volta para a visualização do plano que lerá os dados salvos do Neon
        router.push("/plano");
        router.refresh();
      }
    } catch (err: unknown) {
      console.error(err);
      setError("Erro interno ao atualizar cronograma no banco de dados.");
      setIsSaving(false);
    }
  };

  if (isSaving) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Recalculando seu cronograma...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-lg mx-auto">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-primary uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Fase 4 · Ajustes</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Recalcular seu Plano
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Altere sua cota de horas ou prazos. Suas aulas já concluídas serão mantidas intactas na nova distribuição de datas.
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/25 text-destructive rounded-xl p-3 text-sm text-center">
          {error}
        </div>
      )}

      <QuizContainer
        initialHoursWeek={hoursWeek}
        initialIncludeBase={includeBase}
        initialStartDate={new Date(startDateStr)}
        initialTargetDate={targetDateStr ? new Date(targetDateStr) : null}
        onFinish={handleRecalculate}
      />

      <div className="text-center pt-2">
        <Link
          href="/plano"
          className="inline-flex items-center text-xs font-mono text-muted-foreground hover:text-primary transition-colors gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Cancelar e voltar ao plano</span>
        </Link>
      </div>
    </div>
  );
}
