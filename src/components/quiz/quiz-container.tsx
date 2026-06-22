"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarIcon, ArrowLeft, ArrowRight, Clock, BookOpen, Calendar as CalendarIconAlt, Trophy } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Constantes de data declaradas fora do render para manter a pureza idempotente do componente
const DATA_HOJE = new Date();
const DATA_AMANHA = new Date(DATA_HOJE.getTime() + 24 * 60 * 60 * 1000);

interface QuizContainerProps {
  initialHoursWeek?: number;
  initialIncludeBase?: boolean;
  initialStartDate?: Date;
  initialTargetDate?: Date | null;
  onFinish?: (data: {
    hoursWeek: number;
    includeBase: boolean;
    startDate: Date;
    targetDate: Date | null;
  }) => void;
}

export function QuizContainer({
  initialHoursWeek = 5,
  initialIncludeBase = false,
  initialStartDate,
  initialTargetDate,
  onFinish,
}: QuizContainerProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Estados do Quiz inicializados opcionalmente com preferências existentes
  const [hoursWeek, setHoursWeek] = useState<number>(initialHoursWeek);
  const [includeBase, setIncludeBase] = useState<boolean>(initialIncludeBase);
  
  // Trata o tipo de início baseado no valor inicial fornecido
  const [startType, setStartType] = useState<"today" | "tomorrow" | "custom">(() => {
    if (!initialStartDate) return "today";
    
    const todayStr = DATA_HOJE.toISOString().split("T")[0];
    const tomorrowStr = DATA_AMANHA.toISOString().split("T")[0];
    const initialStr = initialStartDate.toISOString().split("T")[0];

    if (initialStr === todayStr) return "today";
    if (initialStr === tomorrowStr) return "tomorrow";
    return "custom";
  });
  
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(
    initialStartDate || new Date()
  );

  // Trata o prazo alvo inicial
  const [targetType, setTargetType] = useState<"none" | "custom">(() => {
    return initialTargetDate ? "custom" : "none";
  });
  const [customTargetDate, setCustomTargetDate] = useState<Date | undefined>(
    initialTargetDate || undefined
  );

  // Erros de validação
  const [dateError, setDateError] = useState<string | null>(null);

  // Calcula a data de início real com base na seleção
  const getStartDate = (): Date => {
    const date = new Date();
    if (startType === "tomorrow") {
      date.setDate(date.getDate() + 1);
    } else if (startType === "custom" && customStartDate) {
      return customStartDate;
    }
    return date;
  };

  const handleNext = () => {
    if (step === 3 && startType === "custom" && !customStartDate) {
      setDateError("Por favor, selecione uma data de início.");
      return;
    }

    if (step === 4) {
      const start = getStartDate();
      if (targetType === "custom" && !customTargetDate) {
        setDateError("Por favor, selecione a data limite do seu exame.");
        return;
      }
      if (targetType === "custom" && customTargetDate && customTargetDate.getTime() <= start.getTime()) {
        setDateError("A data-alvo do exame deve ser posterior à data de início dos estudos.");
        return;
      }
      
      setDateError(null);
      handleFinish();
      return;
    }

    setDateError(null);
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setDateError(null);
    setStep((prev) => prev - 1);
  };

  const handleFinish = () => {
    const start = getStartDate();
    const target = targetType === "custom" && customTargetDate ? customTargetDate : null;

    // Se houver um callback onFinish customizado (como no recálculo), delega para ele
    if (onFinish) {
      onFinish({
        hoursWeek,
        includeBase,
        startDate: start,
        targetDate: target,
      });
      return;
    }

    const params = new URLSearchParams();
    params.set("hoursWeek", hoursWeek.toString());
    params.set("includeBase", includeBase.toString());
    params.set("startDate", start.toISOString().split("T")[0]);
    
    if (target) {
      params.set("targetDate", target.toISOString().split("T")[0]);
    }

    // Navega para a tela do cronograma passando as respostas
    router.push(`/plano?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-card/40 backdrop-blur-md border border-border rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col min-h-[460px]">
      
      {/* Indicador de progresso */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                step >= i ? "w-8 bg-primary" : "w-2 bg-border"
              )}
            />
          ))}
        </div>
        <span className="font-mono text-xs text-muted-foreground">Passo {step} de 4</span>
      </div>

      {/* Conteúdo dinâmico por passo */}
      <div className="flex-1 flex flex-col justify-center">
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="inline-flex p-2 bg-primary/10 rounded-lg text-primary mb-2">
                <Clock className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-sans">
                Qual será a sua dedicação semanal?
              </h2>
              <p className="text-sm text-muted-foreground">
                Informe quantas horas você consegue focar nos estudos a cada semana.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { value: 3, label: "3 horas por semana", desc: "Ritmo leve e equilibrado" },
                { value: 5, label: "5 horas por semana", desc: "Recomendado para consistência" },
                { value: 8, label: "8 horas por semana", desc: "Acelerado para quem tem tempo" },
                { value: 10, label: "10+ horas por semana", desc: "Sprint intensivo de preparação" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setHoursWeek(opt.value)}
                  className={cn(
                    "text-left p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer",
                    hoursWeek === opt.value
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-transparent hover:border-primary/40 text-muted-foreground"
                  )}
                >
                  <div>
                    <p className="font-semibold text-foreground font-sans text-sm sm:text-base">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                  </div>
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                      hoursWeek === opt.value ? "border-primary" : "border-muted-foreground"
                    )}
                  >
                    {hoursWeek === opt.value && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="inline-flex p-2 bg-primary/10 rounded-lg text-primary mb-2">
                <BookOpen className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-sans">
                Qual o seu nível de experiência com o Claude?
              </h2>
              <p className="text-sm text-muted-foreground">
                Se você já domina os fundamentos do Claude, poderá pular a fase introdutória.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                {
                  value: true,
                  label: "Sou iniciante",
                  desc: "Quero incluir os fundamentos do Claude (Claude 101 + AI Fluency) no meu plano.",
                },
                {
                  value: false,
                  label: "Já domino o básico",
                  desc: "Quero pular o básico e ir direto para o desenvolvimento com a Claude API.",
                },
              ].map((opt) => (
                <button
                  key={opt.value.toString()}
                  type="button"
                  onClick={() => setIncludeBase(opt.value)}
                  className={cn(
                    "text-left p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer",
                    includeBase === opt.value
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-transparent hover:border-primary/40 text-muted-foreground"
                  )}
                >
                  <div className="max-w-[90%]">
                    <p className="font-semibold text-foreground font-sans text-sm sm:text-base">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{opt.desc}</p>
                  </div>
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                      includeBase === opt.value ? "border-primary" : "border-muted-foreground"
                    )}
                  >
                    {includeBase === opt.value && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="inline-flex p-2 bg-primary/10 rounded-lg text-primary mb-2">
                <CalendarIconAlt className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-sans">
                Quando você quer começar a estudar?
              </h2>
              <p className="text-sm text-muted-foreground">
                Seu cronograma datado será gerado com base nessa data de início.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { value: "today", label: "Começar hoje", desc: format(DATA_HOJE, "dd 'de' MMMM", { locale: ptBR }) },
                {
                  value: "tomorrow",
                  label: "Começar amanhã",
                  desc: format(DATA_AMANHA, "dd 'de' MMMM", { locale: ptBR }),
                },
                { value: "custom", label: "Escolher outra data", desc: "Defina uma data personalizada" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStartType(opt.value as "today" | "tomorrow" | "custom")}
                  className={cn(
                    "text-left p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer",
                    startType === opt.value
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-transparent hover:border-primary/40 text-muted-foreground"
                  )}
                >
                  <div>
                    <p className="font-semibold text-foreground font-sans text-sm sm:text-base">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                  </div>
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                      startType === opt.value ? "border-primary" : "border-muted-foreground"
                    )}
                  >
                    {startType === opt.value && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                </button>
              ))}

              {/* Date Picker Customizado se selecionado */}
              {startType === "custom" && (
                <div className="pt-2 animate-fadeIn">
                  <Popover>
                    <PopoverTrigger
                      className={cn(
                        "inline-flex items-center justify-start rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full justify-start text-left font-normal border-border bg-card/20 hover:bg-card/45 hover:border-primary/40 cursor-pointer",
                        !customStartDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                      {customStartDate ? (
                        format(customStartDate, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border-border bg-card shadow-2xl" align="start">
                      <Calendar
                        mode="single"
                        selected={customStartDate}
                        onSelect={setCustomStartDate}
                        locale={ptBR}
                        className="bg-card text-foreground"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
            {dateError && <p className="text-xs text-destructive font-semibold font-sans">{dateError}</p>}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="inline-flex p-2 bg-primary/10 rounded-lg text-primary mb-2">
                <Trophy className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-sans">
                Você possui uma data-alvo para o exame?
              </h2>
              <p className="text-sm text-muted-foreground">
                Se você tiver um prazo, o planejador avisará se o ritmo semanal de estudos é viável.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { value: "none", label: "Não tenho prazo definido", desc: "Seguir o plano no meu ritmo ideal" },
                { value: "custom", label: "Tenho uma data limite", desc: "Calcular se o ritmo é viável" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTargetType(opt.value as "none" | "custom")}
                  className={cn(
                    "text-left p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer",
                    targetType === opt.value
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-transparent hover:border-primary/40 text-muted-foreground"
                  )}
                >
                  <div>
                    <p className="font-semibold text-foreground font-sans text-sm sm:text-base">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                  </div>
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                      targetType === opt.value ? "border-primary" : "border-muted-foreground"
                    )}
                  >
                    {targetType === opt.value && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                </button>
              ))}

              {/* Date Picker Customizado de Alvo */}
              {targetType === "custom" && (
                <div className="pt-2 animate-fadeIn">
                  <Popover>
                    <PopoverTrigger
                      className={cn(
                        "inline-flex items-center justify-start rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full justify-start text-left font-normal border-border bg-card/20 hover:bg-card/45 hover:border-primary/40 cursor-pointer",
                        !customTargetDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                      {customTargetDate ? (
                        format(customTargetDate, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione a data do exame</span>
                      )}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border-border bg-card shadow-2xl" align="start">
                      <Calendar
                        mode="single"
                        selected={customTargetDate}
                        onSelect={setCustomTargetDate}
                        locale={ptBR}
                        className="bg-card text-foreground"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
            {dateError && <p className="text-xs text-destructive font-semibold font-sans">{dateError}</p>}
          </div>
        )}
      </div>

      {/* Botões de Ações */}
      <div className="flex items-center justify-between border-t border-border/30 pt-6 mt-8">
        <Button
          variant="ghost"
          type="button"
          onClick={handleBack}
          disabled={step === 1}
          className="text-muted-foreground hover:text-foreground font-sans"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          className="bg-primary text-primary-foreground hover:bg-primary/95 font-semibold font-sans px-5 cursor-pointer"
        >
          {step === 4 ? "Gerar Cronograma" : "Avançar"}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Dica técnica inferior em JetBrains Mono */}
      <div className="absolute bottom-1 right-3 opacity-20 pointer-events-none hidden sm:block">
        <span className="font-mono text-[9px]">ENGINE_V1.0 // MODE_PURE</span>
      </div>
    </div>
  );
}
