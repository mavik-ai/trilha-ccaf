"use client";

import React, { useState, useEffect } from "react";
import { getProfileAction, updateProfileAction } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft, User, Phone, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function PerfilPage() {
  const [segment, setSegment] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");

  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Carrega os dados do perfil ao montar
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await getProfileAction();
        if (res.error) {
          setError(res.error);
        } else if (res.data) {
          setSegment(res.data.segment || "");
          setWhatsapp(res.data.whatsapp || "");
          setInstagram(res.data.instagram || "");
        }
      } catch (err: unknown) {
        console.error(err);
        setError("Erro ao carregar dados do perfil.");
      } finally {
        setIsFetching(false);
      }
    }
    loadProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!segment) {
      setError("Por favor, selecione seu Segmento Profissional.");
      return;
    }

    setIsSaving(true);

    try {
      const res = await updateProfileAction({
        segment,
        whatsapp: whatsapp || null,
        instagram: instagram || null,
      });

      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        // Atualiza os dados locais com a resposta sanitizada da action
        if (whatsapp) {
          setWhatsapp(whatsapp.replace(/\D/g, ""));
        }
        if (instagram && instagram.startsWith("@")) {
          setInstagram(instagram.substring(1));
        }
      }
    } catch (err: unknown) {
      console.error(err);
      setError("Erro interno ao atualizar perfil.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isFetching) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="text-sm font-mono text-muted-foreground uppercase">Carregando perfil...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground py-10 px-4 sm:px-6 relative overflow-hidden font-sans">
      {/* Luz de fundo sutil */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full mx-auto z-10 relative space-y-6">
        
        {/* Link de retorno */}
        <Link
          href="/plano"
          className="inline-flex items-center text-xs font-mono text-muted-foreground hover:text-primary transition-colors gap-1.5 group cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Voltar ao cronograma</span>
        </Link>

        {/* Card do Perfil */}
        <div className="bg-card/20 backdrop-blur-sm border border-border rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-primary uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sua Conta</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Configurações de Perfil
            </h1>
            <p className="text-xs text-muted-foreground">
              Preencha seu segmento obrigatório e contatos para receber conteúdos personalizados e atualizações.
            </p>
          </div>

          {/* Mensagens de feedback */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/25 text-destructive rounded-lg p-3 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-primary/10 border border-primary/20 text-primary rounded-lg p-3 text-xs sm:text-sm flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Perfil salvo com sucesso! Seus dados foram sincronizados na nuvem.</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-5">
            {/* Campo Segmento */}
            <div className="space-y-1.5">
              <label htmlFor="segment" className="text-xs font-mono text-muted-foreground uppercase flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                <span>Segmento Profissional *</span>
              </label>
              <select
                id="segment"
                required
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className="w-full bg-muted/20 border border-border/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-foreground transition-colors cursor-pointer"
                disabled={isSaving}
              >
                <option value="" disabled className="bg-background text-muted-foreground">Selecione seu segmento...</option>
                <option value="Dev" className="bg-background text-foreground">Desenvolvedor(a)</option>
                <option value="Architect" className="bg-background text-foreground">Arquiteto(a) de Soluções</option>
                <option value="Leader" className="bg-background text-foreground">Líder Técnico / Tech Lead</option>
                <option value="Student" className="bg-background text-foreground">Estudante</option>
                <option value="Other" className="bg-background text-foreground">Outro / Curioso</option>
              </select>
            </div>

            {/* Campo WhatsApp */}
            <div className="space-y-1.5">
              <label htmlFor="whatsapp" className="text-xs font-mono text-muted-foreground uppercase flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                <span>WhatsApp (Opcional)</span>
              </label>
              <input
                id="whatsapp"
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="11999999999"
                className="w-full bg-muted/20 border border-border/80 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-foreground transition-colors placeholder:text-muted-foreground/45"
                disabled={isSaving}
              />
              <span className="text-[10px] text-muted-foreground font-mono">DDD + Número (apenas dígitos).</span>
            </div>

            {/* Campo Instagram */}
            <div className="space-y-1.5">
              <label htmlFor="instagram" className="text-xs font-mono text-muted-foreground uppercase flex items-center gap-1">
                {/* SVG Nativo do Instagram para evitar problemas de dependência do lucide */}
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
                <span>Instagram (Opcional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-mono select-none">@</span>
                <input
                  id="instagram"
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="seu.usuario"
                  className="w-full bg-muted/20 border border-border/80 rounded-xl pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 text-foreground transition-colors placeholder:text-muted-foreground/45"
                  disabled={isSaving}
                />
              </div>
            </div>

            {/* Botão Salvar */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/95 text-background font-sans font-bold h-10 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isSaving ? "Salvando..." : "Salvar Alterações"}</span>
            </Button>
          </form>

        </div>
      </div>
    </main>
  );
}
