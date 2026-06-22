"use client";

import { useEffect, useState } from "react";
import { getLeadsAction, LeadInfo } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, ArrowLeft, Download, Search, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminPage() {
  const [leads, setLeads] = useState<LeadInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("all");

  const loadLeads = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getLeadsAction();
      if (res.error) {
        setError(res.error);
      } else if (res.data) {
        setLeads(res.data);
      }
    } catch (err: unknown) {
      console.error(err);
      setError("Erro interno ao carregar leads.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    async function fetchLeads() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getLeadsAction();
        if (active) {
          if (res.error) {
            setError(res.error);
          } else if (res.data) {
            setLeads(res.data);
          }
        }
      } catch (err: unknown) {
        console.error(err);
        if (active) {
          setError("Erro interno ao carregar leads.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }
    fetchLeads();
    return () => {
      active = false;
    };
  }, []);

  // Calcula a lista de leads filtrados diretamente na renderização (Best Practice)
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      search.trim() === "" ||
      lead.email.toLowerCase().includes(search.toLowerCase()) ||
      (lead.whatsapp && lead.whatsapp.includes(search)) ||
      (lead.instagram && lead.instagram.toLowerCase().includes(search.toLowerCase()));

    const matchesSegment = segmentFilter === "all" || lead.segment === segmentFilter;

    return matchesSearch && matchesSegment;
  });

  // Função para exportar os dados filtrados como CSV
  const handleExportCSV = () => {
    if (filteredLeads.length === 0) return;

    // Cabeçalhos do CSV
    const headers = ["ID", "E-mail", "Segmento", "WhatsApp", "Instagram", "Data Cadastro", "Aulas Concluidas"];
    
    // Mapeia linhas do CSV sanitizando pontuações e delimitadores
    const csvRows = filteredLeads.map((lead) => [
      lead.id,
      lead.email,
      lead.segment,
      lead.whatsapp || "",
      lead.instagram || "",
      lead.createdAt ? format(new Date(lead.createdAt), "yyyy-MM-dd HH:mm:ss") : "",
      lead.completedLessonsCount,
    ]);

    // Junta cabeçalhos e linhas com quebra de linha de forma segura
    const csvContent = [headers.join(","), ...csvRows.map((row) => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    
    // Cria o Blob e faz o download
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `trilha_leads_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Estatísticas rápidas
  const totalLeads = leads.length;
  const devCount = leads.filter((l) => l.segment === "Dev").length;
  const architectCount = leads.filter((l) => l.segment === "Architect").length;
  const whatsappCount = leads.filter((l) => l.whatsapp).length;

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Carregando painel admin...</span>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 font-sans">
        <div className="max-w-md w-full text-center space-y-4 bg-card/25 border border-border p-6 rounded-2xl">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <h2 className="text-lg font-bold">Acesso Negado</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <div className="pt-2 flex flex-col gap-2">
            <Button onClick={loadLeads} className="w-full bg-muted text-foreground hover:bg-muted/80">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
            <Link href="/plano" className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors block">
              Voltar ao Plano
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground py-10 px-4 sm:px-6 relative overflow-hidden font-sans">
      {/* Luz de fundo sutil */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/2 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl w-full mx-auto z-10 relative space-y-8">
        
        {/* Link de retorno */}
        <Link
          href="/plano"
          className="inline-flex items-center text-xs font-mono text-muted-foreground hover:text-primary transition-colors gap-1.5 group cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Voltar ao cronograma</span>
        </Link>

        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-primary uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fase 4 · Leads</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Painel Geral de Leads
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Consulte e exporte os leads capturados na Lazy Registration do Trilha.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleExportCSV}
              disabled={filteredLeads.length === 0}
              className="bg-primary hover:bg-primary/90 text-background font-bold text-xs h-9 rounded-lg flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Exportar CSV ({filteredLeads.length})</span>
            </Button>
          </div>
        </div>

        {/* Painel de Métricas Rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card/25 border border-border/80 rounded-xl p-4 flex flex-col gap-1.5 shadow-sm">
            <span className="text-[10px] sm:text-xs text-muted-foreground font-sans uppercase">Total de Leads</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-primary">{totalLeads}</span>
          </div>
          <div className="bg-card/25 border border-border/80 rounded-xl p-4 flex flex-col gap-1.5 shadow-sm">
            <span className="text-[10px] sm:text-xs text-muted-foreground font-sans uppercase">Desenvolvedores</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-foreground">{devCount} <span className="text-[10px] font-normal text-muted-foreground">({totalLeads > 0 ? Math.round((devCount / totalLeads) * 100) : 0}%)</span></span>
          </div>
          <div className="bg-card/25 border border-border/80 rounded-xl p-4 flex flex-col gap-1.5 shadow-sm">
            <span className="text-[10px] sm:text-xs text-muted-foreground font-sans uppercase">Arquitetos</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-foreground">{architectCount} <span className="text-[10px] font-normal text-muted-foreground">({totalLeads > 0 ? Math.round((architectCount / totalLeads) * 100) : 0}%)</span></span>
          </div>
          <div className="bg-card/25 border border-border/80 rounded-xl p-4 flex flex-col gap-1.5 shadow-sm">
            <span className="text-[10px] sm:text-xs text-muted-foreground font-sans uppercase">Com WhatsApp</span>
            <span className="text-xl sm:text-2xl font-bold font-mono text-foreground">{whatsappCount} <span className="text-[10px] font-normal text-muted-foreground">({totalLeads > 0 ? Math.round((whatsappCount / totalLeads) * 100) : 0}%)</span></span>
          </div>
        </div>

        {/* Área de Filtros e Pesquisa */}
        <div className="bg-card/25 border border-border rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Pesquise por e-mail, whatsapp ou instagram..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-muted/20 border border-border/60 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-primary/50 text-foreground transition-colors placeholder:text-muted-foreground/50"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-muted-foreground font-mono uppercase whitespace-nowrap">Segmento:</span>
            <select
              value={segmentFilter}
              onChange={(e) => setSegmentFilter(e.target.value)}
              className="w-full md:w-44 bg-muted/20 border border-border/60 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary/50 text-foreground transition-colors cursor-pointer"
            >
              <option value="all">Todos os Segmentos</option>
              <option value="Dev">Desenvolvedor(a)</option>
              <option value="Architect">Arquiteto(a) de Soluções</option>
              <option value="Leader">Líder Técnico / Tech Lead</option>
              <option value="Student">Estudante</option>
              <option value="Other">Outro / Curioso</option>
              <option value="Pending">Pendentes</option>
            </select>
          </div>
        </div>

        {/* Tabela de Leads */}
        <div className="bg-card/20 backdrop-blur-sm border border-border rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs font-sans">
              <thead className="bg-muted/15 border-b border-border/80 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-4">E-mail / ID</th>
                  <th className="px-5 py-4">Segmento</th>
                  <th className="px-5 py-4">WhatsApp</th>
                  <th className="px-5 py-4">Instagram</th>
                  <th className="px-5 py-4 text-center">Progresso (Aulas)</th>
                  <th className="px-5 py-4">Data de Cadastro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-foreground/95">
                {filteredLeads.length > 0 ? (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-muted/5 transition-colors">
                      <td className="px-5 py-3.5 space-y-0.5">
                        <div className="font-bold text-sm text-foreground/90">{lead.email}</div>
                        <div className="text-[10px] font-mono text-muted-foreground">{lead.id}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                          lead.segment === "Dev" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                          lead.segment === "Architect" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                          lead.segment === "Leader" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                          lead.segment === "Pending" ? "bg-destructive/10 text-destructive border border-destructive/20" :
                          "bg-muted/30 text-muted-foreground border border-border"
                        }`}>
                          {lead.segment === "Dev" ? "Desenvolvedor" :
                           lead.segment === "Architect" ? "Arquiteto" :
                           lead.segment === "Leader" ? "Tech Lead" :
                           lead.segment === "Student" ? "Estudante" :
                           lead.segment === "Pending" ? "Pendente" : "Outro"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono">
                        {lead.whatsapp ? (
                          <a href={`https://wa.me/${lead.whatsapp}`} target="_blank" className="hover:text-primary transition-colors hover:underline">
                            {lead.whatsapp}
                          </a>
                        ) : (
                          <span className="text-muted-foreground/30">-</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-mono">
                        {lead.instagram ? (
                          <a href={`https://instagram.com/${lead.instagram}`} target="_blank" className="hover:text-primary transition-colors hover:underline">
                            @{lead.instagram}
                          </a>
                        ) : (
                          <span className="text-muted-foreground/30">-</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="inline-flex items-center justify-center gap-1.5">
                          <CheckCircle className={`w-3.5 h-3.5 ${lead.completedLessonsCount > 0 ? "text-primary" : "text-muted-foreground/35"}`} />
                          <span className="font-mono font-bold text-sm">{lead.completedLessonsCount}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground font-mono">
                        {lead.createdAt ? format(new Date(lead.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-muted-foreground/60">
                      Nenhum lead encontrado com os filtros atuais.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}
