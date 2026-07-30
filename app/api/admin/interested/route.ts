import { ensureDatabaseSchema, getDb } from "../../../../db";
import { isProjectOwner } from "../../../../lib/server/owner-access";

type InterestedExportRow = {
  name: string;
  email: string;
  interest: string;
  communications_consent: boolean;
  created_at: Date | string;
};

function csvCell(value: string | number) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

export async function GET() {
  if (!(await isProjectOwner())) {
    return Response.json({ error: "Acesso não autorizado." }, { status: 403 });
  }

  await ensureDatabaseSchema();
  const sql = getDb();
  const result = await sql`
    SELECT name, email, interest, communications_consent, created_at
    FROM interested_people
    ORDER BY created_at DESC
  ` as InterestedExportRow[];
  const rows = [
    ["nome", "email", "perfil", "aceitou_novidades", "data_cadastro"],
    ...result.map((person) => [
      person.name,
      person.email,
      person.interest,
      person.communications_consent ? "sim" : "não",
      new Date(person.created_at).toISOString(),
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
