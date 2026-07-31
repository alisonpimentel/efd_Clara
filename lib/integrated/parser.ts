import {
  getField,
  isValidNfeKey,
  normalizeCode,
  normalizeDate,
  normalizeDecimal,
  normalizeDocument,
  normalizeDocumentKey,
  splitSpedLine,
} from "./normalization";
import type {
  ContributionAssessment,
  EfdIdentity,
  EfdKind,
  Establishment,
  IntegratedParseResult,
  IntegratedInventory,
  IntegratedParticipant,
  IntegratedProduct,
  SourceDocument,
  SourceItem,
  SourceSummary,
} from "./types";

const CANCELLED_STATUSES = new Set(["02", "03"]);

export function detectEfdKind(text: string): EfdKind {
  const opening = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map(splitSpedLine)
    .find((fields) => getField(fields, 1).toUpperCase() === "0000");

  if (!opening) {
    throw new Error("O registro 0000 não foi encontrado.");
  }

  const icmsStart = normalizeDate(getField(opening, 4));
  const icmsEnd = normalizeDate(getField(opening, 5));
  const contributionsStart = normalizeDate(getField(opening, 6));
  const contributionsEnd = normalizeDate(getField(opening, 7));

  if (icmsStart && icmsEnd) return "efd-icms-ipi";
  if (contributionsStart && contributionsEnd) return "efd-contribuicoes";
  throw new Error("O registro 0000 não corresponde aos leiautes suportados.");
}

function initialIdentity(kind: EfdKind): EfdIdentity {
  return {
    kind,
    layoutVersion: "",
    companyName: "",
    companyDocument: "",
    state: "",
    municipalityCode: "",
    periodStart: "",
    periodEnd: "",
  };
}

function parseIdentity(fields: string[], kind: EfdKind): EfdIdentity {
  if (kind === "efd-icms-ipi") {
    return {
      kind,
      layoutVersion: getField(fields, 2),
      companyName: getField(fields, 6),
      companyDocument: normalizeDocument(getField(fields, 7) || getField(fields, 8)),
      state: normalizeCode(getField(fields, 9)),
      municipalityCode: normalizeCode(getField(fields, 11)),
      periodStart: normalizeDate(getField(fields, 4)),
      periodEnd: normalizeDate(getField(fields, 5)),
    };
  }

  return {
    kind,
    layoutVersion: getField(fields, 2),
    companyName: getField(fields, 8),
    companyDocument: normalizeDocument(getField(fields, 9)),
    state: normalizeCode(getField(fields, 10)),
    municipalityCode: normalizeCode(getField(fields, 11)),
    periodStart: normalizeDate(getField(fields, 6)),
    periodEnd: normalizeDate(getField(fields, 7)),
  };
}

function parseParticipant(fields: string[]): IntegratedParticipant {
  return {
    code: normalizeCode(getField(fields, 2)),
    name: getField(fields, 3),
    document: normalizeDocument(getField(fields, 5) || getField(fields, 6)),
    state: normalizeCode(getField(fields, 8)),
  };
}

function parseProduct(fields: string[]): IntegratedProduct {
  return {
    code: normalizeCode(getField(fields, 2)),
    description: getField(fields, 3),
    unit: normalizeCode(getField(fields, 6)),
    ncm: normalizeCode(getField(fields, 8)),
  };
}

