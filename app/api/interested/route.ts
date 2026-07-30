import { env } from "cloudflare:workers";

const ALLOWED_INTERESTS = new Set([
  "empresario",
  "contador",
  "estudante",
  "consultor",
  "outro",
]);

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function ensureTable() {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS interested_people (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      interest TEXT NOT NULL,
      privacy_consent INTEGER NOT NULL,
      communications_consent INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
  ).run();
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      name?: string;
      email?: string;
      interest?: string;
      privacyConsent?: boolean;
      communicationsConsent?: boolean;
      website?: string;
    };

    if (payload.website) return Response.json({ ok: true }, { status: 201 });

    const name = payload.name?.trim().slice(0, 100) ?? "";
    const email = normalizeEmail(payload.email ?? "").slice(0, 254);
    const interest = payload.interest?.trim() ?? "";

    if (name.length < 2) {
      return Response.json({ error: "Informe seu nome." }, { status: 400 });
    }
    if (!isEmail(email)) {
      return Response.json({ error: "Informe um e-mail válido." }, { status: 400 });
    }
    if (!ALLOWED_INTERESTS.has(interest)) {
      return Response.json({ error: "Selecione o seu perfil." }, { status: 400 });
    }
    if (!payload.privacyConsent) {
      return Response.json(
        { error: "O aceite de privacidade é necessário para o cadastro." },
        { status: 400 },
      );
    }

    await ensureTable();
    await env.DB.prepare(
      `INSERT INTO interested_people
        (name, email, interest, privacy_consent, communications_consent)
       VALUES (?, ?, ?, 1, ?)
       ON CONFLICT(email) DO UPDATE SET
        name = excluded.name,
        interest = excluded.interest,
        privacy_consent = 1,
        communications_consent = excluded.communications_consent,
        updated_at = CURRENT_TIMESTAMP`,
    )
      .bind(name, email, interest, payload.communicationsConsent ? 1 : 0)
      .run();

    return Response.json({ ok: true }, { status: 201 });
  } catch {
    return Response.json(
      { error: "O cadastro está temporariamente indisponível. Tente novamente." },
      { status: 500 },
    );
  }
}

