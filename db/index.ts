import { neon } from "@neondatabase/serverless";

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("A variável DATABASE_URL não está configurada.");
  }

  return neon(databaseUrl);
}

export async function ensureDatabaseSchema() {
  const sql = getDb();

  await sql`
    CREATE TABLE IF NOT EXISTS interested_people (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      interest TEXT NOT NULL,
      privacy_consent BOOLEAN NOT NULL,
      communications_consent BOOLEAN NOT NULL DEFAULT FALSE,
      access_count INTEGER NOT NULL DEFAULT 1,
      last_access_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    ALTER TABLE interested_people
    ADD COLUMN IF NOT EXISTS access_count INTEGER NOT NULL DEFAULT 1
  `;
  await sql`
    ALTER TABLE interested_people
    ADD COLUMN IF NOT EXISTS last_access_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS privacy_requests (
      id BIGSERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      request_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS admin_credentials (
      id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      cpf_hash TEXT NOT NULL UNIQUE,
      password_salt TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}
