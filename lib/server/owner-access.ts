import { headers } from "next/headers";

export function hasProjectOwnerCredentials(requestHeaders: Headers) {
  const authorization = requestHeaders.get("authorization");
  if (!authorization?.startsWith("Basic ")) return false;

  const expectedUser = process.env.ADMIN_USER;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedUser || !expectedPassword) return false;

  try {
    const decoded = Buffer.from(authorization.slice(6), "base64").toString("utf8");
    const separator = decoded.indexOf(":");
    if (separator < 0) return false;
    const user = decoded.slice(0, separator);
    const password = decoded.slice(separator + 1);
    return user === expectedUser && password === expectedPassword;
  } catch {
    return false;
  }
}

export async function isProjectOwner() {
  return hasProjectOwnerCredentials(await headers());
}
