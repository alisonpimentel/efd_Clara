import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ensureDatabaseSchema, getDb } from "../../db";
import { isAdminSession } from "../../lib/server/admin-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Lista de interessados",
  robots: { index: false, follow: false },
};

type InterestedRow = {
  id: number;
  name: string;
  email: string;
  interest: string;
  communications_consent: boolean;
  access_count: number;
  last_access_at: Date | string;
  created_at: Date | string;
};

const profileLabels: Record<string, string> = {
  empresario: "Empresário(a)",
  contador: "Contador(a)",
  estudante: "Estudante",
  consultor: "Consultor(a)",
  outro: "Outro",
};

async function loadInterestedPeople() {
  await ensureDatabaseSchema();
  const sql = getDb();
  return await sql`
    SELECT id, name, email, interest, communications_consent,
           access_count, last_access_at, created_at
    FROM interested_people
    ORDER BY created_at DESC
  ` as InterestedRow[];
}

export default async function InterestedPage() {
  if (!(await isAdminSession())) redirect("/admin/login");

  const people = await loadInterestedPeople();
  const profiles = people.reduce<Record<string, number>>((totals, person) => {
    totals[person.interest] = (totals[person.interest] ?? 0) + 1;
    return totals;
  }, {});
  const communications = people.filter(
    (person) => person.communications_consent,
  ).length;

  return (
    <main className="admin-page">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">Área administrativa privada</p>
          <h1>Interessados no EFD Clara</h1>
          <p>Cadastros do experimento, visíveis somente para o proprietário autenticado.</p>
        </div>
        <div className="toolbar-actions">
          <a className="secondary-button" href="/api/admin/interested">
            Exportar lista CSV
          </a>
          <Link className="primary-button compact" href="/">
            Voltar ao site
          </Link>
          <form action="/api/admin/logout" method="post">
            <button className="secondary-button" type="submit">
              Sair
            </button>
          </form>
        </div>
      </div>

      <section className="admin-metrics" aria-label="Resumo dos cadastros">
        <article>
          <span>Total de interessados</span>
          <strong>{people.length}</strong>
        </article>
        <article>
          <span>Aceitaram novidades</span>
          <strong>{communications}</strong>
        </article>
        <article>
          <span>Perfis diferentes</span>
          <strong>{Object.keys(profiles).length}</strong>
        </article>
      </section>

      <section className="profile-summary">
        <h2>Distribuição por perfil</h2>
        <div>
          {Object.entries(profiles).map(([profile, count]) => (
            <span key={profile}>
              {profileLabels[profile] ?? profile}: <strong>{count}</strong>
            </span>
          ))}
          {!people.length && <p>Nenhum cadastro foi recebido até o momento.</p>}
        </div>
      </section>

      <section className="admin-table-section">
        <div className="table-scroll" role="region" aria-label="Lista de interessados" tabIndex={0}>
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Perfil</th>
                <th>Novidades</th>
                <th>Acessos</th>
                <th>Último acesso</th>
                <th>Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {people.map((person) => (
                <tr key={person.id}>
                  <td>{person.name}</td>
                  <td>{person.email}</td>
                  <td>{profileLabels[person.interest] ?? person.interest}</td>
                  <td>{person.communications_consent ? "Sim" : "Não"}</td>
                  <td>{person.access_count}</td>
                  <td>{new Date(person.last_access_at).toLocaleString("pt-BR")}</td>
                  <td>{new Date(person.created_at).toLocaleString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