function parseDocument(
  fields: string[],
  kind: EfdKind,
  lineNumber: number,
  establishmentDocument: string,
  participants: Map<string, IntegratedParticipant>,
): SourceDocument {
  const hasSubseries = kind === "efd-contribuicoes";
  const numberPosition = hasSubseries ? 9 : 8;
  const keyPosition = hasSubseries ? 10 : 9;
  const issueDatePosition = hasSubseries ? 11 : 10;
  const movementDatePosition = hasSubseries ? 12 : 11;
  const totalPosition = hasSubseries ? 13 : 12;
  const merchandisePosition = hasSubseries ? 17 : 16;
  const icmsPosition = hasSubseries ? 23 : 22;
  const ipiPosition = hasSubseries ? 26 : 25;
  const participantCode = normalizeCode(getField(fields, 4));
  const key = normalizeDocumentKey(getField(fields, keyPosition));
  const operationField = getField(fields, 2);
  const issuerField = getField(fields, 3);

  return {
    sourceId: `${kind}:${lineNumber}`,
    source: kind,
    lineNumber,
    establishmentDocument,
    operation:
      operationField === "0" ? "entry" : operationField === "1" ? "exit" : null,
    issuer:
      issuerField === "0" ? "own" : issuerField === "1" ? "third-party" : null,
    participantCode,
    participantDocument: participants.get(participantCode)?.document ?? "",
    model: normalizeCode(getField(fields, 5)),
    status: normalizeCode(getField(fields, 6)),
    series: normalizeCode(getField(fields, 7)),
    subseries: hasSubseries ? normalizeCode(getField(fields, 8)) : "",
    number: normalizeCode(getField(fields, numberPosition)),
    documentKey: key,
    documentKeyValid: isValidNfeKey(key),
    issueDate: normalizeDate(getField(fields, issueDatePosition)),
    movementDate: normalizeDate(getField(fields, movementDatePosition)),
    total: normalizeDecimal(getField(fields, totalPosition)),
    merchandiseTotal: normalizeDecimal(getField(fields, merchandisePosition)),
    icms: normalizeDecimal(getField(fields, icmsPosition)),
    ipi: normalizeDecimal(getField(fields, ipiPosition)),
    pis:
      kind === "efd-contribuicoes"
        ? normalizeDecimal(getField(fields, 28))
        : null,
    cofins:
      kind === "efd-contribuicoes"
        ? normalizeDecimal(getField(fields, 29))
        : null,
    cancelled: CANCELLED_STATUSES.has(getField(fields, 6)),
  };
}

function parseItem(
  fields: string[],
  kind: EfdKind,
  lineNumber: number,
  document: SourceDocument,
  products: Map<string, IntegratedProduct>,
): SourceItem {
  const productCode = normalizeCode(getField(fields, 3));
  const product = products.get(productCode);
  return {
    sourceId: `${kind}:${lineNumber}`,
    source: kind,
    lineNumber,
    documentSourceId: document.sourceId,
    establishmentDocument: document.establishmentDocument,
    itemNumber: normalizeCode(getField(fields, 2)),
    productCode,
    description: getField(fields, 4) || product?.description || "",
    ncm: product?.ncm ?? "",
    quantity: normalizeDecimal(getField(fields, 5)),
    unit: normalizeCode(getField(fields, 6) || product?.unit || ""),
    value: normalizeDecimal(getField(fields, 7)),
    cfop: normalizeCode(getField(fields, 11)),
    icmsCst: normalizeCode(getField(fields, 10)),
    icmsBase: normalizeDecimal(getField(fields, 13)),
    icmsRate: normalizeDecimal(getField(fields, 14)),
    icms: normalizeDecimal(getField(fields, 15)),
    ipiCst: normalizeCode(getField(fields, 20)),
    ipiBase: normalizeDecimal(getField(fields, 22)),
    ipiRate: normalizeDecimal(getField(fields, 23)),
    ipi: normalizeDecimal(getField(fields, 24)),
    pisCst: normalizeCode(getField(fields, 25)),
    pisBase: normalizeDecimal(getField(fields, 26)),
    pisRate: normalizeDecimal(getField(fields, 27)),
    pis: normalizeDecimal(getField(fields, 30)),
    cofinsCst: normalizeCode(getField(fields, 31)),
    cofinsBase: normalizeDecimal(getField(fields, 32)),
    cofinsRate: normalizeDecimal(getField(fields, 33)),
    cofins: normalizeDecimal(getField(fields, 36)),
  };
}

