import { PlanVerdict } from "@/lib/types";
import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlanVerdictProps {
  verdict: PlanVerdict;
  requiredHoursWeek?: number;
  hoursWeek: number;
}

export function PlanVerdictBanner({ verdict, requiredHoursWeek, hoursWeek }: PlanVerdictProps) {
  const configs = {
    FOLGADO: {
      bgColor: "bg-emerald-500/5",
      borderColor: "border-emerald-500/20",
      textColor: "text-emerald-400",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />,
      title: "Cronograma Folgado",
      description: "Excelente! Sua dedicação semanal é suficiente para cobrir todos os módulos e revisar o conteúdo com calma antes do exame.",
    },
    "NO LIMITE": {
      bgColor: "bg-amber-500/5",
      borderColor: "border-amber-500/20",
      textColor: "text-amber-400",
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />,
      title: "Cronograma no Limite",
      description: "Atenção: Seu ritmo de estudos está apertado. Para cumprir seu prazo, evite pular semanas e siga a trilha com disciplina.",
    },
    INVIÁVEL: {
      bgColor: "bg-rose-500/5",
      borderColor: "border-rose-500/20",
      textColor: "text-rose-400",
      icon: <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />,
      title: "Prazo Inviável no Ritmo Atual",
      description: `Não será possível cobrir o conteúdo até o exame estudando apenas ${hoursWeek}h/semana. Sugerimos subir para ${requiredHoursWeek || 8}h/semana ou estender sua data-alvo.`,
    },
  };

  const current = configs[verdict];

  return (
    <div
      className={cn(
        "w-full rounded-xl border p-4 flex gap-3 items-start backdrop-blur-sm z-10 transition-all duration-300",
        current.bgColor,
        current.borderColor
      )}
    >
      {current.icon}
      <div className="flex-1 space-y-1">
        <h3 className={cn("font-semibold font-sans text-sm sm:text-base", current.textColor)}>
          {current.title}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-sans">
          {current.description}
        </p>
      </div>
    </div>
  );
}
