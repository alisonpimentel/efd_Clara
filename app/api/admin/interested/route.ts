import { env } from "cloudflare:workers";
import { isProjectOwner } from "../../../../lib/server/owner-access";

type InterestedExportRow = {
  name: string;
  email: string;
  interest: string;
  communications_consent: number;
  created_at: string;
};

function csvCell(value: string | number) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

export async function GET() {
  if (!(await isProjectOwner())) {
    return Response.json({ error: "Acesso não autorizado." }, { status: 403 });
  }

  const result = await env.DB.prepare(
    `SELECT name, email, interest, communications_consent, created_at
     FROM interested_people
     ORDER BY created_at DESC`,
  ).all<InterestedExportRow>();
  const rows = [
    ["nome", "email", "perfil", "aceitou_novidades", "data_cadastro"],
    ...result.results.map((person) => [
      person.name,
      person.email,
      person.interest,
      person.communications_consent ? "sim" : "não",
      person.created_at,
    ]),
  ];
  const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(";")).join("\r\n")}`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="efd-clara-interessados.csv"',
      "Cache-Control": "private, no-store",
    },
  });
}