function parseSummary(
  fields: string[],
  lineNumber: number,
  document: SourceDocument,
): SourceSummary {
  return {
    sourceId: `efd-icms-ipi:${lineNumber}`,
    documentSourceId: document.sourceId,
    lineNumber,
    icmsCst: normalizeCode(getField(fields, 2)),
    cfop: normalizeCode(getField(fields, 3)),
    icmsRate: normalizeDecimal(getField(fields, 4)),
    operationValue: normalizeDecimal(getField(fields, 5)),
    icmsBase: normalizeDecimal(getField(fields, 6)),
    icms: normalizeDecimal(getField(fields, 7)),
    ipi: normalizeDecimal(getField(fields, 11)),
  };
}

function parseContributionAssessment(
  fields: string[],
  register: "M100" | "M200" | "M500" | "M600",
  lineNumber: number,
): ContributionAssessment {
  const credit = register === "M100" || register === "M500";
  const contribution = register === "M100" || register === "M200" ? "PIS" : "COFINS";
  if (credit) {
    return {
      register,
      lineNumber,
      contribution,
      nature: "credit",
      code: normalizeCode(getField(fields, 2)),
      base: normalizeDecimal(getField(fields, 4)),
      rate: normalizeDecimal(getField(fields, 5)),
      calculated: normalizeDecimal(getField(fields, 8)),
      availableCredit: normalizeDecimal(getField(fields, 12)),
      payable: null,
    };
  }
  return {
    register,
    lineNumber,
    contribution,
    nature: "debit",
    code: "",
    base: null,
    rate: null,
    calculated: normalizeDecimal(getField(fields, 2)),
    availableCredit: null,
    payable: normalizeDecimal(getField(fields, 13)),
  };
}

