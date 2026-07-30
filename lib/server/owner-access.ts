import { env } from "cloudflare:workers";
import { headers } from "next/headers";

export async function isProjectOwner() {
  const requestHeaders = await headers();
  const currentEmail = requestHeaders
    .get("oai-authenticated-user-email")
    ?.trim()
    .toLowerCase();
  const runtimeEnv = env as typeof env & { OWNER_EMAIL?: string };
  const ownerEmail = runtimeEnv.OWNER_EMAIL?.trim().toLowerCase();

  return Boolean(currentEmail && ownerEmail && currentEmail === ownerEmail);
}

