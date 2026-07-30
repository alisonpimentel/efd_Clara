"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";

const MAX_FILE_SIZE = 8 * 1024 * 1024;

type UploadPanelProps = {
  onAnalyze: (text: string, fileName: string) => Promise<void>;
  error: string;
};

export function UploadPanel({ onAnalyze, error }: UploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [localError, setLocalError] = useState("");

  async function validateAndRead(file: File) {
    setLocalError("");
    if (file.size > MAX_FILE_SIZE) {
      setLocalError("O arquivo ultrapassa o limite de 8 MB.");
      return;
    }
    if (!file.name.toLowerCase().endsWith(".txt")) {
      setLocalError("Selecione um arquivo TXT da EFD ICMS/IPI.");
      return;
    }

    const text = await file.text();
    if (inputRef.current) inputRef.current.value = "";
    await onAnalyze(text, file.name);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) void validateAndRead(file);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void validateAndRead(file);
  }

  async function loadExample() {
    setLocalError("");
    const response = await fetch("/exemplo-efd.txt");
    const text = await response.text();
    await onAnalyze(text, "exemplo-efd-ficticia.txt");
  }

  return (
    <section className="upload-page" aria-labelledby="upload-title">
      <div className="upload-heading">
        <p className="eyebrow">Nova análise</p>
        <h1 id="upload-title">Vamos traduzir a sua EFD?</h1>
        <p>
          Use um arquivo da EFD ICMS/IPI. O processamento acontece nesta página e o
          conteúdo fiscal não é armazenado.
        </p>
      </div>

      <div
        className={`drop-zone ${dragActive ? "is-dragging" : ""}`}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="file-symbol" aria-hidden="true">
          <span>TXT</span>
        </div>
        <h2>Arraste seu arquivo aqui</h2>
        <p>ou escolha no seu computador</p>
        <input
          ref={inputRef}
          id="sped-file"
          className="visually-hidden"
          type="file"
          accept=".txt,text/plain"
          onChange={handleChange}
        />
        <label className="primary-button file-button" htmlFor="sped-file">
          Escolher arquivo
        </label>
        <small>Somente TXT · máximo de 8 MB · um arquivo por vez</small>
      </div>

      {(localError || error) && (
        <p className="upload-error" role="alert">
          <strong>Não conseguimos continuar.</strong> {localError || error}
        </p>
      )}

      <div className="sample-callout">
        <div>
          <strong>Ainda não quer usar um arquivo real?</strong>
          <p>Experimente o painel com uma EFD pequena e totalmente fictícia.</p>
        </div>
        <button className="secondary-button" type="button" onClick={loadExample}>
          Usar arquivo de demonstração
        </button>
      </div>

      <div className="privacy-explainer" aria-label="Como protegemos o arquivo">
        <div>
          <span className="number-badge">1</span>
          <p>
            <strong>O navegador lê</strong>
            O arquivo não sai do seu dispositivo.
          </p>
        </div>
        <div>
          <span className="number-badge">2</span>
          <p>
            <strong>O SQLite organiza</strong>
            Uma base temporária calcula os indicadores.
          </p>
        </div>
        <div>
          <span className="number-badge">3</span>
          <p>
            <strong>A memória é liberada</strong>
            A base é encerrada após gerar o resumo.
          </p>
        </div>
      </div>
    </section>
  );
}

