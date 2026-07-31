"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { IntegratedTextSource } from "../../lib/integrated/source-pair";
import type { IntegratedAnalysis } from "../../lib/integrated/types";
import { IntegratedDashboard } from "./integrated-dashboard";
import { IntegratedUploadPanel } from "./integrated-upload-panel";
import { RegistrationGate } from "./registration-gate";

type Screen = "welcome" | "upload" | "dashboard";

export function IntegratedEfdApp() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [analysis, setAnalysis] = useState<IntegratedAnalysis | null>(null);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (sessionStorage.getItem("efd-clara-access") === "granted") {
      const timer = window.setTimeout(() => setScreen("upload"), 0);
      return () => window.clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (screen !== "welcome") mainRef.current?.focus();
  }, [screen]);

  function grantAccess() {
    sessionStorage.setItem("efd-clara-access", "granted");
    setScreen("upload");
  }

  async function analyzePair(
    sources: readonly [IntegratedTextSource, IntegratedTextSource],
  ) {
    setError("");
    setProcessing(true);
    await new Promise((resolve) => window.setTimeout(resolve, 40));
    try {
      const [
        { parseIntegratedEfd },
        { validateEfdPair },
        { orderIntegratedTextSources },
        matching,
        { buildIntegratedOperational },
      ] =
        await Promise.all([
          import("../../lib/integrated/parser"),
          import("../../lib/integrated/pair-validation"),
          import("../../lib/integrated/source-pair"),
          import("../../lib/integrated/matching"),
          import("../../lib/integrated/analytics"),
        ]);
      const pair = orderIntegratedTextSources(sources[0], sources[1]);
      const icms = parseIntegratedEfd(pair.icms.text, "efd-icms-ipi");
      const contributions = parseIntegratedEfd(
        pair.contributions.text,
        "efd-contribuicoes",
      );
      const validation = validateEfdPair(icms, contributions);
      if (!validation.ok) throw new Error(validation.error);
      const documentMatches = matching.matchDocuments(
        icms,
        contributions,
        validation.establishmentDocument,
      );
      const itemMatches = matching.matchItems(
        documentMatches,
        icms,
        contributions,
      );
      const operational = buildIntegratedOperational(
        icms,
        validation.establishmentDocument,
      );
      setFileNames([pair.icms.fileName, pair.contributions.fileName]);
      setAnalysis({
        icms,
        contributions,
        pair: validation,
        documentMatches,
        itemMatches,
        operational,
      });
      setScreen("dashboard");
    } catch (cause) {
      setAnalysis(null);
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível integrar as escriturações.",
      );
      setScreen("upload");
    } finally {
      setProcessing(false);
    }
  }

  function reset() {
    setAnalysis(null);
    setFileNames([]);
    setError("");
    setProcessing(false);
    setScreen("upload");
  }

  return (
    <div className="site-shell">
      <a className="skip-link" href="#conteudo-integrado">
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
          <Link className="mode-link" href="/">
            Análise de uma EFD
          </Link>
          <div className="topbar-note">
            <span className="privacy-dot" aria-hidden="true" />
            Os dois arquivos ficam no navegador
          </div>
        </div>
      </header>

      <main id="conteudo-integrado" ref={mainRef} tabIndex={-1}>
        {screen === "welcome" && (
          <RegistrationGate variant="integrated" onRegistered={grantAccess} />
        )}
        {screen === "upload" && (
          <IntegratedUploadPanel
            error={error}
            processing={processing}
            onAnalyze={analyzePair}
            onClearError={() => setError("")}
          />
        )}
        {screen === "dashboard" && analysis && (
          <IntegratedDashboard
            analysis={analysis}
            fileNames={fileNames}
            onReset={reset}
          />
        )}
      </main>

      <footer className="footer">
        <div>
          <strong>EFD Clara</strong>
          <p>Prova de conceito acadêmica de Business Intelligence. Sem IA.</p>
        </div>
        <nav aria-label="Informações legais">
          <Link href="/privacidade">Privacidade e seus direitos</Link>
          <Link href="/metodologia">Metodologia do projeto</Link>
        </nav>
      </footer>
    </div>
  );
}
