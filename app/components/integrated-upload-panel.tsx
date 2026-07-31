"use client";

import {
  ChangeEvent,
  DragEvent,
  useId,
  useRef,
  useState,
} from "react";
import { validateSpedSelection } from "../../lib/sped/file-validation";
import { decodeSpedBuffer } from "../../lib/sped/text-decoder";

export type IntegratedTextPair = {
  icms: { text: string; fileName: string };
  contributions: { text: string; fileName: string };
};

type Props = {
  error: string;
  onAnalyze: (pair: IntegratedTextPair) => Promise<void>;
};

type SlotProps = {
  kind: "icms" | "contributions";
  title: string;
  description: string;
  file: File | null;
  onFile: (file: File) => void;
};

function FileSlot({
  kind,
  title,
  description,
  file,
  onFile,
}: SlotProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  function acceptFiles(files: FileList) {
    if (files.length === 1) onFile(files[0]);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) acceptFiles(event.target.files);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    acceptFiles(event.dataTransfer.files);
  }

  return (
    <div
      className={`integrated-file-slot ${dragActive ? "is-dragging" : ""} ${file ? "has-file" : ""}`}
      onDragEnter={() => setDragActive(true)}
      onDragLeave={() => setDragActive(false)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <span className="source-pill">
        {kind === "icms" ? "Arquivo 1" : "Arquivo 2"}
      </span>
      <div className="mini-file-symbol" aria-hidden="true">
        TXT
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
      <input
        ref={inputRef}
        className="visually-hidden"
        id={inputId}
        type="file"
        accept=".txt,text/plain"
        onChange={handleChange}
      />
      <label className="secondary-button" htmlFor={inputId}>
        {file ? "Trocar arquivo" : "Escolher arquivo"}
      </label>
      {file ? (
        <p className="selected-file" aria-live="polite">
          <strong>Selecionado</strong>
          <span>{file.name}</span>
          <small>{(file.size / 1024 / 1024).toFixed(2)} MB</small>
        </p>
      ) : (
        <small>TXT de até 8 MB</small>
      )}
    </div>
  );
}

export function IntegratedUploadPanel({ error, onAnalyze }: Props) {
  const [icmsFile, setIcmsFile] = useState<File | null>(null);
  const [contributionsFile, setContributionsFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState("");

  function setValidatedFile(kind: "icms" | "contributions", file: File) {
    setLocalError("");
    const result = validateSpedSelection([file]);
    if (!result.ok) {
      setLocalError(
        `${kind === "icms" ? "EFD ICMS/IPI" : "EFD-Contribuições"}: ${result.error}`,
      );
      return;
    }
    if (kind === "icms") setIcmsFile(file);
    else setContributionsFile(file);
  }

  async function analyze() {
    setLocalError("");
    if (!icmsFile || !contributionsFile) {
      setLocalError("Selecione os dois arquivos antes de iniciar.");
      return;
    }
    const [icmsBuffer, contributionsBuffer] = await Promise.all([
      icmsFile.arrayBuffer(),
      contributionsFile.arrayBuffer(),
    ]);
    await onAnalyze({
      icms: {
        text: decodeSpedBuffer(icmsBuffer).text,
        fileName: icmsFile.name,
      },
      contributions: {
        text: decodeSpedBuffer(contributionsBuffer).text,
        fileName: contributionsFile.name,
      },
    });
  }

  async function loadExample() {
    setLocalError("");
    const [icmsResponse, contributionsResponse] = await Promise.all([
      fetch("/exemplo-efd.txt"),
      fetch("/exemplo-efd-contribuicoes.txt"),
    ]);
    await onAnalyze({
      icms: {
        text: await icmsResponse.text(),
        fileName: "exemplo-efd-icms-ipi.txt",
      },
      contributions: {
        text: await contributionsResponse.text(),
        fileName: "exemplo-efd-contribuicoes.txt",
      },
    });
  }

  return (
    <section className="upload-page integrated-upload" aria-labelledby="integrated-title">
      <div className="upload-heading">
        <p className="eyebrow">Análise integrada · prova de conceito</p>
        <h1 id="integrated-title">Duas escriturações, uma visão coerente.</h1>
        <p>
          Selecione a EFD ICMS/IPI e a EFD-Contribuições da mesma competência.
          Primeiro validamos o estabelecimento; depois conciliamos documentos e itens.
        </p>
      </div>

      <div className="integrated-file-grid">
        <FileSlot
          kind="icms"
          title="EFD ICMS/IPI"
          description="Fonte operacional de compras, vendas, ICMS, IPI e inventário."
          file={icmsFile}
          onFile={(file) => setValidatedFile("icms", file)}
        />
        <FileSlot
          kind="contributions"
          title="EFD-Contribuições"
          description="Fonte complementar para PIS, Cofins e conciliação documental."
          file={contributionsFile}
          onFile={(file) => setValidatedFile("contributions", file)}
        />
      </div>

      {(localError || error) && (
        <p className="upload-error" role="alert">
          <strong>Não conseguimos continuar.</strong> {localError || error}
        </p>
      )}

      <div className="integrated-upload-actions">
        <button
          className="primary-button"
          type="button"
          disabled={!icmsFile || !contributionsFile}
          onClick={() => void analyze()}
        >
          Validar e cruzar os arquivos
        </button>
        <button className="secondary-button" type="button" onClick={() => void loadExample()}>
          Usar demonstração fictícia
        </button>
      </div>

      <div className="privacy-explainer" aria-label="Como a análise protege os arquivos">
        <div>
          <span className="number-badge">1</span>
          <p>
            <strong>Validação exata</strong>
            Competência e CNPJ completo do estabelecimento precisam coincidir.
          </p>
        </div>
        <div>
          <span className="number-badge">2</span>
          <p>
            <strong>Processamento local</strong>
            Nenhum conteúdo fiscal é enviado à Vercel ou ao banco.
          </p>
        </div>
        <div>
          <span className="number-badge">3</span>
          <p>
            <strong>Verdade antes do gráfico</strong>
            Ausência, parcialidade e ambiguidade nunca são mostradas como zero.
          </p>
        </div>
      </div>
    </section>
  );
}

