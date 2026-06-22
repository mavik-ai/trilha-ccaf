"use client";

import React, { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Sparkles, Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: signInError } = await authClient.signIn.magicLink({
        email,
        callbackURL: callbackUrl,
      });

      if (signInError) {
        setError(signInError.message || "Erro ao enviar link. Tente novamente.");
      } else {
        setSuccess(true);
      }
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "Algo deu errado. Verifique suas credenciais.";
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: callbackUrl,
      });
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "Erro ao iniciar autenticação com o Google.";
      setError(errMsg);
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center py-12 px-4 sm:px-6 relative overflow-hidden font-sans">
      {/* Luz de fundo sutil */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/4 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full z-10 space-y-8 bg-card/20 backdrop-blur-sm border border-border rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-mono text-primary hover:text-primary/80 transition-colors uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Trilha CCA-F</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Entrar na sua conta
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Acompanhe seu progresso de estudos e salve seus cronogramas de forma vitalícia.
          </p>
        </div>

        {/* Mensagens de Sucesso e Erro */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/25 text-destructive rounded-lg p-3 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-primary/10 border border-primary/20 text-primary rounded-lg p-3 text-xs sm:text-sm flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Enviamos um link mágico de acesso para o seu e-mail! Verifique sua caixa de entrada.</span>
          </div>
        )}

        <form onSubmit={handleMagicLinkLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-mono text-muted-foreground uppercase">
              Endereço de E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@exemplo.com"
                className="w-full bg-muted/20 border border-border/80 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-foreground transition-colors placeholder:text-muted-foreground/50"
                disabled={isLoading}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/95 text-background font-sans font-bold h-10 rounded-xl transition-all cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? "Enviando..." : "Entrar com Link Mágico"}
          </Button>
        </form>

        <div className="relative flex items-center justify-center py-2">
          <div className="border-t border-border/30 w-full" />
          <span className="bg-background px-3 text-[10px] sm:text-xs text-muted-foreground font-mono uppercase absolute">
            Ou
          </span>
        </div>

        {/* Login Social (Google) */}
        <Button
          type="button"
          onClick={handleGoogleLogin}
          variant="outline"
          className="w-full border-border bg-card/10 hover:bg-card/20 text-foreground hover:border-primary/30 font-sans h-10 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
          disabled={isLoading}
        >
          {/* Ícone simples do Google */}
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
          </svg>
          <span>Entrar com o Google</span>
        </Button>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Ainda não tem conta?{" "}
            <Link href="/auth/sign-up" className="text-primary hover:underline font-bold">
              Cadastre-se gratuitamente
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
