import { db } from "@/db";
import { plans } from "@/db/schema";
import { getSession } from "@/lib/auth/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import RecalculateClient from "./recalculate-client";

export const metadata = {
  title: "Recalcular Plano | Trilha CCA-F",
  description: "Ajuste a sua disponibilidade semanal e datas de estudo.",
};

export default async function RecalculatePage() {
  const sessionRes = await getSession();
  const sessionData = sessionRes && "data" in sessionRes ? sessionRes.data : null;

  if (!sessionData?.user?.id) {
    redirect("/auth/sign-in?callbackUrl=/conta/recalcular");
  }

  const userId = sessionData.user.id;
  const userPlan = await db
    .select()
    .from(plans)
    .where(eq(plans.userId, userId))
    .limit(1);

  const plan = userPlan[0];

  // Valores padrão de fallback caso o plano não exista ainda
  const hoursWeek = plan ? plan.hoursWeek : 5;
  const includeBase = plan ? plan.includeBase : false;
  const startDateStr = plan ? plan.startDate.toISOString() : new Date().toISOString();
  const targetDateStr = plan && plan.targetDate ? plan.targetDate.toISOString() : null;

  return (
    <main className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 relative overflow-hidden font-sans">
      {/* Luz de fundo sutil */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/4 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10">
        <RecalculateClient
          hoursWeek={hoursWeek}
          includeBase={includeBase}
          startDateStr={startDateStr}
          targetDateStr={targetDateStr}
        />
      </div>
    </main>
  );
}
