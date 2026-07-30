import type { Metadata } from "next";
import Link from "next/link";
import { AdminAuthForm } from "../admin-auth-form";

export const metadata: Metadata = {
  title: "Acesso administrativo",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="admin-auth-page">
      <section className="registration-card" aria-labelledby="admin-login-title">
        <p className="eyebrow">Área privada</p>
        <h1 id="admin-login-title">Relatório de acessos</h1>
        <p>
          Entre com o CPF e a senha cadastrados pelo responsável pelo projeto.
        </p>
        <AdminAuthForm mode="login" />
        <p className="microcopy">
          O CPF não é armazenado em texto e a senha não pode ser recuperada.
        </p>
        <Link href="/">Voltar ao EFD Clara</Link>
      </section>
    </main>
  );
}
