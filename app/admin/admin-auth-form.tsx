"use client";

import { FormEvent, useState } from "react";

export function AdminAuthForm({ mode }: { mode: "login" | "setup" }) {
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch(
        mode === "login" ? "/api/admin/login" : "/api/admin/setup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cpf: String(form.get("cpf") ?? ""),
            password: String(form.get("password") ?? ""),
          }),
        },
      );
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível concluir.");
      }
      window.location.assign(mode === "login" ? "/interessados" : "/admin/login");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Não foi possível concluir.");
    }
  }

  return (
    <form onSubmit={submit} className="admin-auth-form">
      <div className="field">
        <label htmlFor="admin-cpf">CPF</label>
        <input
          id="admin-cpf"
          name="cpf"
          inputMode="numeric"
          autoComplete="username"
          placeholder="Somente números"
          required
          minLength={11}
          maxLength={14}
        />
      </div>
      <div className="field">
        <label htmlFor="admin-password">Senha</label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={12}
        />
        {mode === "setup" && <small>Use ao menos 12 caracteres.</small>}
      </div>
      {status === "error" && (
        <p className="form-error" role="alert">
          {message}
        </p>
      )}
      <button className="primary-button" type="submit" disabled={status === "sending"}>
        {status === "sending"
          ? "Verificando..."
          : mode === "login"
            ? "Entrar no relatório"
            : "Criar acesso seguro"}
      </button>
    </form>
  );
}
