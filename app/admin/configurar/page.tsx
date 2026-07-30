import type { Metadata } from "next";
import { AdminAuthForm } from "../admin-auth-form";

export const metadata: Metadata = {
  title: "Configurar acesso administrativo",
  robots: { index: false, follow: false },
};

export default function AdminSetupPage() {
  return (
    <main className="admin-auth-page">
      <section className="registration-card" aria-labelledby="admin-setup-title">
        <p className="eyebrow">Configuração única</p>
        <h1 id="admin-setup-title">Crie seu acesso seguro</h1>
        <p>
          Esta etapa pode ser concluída somente uma vez. O banco guardará um hash do CPF
          e um hash com sal da senha, nunca os valores originais.
        </p>
        <AdminAuthForm mode="setup" />
      </section>
    </main>
  );
}
