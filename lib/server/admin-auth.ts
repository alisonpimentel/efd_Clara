import {
  createHmac,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";

const scrypt = promisify(scryptCallback);
const ADMIN_COOKIE = "efd-clara-admin";
const SESSION_DURATION_SECONDS = 8 * 60 * 60;

function requiredSecret(name: "ADMIN_ID_SECRET" | "ADMIN_SESSION_SECRET") {
  const value = process.env[name];
  if (!value || value.length < 32) {
    throw new Error(`${name} deve possuir ao menos 32 caracteres.`);
  }
  return value;
}

export function normalizeCpf(value: string) {
  return value.replace(/\D/g, "");
}

export function isValidCpf(value: string) {
  const cpf = normalizeCpf(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const calculateDigit = (length: number) => {
    let sum = 0;
    for (let index = 0; index < length; index += 1) {
      sum += Number(cpf[index]) * (length + 1 - index);
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return (
    calculateDigit(9) === Number(cpf[9]) &&
    calculateDigit(10) === Number(cpf[10])
  );
}

export function cpfDigest(cpf: string) {
  return createHmac("sha256", requiredSecret("ADMIN_ID_SECRET"))
    .update(normalizeCpf(cpf))
    .digest("hex");
}

export async function createPasswordDigest(password: string) {
  const salt = randomBytes(16).toString("hex");
  const digest = (await scrypt(password, salt, 64)) as Buffer;
  return { salt, digest: digest.toString("hex") };
}

export async function verifyPassword(
  password: string,
  salt: string,
  expectedHex: string,
) {
  const actual = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function signSession(expiresAt: number) {
  return createHmac("sha256", requiredSecret("ADMIN_SESSION_SECRET"))
    .update(String(expiresAt))
    .digest("hex");
}

export async function createAdminSession() {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
  const token = `${expiresAt}.${signSession(expiresAt)}`;
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

export async function isAdminSession() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return false;

  const [expiresText, signature] = token.split(".");
  const expiresAt = Number(expiresText);
  if (!expiresAt || !signature || expiresAt <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  const expected = Buffer.from(signSession(expiresAt), "hex");
  const actual = Buffer.from(signature, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
