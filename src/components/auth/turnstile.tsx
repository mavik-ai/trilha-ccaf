"use client";

import { useEffect, useRef } from "react";

interface TurnstileProps {
  onVerify: (token: string) => void;
}

interface ExtendedWindow extends Window {
  onloadTurnstileCallback?: () => void;
  turnstile?: {
    render: (
      container: HTMLElement,
      options: {
        sitekey: string;
        theme?: "light" | "dark" | "auto";
        callback: (token: string) => void;
      }
    ) => void;
  };
}

export function Turnstile({ onVerify }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"; // Chave de testes pública padrão da Cloudflare

  useEffect(() => {
    const extWindow = window as unknown as ExtendedWindow;

    // Injeta o script se não existir
    if (!document.getElementById("cloudflare-turnstile-script")) {
      const script = document.createElement("script");
      script.id = "cloudflare-turnstile-script";
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    // Configura o callback global chamado pelo script do Turnstile ao carregar
    extWindow.onloadTurnstileCallback = () => {
      if (extWindow.turnstile && containerRef.current) {
        extWindow.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: "dark",
          callback: (token: string) => {
            onVerify(token);
          },
        });
      }
    };

    // Caso o script já tenha sido carregado anteriormente por outra navegação
    if (extWindow.turnstile && containerRef.current) {
      try {
        extWindow.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: "dark",
          callback: (token: string) => {
            onVerify(token);
          },
        });
      } catch (e) {
        // Evita erros de renderização duplicada se já estiver renderizado
        console.debug("Turnstile render error (likely already rendered):", e);
      }
    }
  }, [onVerify, siteKey]);

  return (
    <div className="w-full flex justify-center py-2 select-none">
      <div ref={containerRef} className="cf-turnstile" />
    </div>
  );
}
