export type SpedLayoutValidation =
  | { ok: true; kind: "efd-icms-ipi" }
  | {
      ok: false;
      kind: "efd-contribuicoes" | "other-sped" | "unknown";
      error: string;
    };

function field(fields: string[], position: number) {
  return (fields[position] ?? "").trim();
}

function splitSpedLine(line: string) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|")) return [];
  return trimmed.split("|");
}

function isValidSpedDate(value: string) {
  if (!/^\d{8}$/.test(value)) return false;
  const day = Number(value.slice(0, 2));
  const month = Number(value.slice(2, 4));
  const year = Number(value.slice(4, 8));
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function validateSpedLayout(text: string): SpedLayoutValidation {
  const openingLine = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .find((line) => field(splitSpedLine(line), 1).toUpperCase() === "0000");

  if (!openingLine) {
    return {
      ok: false,
      kind: "unknown",
      error:
        "O registro 0000 não foi encontrado. Selecione o TXT original da EFD ICMS/IPI (SPED Fiscal).",
    };
  }

  const fields = splitSpedLine(openingLine);
  const hasIcmsIpiDates =
    isValidSpedDate(field(fields, 4)) && isValidSpedDate(field(fields, 5));
  const hasContributionsDates =
    isValidSpedDate(field(fields, 6)) && isValidSpedDate(field(fields, 7));

  if (hasIcmsIpiDates) {
    return { ok: true, kind: "efd-icms-ipi" };
  }

  if (hasContributionsDates) {
    return {
      ok: false,
      kind: "efd-contribuicoes",
      error:
        "Este arquivo parece ser uma EFD-Contribuições (PIS/Cofins). O EFD Clara analisa somente a EFD ICMS/IPI. Selecione o TXT do SPED Fiscal da mesma empresa e competência.",
    };
  }

  return {
    ok: false,
    kind: "other-sped",
    error:
      "O registro 0000 não segue o leiaute da EFD ICMS/IPI. Arquivos ECD, ECF e EFD-Contribuições não podem ser analisados neste protótipo. Selecione o TXT do SPED Fiscal.",
  };
}

export const spedLayoutValidationInternals = {
  isValidSpedDate,
};
