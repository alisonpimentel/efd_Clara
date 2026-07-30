"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function PrivacyPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/privacy-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          requestType: form.get("requestType"),
          website: form.get("website"),
        }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(body.error || "Não foi possível enviar.");
      setStatus("success");
      setMessage("Solicitação registrada. Ela será conferida pelo responsável pelo projeto.");
      event.currentTarget.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Não foi possível enviar.");
    }
  }

  return (
    <main className="document-page">
      <Link className="back-link" href="/">
        ← Voltar ao EFD Clara
      </Link>
      <p className="eyebrow">Privacidade desde a concepção</p>
      <h1>A EFD não é enviada. Seus dados de cadastro são limitados ao necessário.</h1>
      <p className="document-lead">
        Esta página explica, em linguagem direta, o tratamento realizado pelo protótipo
        acadêmico EFD Clara.
      </p>

      <section>
        <h2>1. O que é coletado</h2>
        <p>
          No cadastro de acesso, coletamos nome, e-mail, perfil de interesse, registro do
          aceite de privacidade e, quando você escolher, autorização para receber
          comunicações do projeto.
        </p>
      </section>
      <section>
        <h2>2. O que não é coletado</h2>
        <p>
          O conteúdo da EFD ICMS/IPI selecionada não é transmitido ao servidor. O arquivo
          é lido no navegador, transformado em uma base SQLite temporária em memória e
          liberado após a geração dos indicadores. Não há histórico fiscal na nuvem.
        </p>
      </section>
      <section>
        <h2>3. Finalidades</h2>
        <ul>
          <li>liberar o acesso ao experimento acadêmico;</li>
          <li>medir o interesse de diferentes perfis na proposta;</li>
          <li>enviar novidades somente quando houver aceite específico;</li>
          <li>registrar e atender solicitações relacionadas à privacidade.</li>
        </ul>
      </section>
      <section>
        <h2>4. Compartilhamento e retenção</h2>
        <p>
          Os cadastros não são exibidos publicamente nem utilizados para decisões
          automatizadas. Os dados permanecem na infraestrutura de hospedagem do projeto
          durante a avaliação acadêmica e poderão ser anonimizados ou eliminados quando
          deixarem de ser necessários.
        </p>
      </section>
      <section>
        <h2>5. Seus direitos</h2>
        <p>
          Você pode solicitar acesso, correção, eliminação ou revogação do consentimento.
          Use o formulário abaixo com o mesmo e-mail informado no cadastro.
        </p>
      </section>

      <section className="rights-form">
        <h2>Registrar uma solicitação</h2>
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="rights-email">E-mail usado no cadastro</label>
            <input id="rights-email" name="email" type="email" required />
          </div>
          <div className="field">
            <label htmlFor="request-type">Tipo de solicitação</label>
            <select id="request-type" name="requestType" defaultValue="" required>
              <option value="" disabled>
                Selecione
              </option>
              <option value="access">Acessar meus dados</option>
              <option value="correction">Corrigir meus dados</option>
              <option value="deletion">Excluir meus dados</option>
              <option value="revoke">Revogar meu consentimento</option>
            </select>
          </div>
          <div className="honeypot" aria-hidden="true">
            <label htmlFor="rights-website">Não preencha</label>
            <input id="rights-website" name="website" tabIndex={-1} />
          </div>
          <button className="primary-button" type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Registrando..." : "Registrar solicitação"}
          </button>
          {message && (
            <p className={status === "error" ? "form-error" : "form-success"} role="status">
              {message}
            </p>
          )}
        </form>
      </section>

      <p className="legal-note">
        Versão acadêmica de 30/07/2026. Este aviso documenta o desenho do protótipo e não
        substitui avaliação jurídica antes de eventual exploração comercial.
      </p>
    </main>
  );
}
