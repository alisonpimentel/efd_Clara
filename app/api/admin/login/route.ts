import { ensureDatabaseSchema, getDb } from "../../../../db";
import {
  cpfDigest,
  createAdminSession,
  isValidCpf,
  verifyPassword,
} from "../../../../lib/server/admin-auth";

type AdminRow = {
  password_salt: string;
  password_hash: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { cpf?: string; password?: string };
    const cpf = payload.cpf ?? "";
    const password = payload.password ?? "";
    if (!isValidCpf(cpf) || !password) {
      return Response.json({ error: "CPF ou senha inválidos." }, { status: 401 });
    }

    await ensureDatabaseSchema();
    const sql = getDb();
    const rows = (await sql`
      SELECT password_salt, password_hash
      FROM admin_credentials
      WHERE cpf_hash = ${cpfDigest(cpf)}
      LIMIT 1
    `) as AdminRow[];
    const admin = rows[0];
    if (
      !admin ||
      !(await verifyPassword(password, admin.password_salt, admin.password_hash))
    ) {
      return Response.json({ error: "CPF ou senha inválidos." }, { status: 401 });
    }

    await createAdminSession();
    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { error: "O acesso administrativo está temporariamente indisponível." },
      { status: 500 },
    );
  }
}
