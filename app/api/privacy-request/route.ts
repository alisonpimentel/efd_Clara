import { env } from "cloudflare:workers";

const REQUEST_TYPES = new Set(["access", "correction", "deletion", "revoke"]);

async function ensureTable() {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS privacy_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      request_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
  ).run();
}

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

    await ensureTable();
    await env.DB.prepare(
      "INSERT INTO privacy_requests (email, request_type) VALUES (?, ?)",
    )
      .bind(email, requestType)
      .run();
    return Response.json({ ok: true }, { status: 201 });
  } catch {
    return Response.json(
      { error: "Não foi possível registrar a solicitação. Tente novamente." },
      { status: 500 },
    );
  }
}

