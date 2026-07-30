import { ensureDatabaseSchema, getDb } from "../../../db";
import { validateRegistration } from "../../../lib/server/registration";

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

    const validation = validateRegistration(payload);
    if (!validation.ok) {
      return Response.json({ error: validation.error }, { status: 400 });
    }

    const sql = getDb();
    await ensureDatabaseSchema();
    await sql`
      INSERT INTO interested_people
        (name, email, interest, privacy_consent, communications_consent)
      VALUES (
        ${validation.data.name},
        ${validation.data.email},
        ${validation.data.interest},
        TRUE,
        ${validation.data.communicationsConsent}
      )
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        interest = EXCLUDED.interest,
        privacy_consent = TRUE,
        communications_consent = EXCLUDED.communications_consent,
        access_count = interested_people.access_count + 1,
        last_access_at = NOW(),
        updated_at = NOW()
    `;

    return Response.json({ ok: true }, { status: 201 });
  } catch {
    return Response.json(
      { error: "O cadastro está temporariamente indisponível. Tente novamente." },
      { status: 500 },
    );
  }
}
