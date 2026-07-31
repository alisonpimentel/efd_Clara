"use client";

import {
  ChangeEvent,
  DragEvent,
  useId,
  useRef,
  useState,
} from "react";
import {
  efdKindLabel,
  type IntegratedTextSource,
} from "../../lib/integrated/source-pair";
import type { EfdKind } from "../../lib/integrated/types";
import { validateSpedSelection } from "../../lib/sped/file-validation";
import { decodeSpedBuffer } from "../../lib/sped/text-decoder";

type DetectedFile = {
  file: File;
  kind: EfdKind;
};

type Props = {
  error: string;
  processing: boolean;
  onAnalyze: (
    sources: readonly [IntegratedTextSource, IntegratedTextSource],
  ) => Promise<void>;
  onClearError: () => void;
};

type SlotProps = {
  slot: "A" | "B";
  title: string;
  description: string;
  selected: DetectedFile | null;
  onFile: (file: File) => Promise<void>;
};

function FileSlot({
  slot,
  title,
  description,
  selected,
  onFile,
}: SlotProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  function acceptFiles(files: FileList) {
    if (files.length === 1) void onFile(files[0]);
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
      className={`integrated-file-slot ${dragActive ? "is-dragging" : ""} ${selected ? "has-file" : ""}`}
      onDragEnter={() => setDragActive(true)}
      onDragLeave={() => setDragActive(false)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <span className="source-pill">Arquivo {slot}</span>
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
        {selected ? "Trocar arquivo" : "Escolher arquivo"}
      </label>
      {selected ? (
        <p className="selected-file" aria-live="polite">
          <strong className="detected-file-type">
            Reconhecido: {efdKindLabel(selected.kind)}
          </strong>
          <span>{selected.file.name}</span>
          <small>{(selected.file.size / 1024 / 1024).toFixed(2)} MB</small>
        </p>
      ) : (
        <small>TXT de até 8 MB</small>
      )}
    </div>
  );
}

export function IntegratedUploadPanel({
  error,
  processing,
  onAnalyze,
  onClearError,
}: Props) {
  const [firstFile, setFirstFile] = useState<DetectedFile | null>(null);
  const [secondFile, setSecondFile] = useState<DetectedFile | null>(null);
  const [localError, setLocalError] = useState("");

  async function setValidatedFile(slot: "first" | "second", file: File) {
    setLocalError("");
    onClearError();
    const result = validateSpedSelection([file]);
    if (!result.ok) {
      setLocalError(result.error);
      return;
    }
    try {
      const buffer = await file.arrayBuffer();
      const [{ detectEfdKind }] = await Promise.all([
        import("../../lib/integrated/parser"),
      ]);
      const detected: DetectedFile = {
        file,
        kind: detectEfdKind(decodeSpedBuffer(buffer).text),
      };
      const other = slot === "first" ? secondFile : firstFile;
      if (slot === "first") setFirstFile(detected);
      else setSecondFile(detected);
      if (other?.kind === detected.kind) {
        setLocalError(
          `Os dois arquivos foram reconhecidos como ${efdKindLabel(detected.kind)}. Troque um deles pela outra escrituração.`,
        );
      }
    } catch (cause) {
      setLocalError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível identificar o tipo do arquivo.",
      );
    }
  }

  async function analyze() {
    setLocalError("");
    onClearError();
    if (!firstFile || !secondFile) {
      setLocalError("Selecione os dois arquivos antes de iniciar.");
      return;
    }
    if (firstFile.kind === secondFile.kind) {
      setLocalError(
        `Os dois arquivos foram reconhecidos como ${efdKindLabel(firstFile.kind)}. Troque um deles pela outra escrituração.`,
      );
      return;
    }
    const [firstBuffer, secondBuffer] = await Promise.all([
      firstFile.file.arrayBuffer(),
      secondFile.file.arrayBuffer(),
    ]);
    await onAnalyze([
      {
        text: decodeSpedBuffer(firstBuffer).text,
        fileName: firstFile.file.name,
      },
      {
        text: decodeSpedBuffer(secondBuffer).text,
        fileName: secondFile.file.name,
      },
    ]);
  }

  async function loadExample() {
    setLocalError("");
    onClearError();
    const [icmsResponse, contributionsResponse] = await Promise.all([
      fetch("/exemplo-efd.txt"),
      fetch("/exemplo-efd-contribuicoes.txt"),
    ]);
    await onAnalyze([
      {
        text: await icmsResponse.text(),
        fileName: "exemplo-efd-icms-ipi.txt",
      },
      {
        text: await contributionsResponse.text(),
        fileName: "exemplo-efd-contribuicoes.txt",
      },
    ]);
  }

  const filesReady =
    firstFile !== null &&
    secondFile !== null &&
    firstFile.kind !== secondFile.kind;

  return (
    <section className="upload-page integrated-upload" aria-labelledby="integrated-title">
      <div className="upload-heading">
        <p className="eyebrow">Análise integrada · prova de conceito</p>
        <h1 id="integrated-title">Duas escriturações, uma visão coerente.</h1>
        <p>
          Selecione uma EFD ICMS/IPI e uma EFD-Contribuições da mesma
          competência. A ordem não importa: identificamos cada tipo antes de
          validar o estabelecimento e conciliar documentos e itens.
        </p>
      </div>

      <div className="integrated-file-grid">
        <FileSlot
          slot="A"
          title="Primeiro arquivo"
          description="Pode ser a EFD ICMS/IPI ou a EFD-Contribuições. O tipo será reconhecido automaticamente."
          selected={firstFile}
          onFile={(file) => setValidatedFile("first", file)}
        />
        <FileSlot
          slot="B"
          title="Segundo arquivo"
          description="Selecione a outra escrituração da mesma competência, em qualquer ordem."
          selected={secondFile}
          onFile={(file) => setValidatedFile("second", file)}
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
          disabled={!filesReady || processing}
          onClick={() => void analyze()}
        >
          {processing ? "Validando no navegador..." : "Validar e cruzar os arquivos"}
        </button>
        <button
          className="secondary-button"
          type="button"
          disabled={processing}
          onClick={() => void loadExample()}
        >
          Usar demonstração fictícia
        </button>
      </div>

      {processing && (
        <p className="integrated-processing-note" role="status" aria-live="polite">
          Lendo e validando os dois arquivos localmente. Nenhuma linha fiscal
          está sendo enviada ao servidor.
        </p>
      )}

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