export function parseIntegratedEfd(
  text: string,
  expectedKind?: EfdKind,
): IntegratedParseResult {
  const kind = detectEfdKind(text);
  if (expectedKind && kind !== expectedKind) {
    throw new Error(
      expectedKind === "efd-icms-ipi"
        ? "O arquivo selecionado não é uma EFD ICMS/IPI."
        : "O arquivo selecionado não é uma EFD-Contribuições.",
    );
  }

  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  const participants = new Map<string, IntegratedParticipant>();
  const products = new Map<string, IntegratedProduct>();
  const establishments = new Map<string, Establishment>();
  const documents: SourceDocument[] = [];
  const items: SourceItem[] = [];
  const summaries: SourceSummary[] = [];
  const contributionAssessments: ContributionAssessment[] = [];
  const recordCounts: Record<string, number> = {};
  const warnings: string[] = [];
  let identity = initialIdentity(kind);
  let currentEstablishmentDocument = "";
  let currentDocument: SourceDocument | null = null;
  let currentInventory: IntegratedInventory | null = null;
  const inventories: IntegratedInventory[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = index + 1;
    const fields = splitSpedLine(lines[index]);
    const register = normalizeCode(getField(fields, 1));
    if (!register) continue;
    recordCounts[register] = (recordCounts[register] ?? 0) + 1;

    if (register === "0000") {
      identity = parseIdentity(fields, kind);
      if (kind === "efd-icms-ipi") {
        currentEstablishmentDocument = identity.companyDocument;
        establishments.set(identity.companyDocument, {
          code: "0000",
          name: identity.companyName,
          document: identity.companyDocument,
          state: identity.state,
          stateRegistration: normalizeCode(getField(fields, 10)),
          municipalityCode: identity.municipalityCode,
          bookkeepingIndicator: "",
        });
      }
      continue;
    }

    if (register === "0140" && kind === "efd-contribuicoes") {
      const establishment: Establishment = {
        code: normalizeCode(getField(fields, 2)),
        name: getField(fields, 3),
        document: normalizeDocument(getField(fields, 4)),
        state: normalizeCode(getField(fields, 5)),
        stateRegistration: normalizeCode(getField(fields, 6)),
        municipalityCode: normalizeCode(getField(fields, 7)),
        bookkeepingIndicator: "",
      };
      if (establishment.document) establishments.set(establishment.document, establishment);
      continue;
    }

    if (register === "C010" && kind === "efd-contribuicoes") {
      currentEstablishmentDocument = normalizeDocument(getField(fields, 2));
      const current = establishments.get(currentEstablishmentDocument);
      if (current) {
        current.bookkeepingIndicator = normalizeCode(getField(fields, 3));
      } else {
        warnings.push(
          `C010 da linha ${lineNumber} referencia estabelecimento ausente no 0140.`,
        );
      }
      currentDocument = null;
      continue;
    }

    if (register === "0150") {
      const participant = parseParticipant(fields);
      if (participant.code) participants.set(participant.code, participant);
      continue;
    }

    if (register === "0200") {
      const product = parseProduct(fields);
      if (product.code) products.set(product.code, product);
      continue;
    }

    if (register === "C100") {
      if (kind === "efd-contribuicoes" && !currentEstablishmentDocument) {
        warnings.push(`C100 da linha ${lineNumber} encontrado fora de um contexto C010.`);
      }
      currentDocument = parseDocument(
        fields,
        kind,
        lineNumber,
        currentEstablishmentDocument,
        participants,
      );
      documents.push(currentDocument);
      continue;
    }

    if (register === "H005" && kind === "efd-icms-ipi") {
      currentInventory = {
        date: normalizeDate(getField(fields, 2)),
        totalValue: normalizeDecimal(getField(fields, 3)),
        reason: normalizeCode(getField(fields, 4)),
        items: [],
      };
      inventories.push(currentInventory);
      continue;
    }

    if (register === "H010" && kind === "efd-icms-ipi") {
      if (!currentInventory) {
        warnings.push(`H010 da linha ${lineNumber} encontrado sem H005 anterior.`);
        continue;
      }
      const productCode = normalizeCode(getField(fields, 2));
      currentInventory.items.push({
        productCode,
        description: products.get(productCode)?.description ?? "",
        unit: normalizeCode(getField(fields, 3)),
        quantity: normalizeDecimal(getField(fields, 4)),
        unitValue: normalizeDecimal(getField(fields, 5)),
        totalValue: normalizeDecimal(getField(fields, 6)),
      });
      continue;
    }

    if (register === "C170") {
      if (!currentDocument) {
        warnings.push(`C170 da linha ${lineNumber} encontrado sem C100 anterior.`);
        continue;
      }
      items.push(parseItem(fields, kind, lineNumber, currentDocument, products));
      continue;
    }

    if (register === "C190" && kind === "efd-icms-ipi") {
      if (!currentDocument) {
        warnings.push(`C190 da linha ${lineNumber} encontrado sem C100 anterior.`);
        continue;
      }
      summaries.push(parseSummary(fields, lineNumber, currentDocument));
      continue;
    }

    if (
      kind === "efd-contribuicoes" &&
      (register === "M100" ||
        register === "M200" ||
        register === "M500" ||
        register === "M600")
    ) {
      contributionAssessments.push(
        parseContributionAssessment(fields, register, lineNumber),
      );
    }
  }

  if (!recordCounts["0150"]) warnings.push("Nenhum participante 0150 foi encontrado.");
  if (!recordCounts["0200"]) warnings.push("Nenhum produto 0200 foi encontrado.");
  if (!recordCounts["C100"]) warnings.push("Nenhum documento C100 foi encontrado.");
  if (!recordCounts["C170"]) {
    warnings.push(
      kind === "efd-contribuicoes"
        ? "A EFD-Contribuições não possui C170 individualizado; a conciliação por item pode não estar disponível."
        : "A EFD ICMS/IPI não possui C170; as análises por item não estão disponíveis.",
    );
  }
  if (kind === "efd-contribuicoes" && !recordCounts["0140"]) {
    warnings.push("A EFD-Contribuições não possui estabelecimentos 0140.");
  }
  if (kind === "efd-contribuicoes" && !recordCounts["C010"]) {
    warnings.push("A EFD-Contribuições não possui contexto de estabelecimento C010.");
  }

  return {
    kind,
    identity,
    establishments: Array.from(establishments.values()),
    participants: Array.from(participants.values()),
    products: Array.from(products.values()),
    documents,
    items,
    summaries,
    contributionAssessments,
    inventories,
    recordCounts,
    warnings: Array.from(new Set(warnings)),
    lineCount: lines.filter((line) => line.trim()).length,
  };
}
