"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

type RegistrationGateProps = {
  onRegistered: () => void;
};

export function RegistrationGate({ onRegistered }: RegistrationGateProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");
    const form = new FormData(event.currentTarget);

    const payload = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      interest: String(form.get("interest") ?? ""),
      privacyConsent: form.get("privacyConsent") === "on",
      communicationsConsent: form.get("communicationsConsent") === "on",
      website: String(form.get("website") ?? ""),
    };

    try {
      const response = await fetch("/api/interested", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Não foi possível concluir o cadastro.");
      onRegistered();
    } catch (submitError) {
      setStatus("error");
      setMessage(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível concluir o cadastro.",
      );
    }
  }

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Protótipo acadêmico · acesso gratuito</p>
          <h1>Seu arquivo fiscal, finalmente em linguagem de negócio.</h1>
          <p className="hero-lead">
            Transforme uma EFD ICMS/IPI em uma leitura visual de compras, saídas,
            clientes, fornecedores e produtos — sem instalar nada e sem enviar o
            arquivo para a internet.
          </p>
          <div className="trust-row" aria-label="Características do produto">
            <span>1 arquivo por análise</span>
            <span>Até 8 MB</span>
            <span>Processamento local</span>
          </div>
        </div>

        <aside className="registration-card" aria-labelledby="access-title">
          <div className="step-label">Acesso ao experimento</div>
          <h2 id="access-title">Conheça seus dados em poucos minutos</h2>
          <p>
            Cadastre-se para usar gratuitamente e nos ajudar a medir o interesse neste
            projeto acadêmico, incluindo a recorrência de acesso.
          </p>
          <form onSubmit={submit} noValidate>
            <div className="field">
              <label htmlFor="name">Seu nome</label>
              <input id="name" name="name" autoComplete="name" required minLength={2} />
            </div>
            <div className="field">
              <label htmlFor="email">Seu melhor e-mail</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="interest">Qual é o seu perfil?</label>
              <select id="interest" name="interest" required defaultValue="">
                <option value="" disabled>
                  Selecione uma opção
                </option>
                <option value="empresario">Empresário(a)</option>
                <option value="contador">Contador(a)</option>
                <option value="estudante">Estudante</option>
                <option value="consultor">Consultor(a)</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <div className="honeypot" aria-hidden="true">
              <label htmlFor="website">Não preencha este campo</label>
              <input id="website" name="website" tabIndex={-1} autoComplete="off" />
            </div>
            <label className="check-row">
              <input type="checkbox" name="privacyConsent" required />
              <span>
                Concordo com o uso de nome, e-mail e perfil para acesso e avaliação de
                interesse no projeto. <Link href="/privacidade">Saiba mais</Link>.
              </span>
            </label>
            <label className="check-row optional">
              <input type="checkbox" name="communicationsConsent" />
              <span>Quero receber novidades do projeto por e-mail (opcional).</span>
            </label>
            {status === "error" && (
              <p className="form-error" role="alert">
                {message}
              </p>
            )}
            <button className="primary-button" type="submit" disabled={status === "sending"}>
              {status === "sending" ? "Liberando acesso..." : "Acessar o painel gratuito"}
            </button>
          </form>
          <p className="microcopy">
            O SPED não faz parte do cadastro e nunca será enviado aos nossos servidores.
          </p>
        </aside>
      </section>

      <section className="how-it-works" aria-labelledby="how-title">
        <div>
          <p className="eyebrow">Como funciona</p>
          <h2 id="how-title">Da obrigação fiscal à visão gerencial</h2>
        </div>
        <ol className="steps">
          <li>
            <span>01</span>
            <div>
              <strong>Escolha a EFD</strong>
              <p>Um arquivo TXT da EFD ICMS/IPI, com até 8 MB.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <strong>Analise localmente</strong>
              <p>O navegador organiza os registros em uma base temporária.</p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <strong>Entenda e exporte</strong>
              <p>Veja os indicadores e salve um resumo em CSV ou PDF.</p>
            </div>
          </li>
        </ol>
      </section>
    </>
  );
}
