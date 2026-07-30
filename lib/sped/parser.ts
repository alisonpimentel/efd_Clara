import type {
  Accountant,
  FiscalDocument,
  FiscalItem,
  FiscalSummary,
  Inventory,
  Participant,
  Product,
  SpedParseResult,
  TaxAssessment,
} from "./types";

const SUPPORTED_RECORDS = new Set([
  "0000",
  "0005",
  "0100",
  "0150",
  "0200",
  "C100",
  "C170",
  "C190",
  "E100",
  "E110",
  "H005",
  "H010",
]);
const CANCELLED_STATUSES = new Set(["02", "03"]);

function field(fields: string[], position: number) {
  return (fields[position] ?? "").trim();
}

function normalizeDocument(value: string) {
  return value.replace(/\D/g, "");
}

function parseBrazilianNumber(value: string) {
  if (!value) return 0;
  const normalized = value.trim().replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeDate(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 8) return "";
  return `${digits.slice(4, 8)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`;
}

function splitSpedLine(line: string) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|")) return [];
  return trimmed.split("|");
}

export function parseSped(text: string): SpedParseResult {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  const participants = new Map<string, Participant>();
  const products = new Map<string, Product>();
  const documents: FiscalDocument[] = [];
  const items: FiscalItem[] = [];
  const summaries: FiscalSummary[] = [];
  const assessments: TaxAssessment[] = [];
  const inventories: Inventory[] = [];
  const recordCounts: Record<string, number> = {};
  const warnings: string[] = [];
  let currentDocument: FiscalDocument | null = null;
  let currentAssessmentPeriod = { start: "", end: "" };
  let currentInventory: Inventory | null = null;
  let accountant: Accountant | null = null;
  let company = {
    name: "",
    tradeName: "",
    document: "",
    state: "",
    stateRegistration: "",
    municipalityCode: "",
    municipalRegistration: "",
    suframa: "",
    profile: "",
    activityIndicator: "",
    startDate: "",
    endDate: "",
    address: {
      postalCode: "",
      street: "",
      number: "",
      complement: "",
      district: "",
    },
    phone: "",
    email: "",
  };

  for (const line of lines) {
    const fields = splitSpedLine(line);
    const register = field(fields, 1).toUpperCase();
    if (!register) continue;
    recordCounts[register] = (recordCounts[register] ?? 0) + 1;
    if (!SUPPORTED_RECORDS.has(register)) continue;

    if (register === "0000") {
      company = {
        ...company,
        startDate: normalizeDate(field(fields, 4)),
        endDate: normalizeDate(field(fields, 5)),
        name: field(fields, 6),
        document: normalizeDocument(field(fields, 7) || field(fields, 8)),
        state: field(fields, 9),
        stateRegistration: field(fields, 10),
        municipalityCode: field(fields, 11),
        municipalRegistration: field(fields, 12),
        suframa: field(fields, 13),
        profile: field(fields, 14),
        activityIndicator: field(fields, 15),
      };
      continue;
    }

    if (register === "0005") {
      company = {
        ...company,
        tradeName: field(fields, 2),
        address: {
          postalCode: normalizeDocument(field(fields, 3)),
          street: field(fields, 4),
          number: field(fields, 5),
          complement: field(fields, 6),
          district: field(fields, 7),
        },
        phone: normalizeDocument(field(fields, 8)),
        email: field(fields, 10),
      };
      continue;
    }

    if (register === "0100") {
      accountant = {
        name: field(fields, 2),
        document: normalizeDocument(field(fields, 3)),
        crc: field(fields, 4),
        officeDocument: normalizeDocument(field(fields, 5)),
        address: {
          postalCode: normalizeDocument(field(fields, 6)),
          street: field(fields, 7),
          number: field(fields, 8),
          complement: field(fields, 9),
          district: field(fields, 10),
        },
        phone: normalizeDocument(field(fields, 11)),
        email: field(fields, 13),
        municipalityCode: field(fields, 14),
      };
      continue;
    }

    if (register === "0150") {
      const code = field(fields, 2);
      if (code) {
        participants.set(code, {
          code,
          name: field(fields, 3) || `Participante ${code}`,
          document: normalizeDocument(field(fields, 5) || field(fields, 6)),
        });
      }
      continue;
    }

    if (register === "0200") {
      const code = field(fields, 2);
      if (code) {
        products.set(code, {
          code,
          description: field(fields, 3) || `Item ${code}`,
          unit: field(fields, 6),
          ncm: field(fields, 8),
        });
      }
      continue;
    }

    if (register === "E100") {
      currentAssessmentPeriod = {
        start: normalizeDate(field(fields, 2)),
        end: normalizeDate(field(fields, 3)),
      };
      continue;
    }

    if (register === "E110") {
      assessments.push({
        periodStart: currentAssessmentPeriod.start,
        periodEnd: currentAssessmentPeriod.end,
        totalDebits: parseBrazilianNumber(field(fields, 2)),
        debitAdjustmentsFromDocuments: parseBrazilianNumber(field(fields, 3)),
        totalDebitAdjustments: parseBrazilianNumber(field(fields, 4)),
        creditReversals: parseBrazilianNumber(field(fields, 5)),
        totalCredits: parseBrazilianNumber(field(fields, 6)),
        creditAdjustmentsFromDocuments: parseBrazilianNumber(field(fields, 7)),
        totalCreditAdjustments: parseBrazilianNumber(field(fields, 8)),
        debitReversals: parseBrazilianNumber(field(fields, 9)),
        priorCreditBalance: parseBrazilianNumber(field(fields, 10)),
        assessedBalance: parseBrazilianNumber(field(fields, 11)),
        totalDeductions: parseBrazilianNumber(field(fields, 12)),
        icmsToCollect: parseBrazilianNumber(field(fields, 13)),
        creditToCarry: parseBrazilianNumber(field(fields, 14)),
        specialDebits: parseBrazilianNumber(field(fields, 15)),
      });
      continue;
    }

    if (register === "H005") {
      currentInventory = {
        date: normalizeDate(field(fields, 2)),
        totalValue: parseBrazilianNumber(field(fields, 3)),
        reason: field(fields, 4),
        items: [],
      };
      inventories.push(currentInventory);
      continue;
    }

    if (register === "H010") {
      if (!currentInventory) {
        warnings.push("Registro H010 encontrado sem um H005 anterior.");
        continue;
      }
      const productCode = field(fields, 2);
      const ownershipCode = field(fields, 7);
      currentInventory.items.push({
        code: productCode,
        description: products.get(productCode)?.description || `Item ${productCode}`,
        unit: field(fields, 3),
        quantity: parseBrazilianNumber(field(fields, 4)),
        unitValue: parseBrazilianNumber(field(fields, 5)),
        totalValue: parseBrazilianNumber(field(fields, 6)),
        ownership:
          ownershipCode === "0"
            ? "own"
            : ownershipCode === "1"
              ? "own-with-third-party"
              : ownershipCode === "2"
                ? "third-party"
                : "unknown",
      });
      continue;
    }

    if (register === "C100") {
      const participantCode = field(fields, 4);
      const operation = field(fields, 2) === "0" ? "entry" : "exit";
      currentDocument = {
        id: documents.length + 1,
        operation,
        participantCode,
        participantName: participants.get(participantCode)?.name ?? "",
        model: field(fields, 5),
        status: field(fields, 6),
        number: field(fields, 8),
        date: normalizeDate(field(fields, 10)),
        total: parseBrazilianNumber(field(fields, 12)),
        merchandiseTotal: parseBrazilianNumber(field(fields, 16)),
        icms: parseBrazilianNumber(field(fields, 22)),
        cancelled: CANCELLED_STATUSES.has(field(fields, 6)),
      };
      documents.push(currentDocument);
      continue;
    }

    if (!currentDocument) {
      warnings.push(`Registro ${register} encontrado sem um C100 anterior.`);
      continue;
    }

    if (register === "C170") {
      const productCode = field(fields, 3);
      items.push({
        documentId: currentDocument.id,
        operation: currentDocument.operation,
        productCode,
        productDescription:
          products.get(productCode)?.description || field(fields, 4) || `Item ${productCode}`,
        quantity: parseBrazilianNumber(field(fields, 5)),
        value: parseBrazilianNumber(field(fields, 7)),
        cfop: field(fields, 11),
      });
      continue;
    }

    if (register === "C190") {
      summaries.push({
        documentId: currentDocument.id,
        operation: currentDocument.operation,
        cfop: field(fields, 3),
        operationValue: parseBrazilianNumber(field(fields, 5)),
        icms: parseBrazilianNumber(field(fields, 7)),
      });
    }
  }

  if (!recordCounts["0000"]) warnings.push("O registro 0000 não foi encontrado.");
  if (!recordCounts["0005"]) {
    warnings.push("O registro 0005 não foi encontrado; endereço e nome fantasia não serão exibidos.");
  }
  if (!recordCounts["0100"]) {
    warnings.push("O registro 0100 não foi encontrado; o contabilista não será exibido.");
  }
  if (!recordCounts["C100"]) warnings.push("Nenhum documento fiscal C100 foi encontrado.");
  if (!recordCounts["C170"]) {
    warnings.push("O arquivo não possui itens C170; a análise de produtos ficará indisponível.");
  }
  if (!recordCounts["C190"]) {
    warnings.push("O arquivo não possui resumos C190; CFOP e ICMS podem ficar incompletos.");
  }
  if (!recordCounts["E110"]) {
    warnings.push("O arquivo não possui E110; a apuração própria do ICMS não será exibida.");
  }
  if (!recordCounts["H005"]) {
    warnings.push("O arquivo não possui inventário H005; a visão de estoque ficará indisponível.");
  }

  const validDocuments = documents.filter((document) => !document.cancelled);
  const validIds = new Set(validDocuments.map((document) => document.id));

  return {
    company,
    participants: Array.from(participants.values()),
    products: Array.from(products.values()),
    documents,
    items: items.filter((item) => validIds.has(item.documentId)),
    summaries: summaries.filter((summary) => validIds.has(summary.documentId)),
    assessments,
    inventories,
    accountant,
    recordCounts,
    warnings: Array.from(new Set(warnings)),
    lineCount: lines.filter((line) => line.trim()).length,
  };
}

export const spedParserInternals = {
  parseBrazilianNumber,
  normalizeDate,
};
