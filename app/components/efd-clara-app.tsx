"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { DashboardData } from "../../lib/sped/types";
import { Dashboard } from "./dashboard";
import { RegistrationGate } from "./registration-gate";
import { UploadPanel } from "./upload-panel";

type Screen = "welcome" | "upload" | "processing" | "dashboard";

export function EfdClaraApp() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (sessionStorage.getItem("efd-clara-access") === "granted") {
      const timer = window.setTimeout(() => setScreen("upload"), 0);
      return () => window.clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (screen !== "welcome") {
      mainRef.current?.focus();
    }
  }, [screen]);

  function grantAccess() {
    sessionStorage.setItem("efd-clara-access", "granted");
    setScreen("upload");
  }

  async function analyzeText(text: string, sourceName: string) {
    setError("");
    setFileName(sourceName);
    setScreen("processing");
    await new Promise((resolve) => window.setTimeout(resolve, 40));

    try {
      const [{ parseSped }, { buildDashboard }] = await Promise.all([
        import("../../lib/sped/parser"),
        import("../../lib/sped/sqlite-analytics"),
      ]);
      const parsed = parseSped(text);
      if (!parsed.recordCounts["0000"]) {
        throw new Error("O arquivo não parece ser uma EFD ICMS/IPI válida: registro 0000 ausente.");
      }
      if (!parsed.recordCounts["C100"]) {
        throw new Error("Nenhum documento C100 foi encontrado para compor o painel.");
      }
      const result = await buildDashboard(parsed);
      setDashboard(result);
      setScreen("dashboard");
    } catch (analysisError) {
      setDashboard(null);
      setError(
        analysisError instanceof Error
          ? analysisError.message
          : "Não foi possível analisar o arquivo.",
      );
      setScreen("upload");
    }
  }

  function resetAnalysis() {
    setDashboard(null);
    setFileName("");
    setError("");
    setScreen("upload");
  }

  return (
    <div className="site-shell">
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <header className="topbar">
        <Link className="brand" href="/" aria-label="EFD Clara, página inicial">
          <span className="brand-mark" aria-hidden="true">
            EC
          </span>
          <span>
            <strong>EFD Clara</strong>
            <small>BI fiscal em linguagem simples</small>
          </span>
        </Link>
        <div className="topbar-links">
          <Link className="mode-link" href="/integrada">
            Análise integrada
          </Link>
          <div className="topbar-note">
            <span className="privacy-dot" aria-hidden="true" />
            Seu arquivo fica no seu navegador
          </div>
        </div>
      </header>

      <main id="conteudo" ref={mainRef} tabIndex={-1}>
        {screen === "welcome" && <RegistrationGate onRegistered={grantAccess} />}
        {screen === "upload" && (
          <UploadPanel onAnalyze={analyzeText} error={error} />
        )}
        {screen === "processing" && (
          <section className="processing-state" aria-live="polite" aria-busy="true">
            <div className="processing-orbit" aria-hidden="true">
              <span />
            </div>
            <p className="eyebrow">Processamento local</p>
            <h1>Organizando sua EFD com segurança...</h1>
            <p>
              Estamos lendo os registros e preparando os indicadores. Nada está sendo
              enviado para o servidor.
            </p>
          </section>
        )}
        {screen === "dashboard" && dashboard && (
          <Dashboard data={dashboard} fileName={fileName} onReset={resetAnalysis} />
        )}
      </main>

      <footer className="footer">
        <div>
          <strong>EFD Clara</strong>
          <p>Protótipo acadêmico de Business Intelligence. Sem IA.</p>
        </div>
        <nav aria-label="Informações legais">
          <Link href="/privacidade">Privacidade e seus direitos</Link>
          <Link href="/metodologia">Metodologia do projeto</Link>
        </nav>
      </footer>
    </div>
  );
}
