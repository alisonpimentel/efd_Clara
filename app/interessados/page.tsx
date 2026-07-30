import type { Metadata } from "next";
import Link from "next/link";
import { ensureDatabaseSchema, getDb } from "../../db";
import { isProjectOwner } from "../../lib/server/owner-access";

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
    SELECT id, name, email, interest, communications_consent, created_at
    FROM interested_people
    ORDER BY created_at DESC
  ` as InterestedRow[];
}

export default async function InterestedPage() {
  if (!(await isProjectOwner())) {
    return (
      <main className="document-page access-denied">
        <p className="eyebrow">Área administrativa</p>
        <h1>Esta lista é exclusiva do responsável pelo projeto.</h1>
        <p className="document-lead">
          Abra esta página enquanto estiver autenticado na plataforma com o e-mail do
          proprietário do EFD Clara.
        </p>
        <Link className="primary-button" href="/">
          Voltar ao site
        </Link>
      </main>
    );
  }

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
