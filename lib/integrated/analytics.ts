import {
  decimalToScaledInteger,
  scaledIntegerToDecimal,
  sumDecimals,
} from "./normalization";
import type {
  DecimalText,
  ExactRankingItem,
  IntegratedOperational,
  IntegratedParseResult,
} from "./types";

function buildRanking(
  values: Array<{ label: string; value: DecimalText | null }>,
): ExactRankingItem[] {
  const totals = new Map<string, bigint>();
  for (const value of values) {
    if (!value.label || value.value === null) continue;
    totals.set(
      value.label,
      (totals.get(value.label) ?? BigInt(0)) +
        decimalToScaledInteger(value.value),
    );
  }
  return Array.from(totals, ([label, value]) => ({
    label,
    value: scaledIntegerToDecimal(value),
  })).sort((left, right) => {
    const difference =
      decimalToScaledInteger(right.value) -
      decimalToScaledInteger(left.value);
    if (difference > BigInt(0)) return 1;
    if (difference < BigInt(0)) return -1;
    return left.label.localeCompare(right.label, "pt-BR");
  });
}

function topThreeConcentration(
  ranking: ExactRankingItem[],
  total: DecimalText | null,
): DecimalText | null {
  if (total === null) return null;
  const denominator = decimalToScaledInteger(total);
  if (denominator === BigInt(0)) return null;
  const numerator = ranking
    .slice(0, 3)
    .reduce(
      (sum, item) => sum + decimalToScaledInteger(item.value),
      BigInt(0),
    );
  const tenthsOfPercent =
    (numerator * BigInt(1000) + denominator / BigInt(2)) / denominator;
  return scaledIntegerToDecimal(tenthsOfPercent, 1);
}

export function buildIntegratedOperational(
  icms: IntegratedParseResult,
  establishmentDocument: string,
): IntegratedOperational {
  const documents = icms.documents.filter(
    (document) =>
      document.establishmentDocument === establishmentDocument &&
      !document.cancelled,
  );
  const activeIds = new Set(documents.map((document) => document.sourceId));
  const operationByDocument = new Map(
    documents.map((document) => [document.sourceId, document.operation]),
  );
  const items = icms.items.filter((item) => activeIds.has(item.documentSourceId));
  const participants = new Map(
    icms.participants.map((participant) => [participant.code, participant.name]),
  );
  const totalEntries = sumDecimals(
    documents
      .filter((document) => document.operation === "entry")
      .map((document) => document.total),
  );
  const totalExits = sumDecimals(
    documents
      .filter((document) => document.operation === "exit")
      .map((document) => document.total),
  );
  const topCustomers = buildRanking(
    documents
      .filter((document) => document.operation === "exit")
      .map((document) => ({
        label: participants.get(document.participantCode) ?? "",
        value: document.total,
      })),
  );
  const topSuppliers = buildRanking(
    documents
      .filter((document) => document.operation === "entry")
      .map((document) => ({
        label: participants.get(document.participantCode) ?? "",
        value: document.total,
      })),
  );
  const topSoldProducts = buildRanking(
    items
      .filter((item) => item.source === "efd-icms-ipi")
      .filter(
        (item) => operationByDocument.get(item.documentSourceId) === "exit",
      )
      .map((item) => ({
        label: item.description || item.productCode,
        value: item.value,
      })),
  );
  const topPurchasedProducts = buildRanking(
    items
      .filter(
        (item) => operationByDocument.get(item.documentSourceId) === "entry",
      )
      .map((item) => ({
        label: item.description || item.productCode,
        value: item.value,
      })),
  );
  const inventory = [...icms.inventories]
    .filter((entry) => entry.totalValue !== null)
    .sort((left, right) => right.date.localeCompare(left.date))[0];

  return {
    totalEntries,
    totalExits,
    activeDocuments: documents.length,
    topCustomers,
    topSuppliers,
    topSoldProducts,
    topPurchasedProducts,
    customerConcentration: topThreeConcentration(topCustomers, totalExits),
    supplierConcentration: topThreeConcentration(topSuppliers, totalEntries),
    skuMoved: new Set(items.map((item) => item.productCode).filter(Boolean)).size,
    inventoryTotal: inventory?.totalValue ?? null,
  };
}

export const integratedAnalyticsInternals = {
  buildRanking,
  topThreeConcentration,
};
