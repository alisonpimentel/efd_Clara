import type { DecimalText } from "./types";

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function normalizeCode(value: string) {
  return value.trim().toUpperCase();
}

export function normalizeDocument(value: string) {
  return onlyDigits(value);
}

export function normalizeDocumentKey(value: string) {
  return onlyDigits(value);
}

export function isValidNfeKey(value: string) {
  const key = normalizeDocumentKey(value);
  if (!/^\d{44}$/.test(key)) return false;

  const body = key.slice(0, 43);
  let weight = 2;
  let total = 0;
  for (let index = body.length - 1; index >= 0; index -= 1) {
    total += Number(body[index]) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  const remainder = total % 11;
  const digit = remainder === 0 || remainder === 1 ? 0 : 11 - remainder;
  return digit === Number(key[43]);
}

export function normalizeDate(value: string) {
  const digits = onlyDigits(value);
  if (digits.length !== 8) return "";
  const day = Number(digits.slice(0, 2));
  const month = Number(digits.slice(2, 4));
  const year = Number(digits.slice(4, 8));
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCDate() !== day ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCFullYear() !== year
  ) {
    return "";
  }
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function normalizeDecimal(value: string): DecimalText | null {
  const raw = value.trim();
  if (!raw) return null;

  const normalized = raw.includes(",")
    ? raw.replace(/\./g, "").replace(",", ".")
    : raw;
  if (!/^[+-]?\d+(?:\.\d+)?$/.test(normalized)) return null;

  const negative = normalized.startsWith("-");
  const unsigned = normalized.replace(/^[+-]/, "");
  const [integerRaw, fractionRaw = ""] = unsigned.split(".");
  const integer = integerRaw.replace(/^0+(?=\d)/, "") || "0";
  const fraction = fractionRaw.replace(/0+$/, "");
  const magnitude = fraction ? `${integer}.${fraction}` : integer;
  return negative && magnitude !== "0" ? `-${magnitude}` : magnitude;
}

export function decimalToScaledInteger(
  value: DecimalText,
  scale = 6,
): bigint {
  const negative = value.startsWith("-");
  const unsigned = value.replace(/^[+-]/, "");
  const [integer, fraction = ""] = unsigned.split(".");
  const padded = `${fraction}${"0".repeat(scale)}`.slice(0, scale);
  const result =
    BigInt(integer || "0") * BigInt(10) ** BigInt(scale) +
    BigInt(padded || "0");
  return negative ? -result : result;
}

export function decimalDifferenceWithin(
  left: DecimalText | null,
  right: DecimalText | null,
  tolerance: DecimalText = "0.02",
) {
  if (left === null || right === null) return false;
  const distance = decimalToScaledInteger(left) - decimalToScaledInteger(right);
  const absolute = distance < BigInt(0) ? -distance : distance;
  return absolute <= decimalToScaledInteger(tolerance);
}

export function scaledIntegerToDecimal(value: bigint, scale = 6): DecimalText {
  const negative = value < BigInt(0);
  const absolute = negative ? -value : value;
  const divisor = BigInt(10) ** BigInt(scale);
  const integer = absolute / divisor;
  const fraction = (absolute % divisor)
    .toString()
    .padStart(scale, "0")
    .replace(/0+$/, "");
  const result = fraction ? `${integer}.${fraction}` : integer.toString();
  return negative && result !== "0" ? `-${result}` : result;
}

export function sumDecimals(
  values: Array<DecimalText | null>,
): DecimalText | null {
  const observed = values.filter((value): value is DecimalText => value !== null);
  if (!observed.length) return null;
  return scaledIntegerToDecimal(
    observed.reduce(
      (total, value) => total + decimalToScaledInteger(value),
      BigInt(0),
    ),
  );
}

export function formatDecimalCurrency(value: DecimalText | null) {
  if (value === null) return "Não disponível";
  const scaled = decimalToScaledInteger(value, 2);
  const negative = scaled < BigInt(0);
  const absolute = negative ? -scaled : scaled;
  const integer = (absolute / BigInt(100))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const cents = (absolute % BigInt(100)).toString().padStart(2, "0");
  return `${negative ? "-" : ""}R$ ${integer},${cents}`;
}

export function splitSpedLine(line: string) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|")) return [];
  return trimmed.split("|");
}

export function getField(fields: string[], position: number) {
  return (fields[position] ?? "").trim();
}
