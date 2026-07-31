import type {
  Establishment,
  IntegratedParseResult,
  PairValidation,
} from "./types";

function findContributionsEstablishment(
  contributions: IntegratedParseResult,
  document: string,
): Establishment | undefined {
  return contributions.establishments.find(
    (establishment) => establishment.document === document,
  );
}

export function validateEfdPair(
  first: IntegratedParseResult,
  second: IntegratedParseResult,
): PairValidation {
  const icms =
    first.kind === "efd-icms-ipi"
      ? first
      : second.kind === "efd-icms-ipi"
        ? second
        : null;
  const contributions =
    first.kind === "efd-contribuicoes"
      ? first
      : second.kind === "efd-contribuicoes"
        ? second
        : null;

  if (!icms || !contributions) {
    return {
      ok: false,
      code: "WRONG_FILE_PAIR",
      error: "Selecione uma EFD ICMS/IPI e uma EFD-Contribuições.",
    };
  }

  if (
    icms.identity.periodStart !== contributions.identity.periodStart ||
    icms.identity.periodEnd !== contributions.identity.periodEnd
  ) {
    return {
      ok: false,
      code: "PERIOD_MISMATCH",
      error:
        "As escriturações possuem competências diferentes e não podem ser conciliadas.",
    };
  }

  const establishmentDocument = icms.identity.companyDocument;
  const establishment = findContributionsEstablishment(
    contributions,
    establishmentDocument,
  );
  if (!establishment) {
    return {
      ok: false,
      code: "ESTABLISHMENT_NOT_DECLARED",
      error:
        "O estabelecimento completo da EFD ICMS/IPI não foi localizado nos registros 0140 da EFD-Contribuições.",
    };
  }

  const hasContext = contributions.documents.some(
    (document) => document.establishmentDocument === establishmentDocument,
  );
  if (!hasContext && !establishment.bookkeepingIndicator) {
    return {
      ok: false,
      code: "ESTABLISHMENT_WITHOUT_C010",
      error:
        "O estabelecimento foi declarado no 0140, mas não possui contexto C010 na EFD-Contribuições.",
    };
  }

  return {
    ok: true,
    periodStart: icms.identity.periodStart,
    periodEnd: icms.identity.periodEnd,
    establishmentDocument,
    contributionsEstablishment: establishment,
  };
}

