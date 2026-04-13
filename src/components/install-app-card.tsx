"use client";

import type { MouseEvent } from "react";
import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

type InstallAppCardProps = {
  compact?: boolean;
};

function isStandaloneMode() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    ("standalone" in window.navigator &&
      Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

function isIosDevice() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function InstallAppCard({ compact = false }: InstallAppCardProps) {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isPrompting, setIsPrompting] = useState(false);

  useEffect(() => {
    setIsStandalone(isStandaloneMode());

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    }

    function handleInstalled() {
      setIsInstalled(true);
      setInstallPrompt(null);
      setIsStandalone(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function handleInstallClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    if (!installPrompt) {
      return;
    }

    setIsPrompting(true);

    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;

      if (choice.outcome === "accepted") {
        setIsInstalled(true);
        setInstallPrompt(null);
      }
    } finally {
      setIsPrompting(false);
    }
  }

  if (isStandalone || isInstalled) {
    return (
      <div className="rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm leading-7 text-emerald-50/90">
        O FotoCal ja esta rodando como app neste aparelho.
      </div>
    );
  }

  const canPromptInstall = Boolean(installPrompt);
  const iosInstructions = isIosDevice() && !canPromptInstall;

  return (
    <div
      className={`rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.34)] ${
        compact ? "" : "sm:p-6"
      }`}
    >
      <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-emerald-300">
        Instalar app
      </p>
      <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
        Abra o FotoCal como se fosse um aplicativo.
      </h3>
      <p className="mt-3 text-sm leading-7 text-white/65">
        Isso deixa o acesso mais rapido, ocupa tela inteira e combina melhor com
        a rotina de foto no celular.
      </p>

      <div className="mt-5 flex flex-col gap-3">
        {canPromptInstall ? (
          <button
            type="button"
            onClick={(event) => void handleInstallClick(event)}
            disabled={isPrompting}
            className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPrompting ? "Abrindo instalacao..." : "Instalar FotoCal"}
          </button>
        ) : null}

        {iosInstructions ? (
          <div className="rounded-[1.25rem] border border-white/10 bg-black/30 px-4 py-3 text-sm leading-7 text-white/72">
            No iPhone, toque em compartilhar no Safari e depois em{" "}
            <strong className="text-white">Adicionar a Tela de Inicio</strong>.
          </div>
        ) : null}

        {!canPromptInstall && !iosInstructions ? (
          <div className="rounded-[1.25rem] border border-white/10 bg-black/30 px-4 py-3 text-sm leading-7 text-white/72">
            No navegador, procure a opcao de instalar app na barra de endereco
            ou no menu principal.
          </div>
        ) : null}
      </div>
    </div>
  );
}
