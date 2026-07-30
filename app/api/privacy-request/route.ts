import { ensureDatabaseSchema, getDb } from "../../../db";

const REQUEST_TYPES = new Set(["access", "correction", "deletion", "revoke"]);

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      email?: string;
      requestType?: string;
      website?: string;
    };
    if (payload.website) return Response.json({ ok: true }, { status: 201 });

    const email = payload.email?.trim().toLowerCase().slice(0, 254) ?? "";
    const requestType = payload.requestType?.trim() ?? "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Informe um e-mail válido." }, { status: 400 });
    }
    if (!REQUEST_TYPES.has(requestType)) {
      return Response.json({ error: "Selecione uma solicitação válida." }, { status: 400 });
    }

    const sql = getDb();
    await ensureDatabaseSchema();
    await sql`
      INSERT INTO privacy_requests (email, request_type)
      VALUES (${email}, ${requestType})
    `;
    return Response.json({ ok: true }, { status: 201 });
  } catch {
    return Response.json(
      { error: "Não foi possível registrar a solicitação. Tente novamente." },
      { status: 500 },
    );
  }
}
