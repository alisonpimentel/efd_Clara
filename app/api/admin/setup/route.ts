import { ensureDatabaseSchema, getDb } from "../../../../db";
import {
  cpfDigest,
  createPasswordDigest,
  isValidCpf,
} from "../../../../lib/server/admin-auth";
import { isProjectOwner } from "../../../../lib/server/owner-access";

export async function POST(request: Request) {
  if (!(await isProjectOwner())) {
    return Response.json({ error: "Acesso não autorizado." }, { status: 403 });
  }

  try {
    const payload = (await request.json()) as { cpf?: string; password?: string };
    const cpf = payload.cpf ?? "";
    const password = payload.password ?? "";

    if (!isValidCpf(cpf)) {
      return Response.json({ error: "Informe um CPF válido." }, { status: 400 });
    }
    if (password.length < 12) {
      return Response.json(
        { error: "A senha deve possuir ao menos 12 caracteres." },
        { status: 400 },
      );
    }

    await ensureDatabaseSchema();
    const sql = getDb();
    const existing = await sql`SELECT id FROM admin_credentials LIMIT 1`;
    if (existing.length) {
      return Response.json(
        { error: "A conta administrativa já foi configurada." },
        { status: 409 },
      );
    }

    const passwordData = await createPasswordDigest(password);
    await sql`
      INSERT INTO admin_credentials (id, cpf_hash, password_salt, password_hash)
      VALUES (
        1,
        ${cpfDigest(cpf)},
        ${passwordData.salt},
        ${passwordData.digest}
      )
    `;

    return Response.json({ ok: true }, { status: 201 });
  } catch {
    return Response.json(
      { error: "Não foi possível criar a conta administrativa." },
      { status: 500 },
    );
  }
}
