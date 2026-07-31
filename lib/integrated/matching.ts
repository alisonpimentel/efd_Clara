import {
  decimalDifferenceWithin,
  normalizeCode,
} from "./normalization";
import type {
  DocumentMatch,
  IntegratedParseResult,
  ItemMatch,
  SourceDocument,
  SourceItem,
} from "./types";

function groupBy<T>(values: T[], keyOf: (value: T) => string) {
  const groups = new Map<string, T[]>();
  for (const value of values) {
    const key = keyOf(value);
    if (!key) continue;
    const group = groups.get(key) ?? [];
    group.push(value);
    groups.set(key, group);
  }
  return groups;
}

function documentDivergences(left: SourceDocument, right: SourceDocument) {
  const divergences: string[] = [];
  if (!decimalDifferenceWithin(left.total, right.total)) divergences.push("TOTAL");
  if (left.issueDate !== right.issueDate) divergences.push("ISSUE_DATE");
  if (
    left.participantDocument &&
    right.participantDocument &&
    left.participantDocument !== right.participantDocument
  ) {
    divergences.push("PARTICIPANT");
  }
  if (left.model !== right.model) divergences.push("MODEL");
  if (left.series !== right.series) divergences.push("SERIES");
  if (left.number !== right.number) divergences.push("NUMBER");
  return divergences;
}

function completeCompositeKey(document: SourceDocument) {
  const parts = [
    document.establishmentDocument,
    document.operation,
    document.model,
    document.series,
    document.number,
    document.issueDate,
    document.participantDocument,
  ];
  return parts.every(Boolean) ? parts.join("|") : "";
}

function scoreDocuments(left: SourceDocument, right: SourceDocument) {
  if (
    !left.establishmentDocument ||
    left.establishmentDocument !== right.establishmentDocument
  ) {
    return 0;
  }
  if (
    !left.model ||
    left.model !== right.model ||
    !left.number ||
    left.number !== right.number ||
    !left.operation ||
    left.operation !== right.operation
  ) {
    return 0;
  }

  let score = 0;
  if (left.model && left.model === right.model) score += 15;
  if (left.series && left.series === right.series) score += 10;
  if (left.number && left.number === right.number) score += 20;
  if (left.operation && left.operation === right.operation) score += 10;
  if (left.issueDate && left.issueDate === right.issueDate) score += 15;
  if (
    left.participantDocument &&
    left.participantDocument === right.participantDocument
  ) {
    score += 15;
  }
  if (decimalDifferenceWithin(left.total, right.total)) score += 15;
  return score;
}

function pushDocumentPair(
  matches: DocumentMatch[],
  left: SourceDocument,
  right: SourceDocument,
  method: DocumentMatch["method"],
  confidence: number,
) {
  const divergences = documentDivergences(left, right);
  matches.push({
    id: `document-match:${matches.length + 1}`,
    classification:
      divergences.length === 0
        ? "CONCILIADO_EXATO"
        : "CONCILIADO_COM_DIVERGENCIA",
    method,
    confidence,
    icmsDocumentSourceId: left.sourceId,
    contributionsDocumentSourceId: right.sourceId,
    candidateSourceIds: [],
    divergences,
  });
}

export function matchDocuments(
  icms: IntegratedParseResult,
  contributions: IntegratedParseResult,
  establishmentDocument: string,
) {
  const left = icms.documents.filter(
    (document) => document.establishmentDocument === establishmentDocument,
  );
  const right = contributions.documents.filter(
    (document) => document.establishmentDocument === establishmentDocument,
  );
  const unmatchedLeft = new Map(left.map((document) => [document.sourceId, document]));
  const unmatchedRight = new Map(right.map((document) => [document.sourceId, document]));
  const matches: DocumentMatch[] = [];

  const keyGroupsLeft = groupBy(
    left.filter((document) => document.documentKeyValid),
    (document) => document.documentKey,
  );
  const keyGroupsRight = groupBy(
    right.filter((document) => document.documentKeyValid),
    (document) => document.documentKey,
  );

  for (const [key, leftGroup] of keyGroupsLeft) {
    const rightGroup = keyGroupsRight.get(key) ?? [];
    if (leftGroup.length === 1 && rightGroup.length === 1) {
      pushDocumentPair(matches, leftGroup[0], rightGroup[0], "NFE_KEY", 100);
      unmatchedLeft.delete(leftGroup[0].sourceId);
      unmatchedRight.delete(rightGroup[0].sourceId);
    } else if (rightGroup.length > 0) {
      const candidateIds = [
        ...leftGroup.map((document) => document.sourceId),
        ...rightGroup.map((document) => document.sourceId),
      ];
      for (const document of [...leftGroup, ...rightGroup]) {
        matches.push({
          id: `document-match:${matches.length + 1}`,
          classification: "AMBIGUO",
          method: "AMBIGUOUS",
          confidence: 100,
          icmsDocumentSourceId:
            document.source === "efd-icms-ipi" ? document.sourceId : null,
          contributionsDocumentSourceId:
            document.source === "efd-contribuicoes" ? document.sourceId : null,
          candidateSourceIds: candidateIds.filter((id) => id !== document.sourceId),
          divergences: ["DUPLICATE_DOCUMENT_KEY"],
        });
        unmatchedLeft.delete(document.sourceId);
        unmatchedRight.delete(document.sourceId);
      }
    }
  }

  const compositeLeft = groupBy(
    Array.from(unmatchedLeft.values()),
    completeCompositeKey,
  );
  const compositeRight = groupBy(
    Array.from(unmatchedRight.values()),
    completeCompositeKey,
  );
  for (const [key, leftGroup] of compositeLeft) {
    const rightGroup = compositeRight.get(key) ?? [];
    if (leftGroup.length === 1 && rightGroup.length === 1) {
      pushDocumentPair(matches, leftGroup[0], rightGroup[0], "COMPOSITE_KEY", 100);
      unmatchedLeft.delete(leftGroup[0].sourceId);
      unmatchedRight.delete(rightGroup[0].sourceId);
    } else if (rightGroup.length > 0) {
      const candidateIds = [
        ...leftGroup.map((document) => document.sourceId),
        ...rightGroup.map((document) => document.sourceId),
      ];
      for (const document of [...leftGroup, ...rightGroup]) {
        matches.push({
          id: `document-match:${matches.length + 1}`,
          classification: "AMBIGUO",
          method: "AMBIGUOUS",
          confidence: 100,
          icmsDocumentSourceId:
            document.source === "efd-icms-ipi" ? document.sourceId : null,
          contributionsDocumentSourceId:
            document.source === "efd-contribuicoes" ? document.sourceId : null,
          candidateSourceIds: candidateIds.filter((id) => id !== document.sourceId),
          divergences: ["DUPLICATE_COMPOSITE_KEY"],
        });
        unmatchedLeft.delete(document.sourceId);
        unmatchedRight.delete(document.sourceId);
      }
    }
  }

  for (const leftDocument of Array.from(unmatchedLeft.values())) {
    const candidates = Array.from(unmatchedRight.values())
      .map((rightDocument) => ({
        rightDocument,
        score: scoreDocuments(leftDocument, rightDocument),
      }))
      .filter(({ score }) => score >= 80)
      .sort((a, b) => b.score - a.score);

    if (!candidates.length) continue;
    const bestScore = candidates[0].score;
    const best = candidates.filter((candidate) => candidate.score === bestScore);
    if (best.length !== 1) {
      matches.push({
        id: `document-match:${matches.length + 1}`,
        classification: "AMBIGUO",
        method: "AMBIGUOUS",
        confidence: bestScore,
        icmsDocumentSourceId: leftDocument.sourceId,
        contributionsDocumentSourceId: null,
        candidateSourceIds: best.map((candidate) => candidate.rightDocument.sourceId),
        divergences: ["MULTIPLE_SCORED_CANDIDATES"],
      });
      unmatchedLeft.delete(leftDocument.sourceId);
      continue;
    }

    const reverseCandidates = Array.from(unmatchedLeft.values())
      .map((candidateLeft) => ({
        candidateLeft,
        score: scoreDocuments(candidateLeft, best[0].rightDocument),
      }))
      .filter(({ score }) => score === bestScore);
    if (reverseCandidates.length !== 1) continue;

    const divergences = documentDivergences(leftDocument, best[0].rightDocument);
    matches.push({
      id: `document-match:${matches.length + 1}`,
      classification: "CONCILIADO_PROVAVEL",
      method: "SCORED",
      confidence: bestScore,
      icmsDocumentSourceId: leftDocument.sourceId,
      contributionsDocumentSourceId: best[0].rightDocument.sourceId,
      candidateSourceIds: [],
      divergences,
    });
    unmatchedLeft.delete(leftDocument.sourceId);
    unmatchedRight.delete(best[0].rightDocument.sourceId);
  }

  for (const document of unmatchedLeft.values()) {
    matches.push({
      id: `document-match:${matches.length + 1}`,
      classification: "SOMENTE_ICMS_IPI",
      method: "UNMATCHED",
      confidence: 0,
      icmsDocumentSourceId: document.sourceId,
      contributionsDocumentSourceId: null,
      candidateSourceIds: [],
      divergences: [],
    });
  }
  for (const document of unmatchedRight.values()) {
    matches.push({
      id: `document-match:${matches.length + 1}`,
      classification: "SOMENTE_CONTRIBUICOES",
      method: "UNMATCHED",
      confidence: 0,
      icmsDocumentSourceId: null,
      contributionsDocumentSourceId: document.sourceId,
      candidateSourceIds: [],
      divergences: [],
    });
  }

  return matches;
}

function itemDivergences(left: SourceItem, right: SourceItem) {
  const divergences: string[] = [];
  if (!decimalDifferenceWithin(left.value, right.value)) divergences.push("VALUE");
  if (!decimalDifferenceWithin(left.quantity, right.quantity, "0.000001")) {
    divergences.push("QUANTITY");
  }
  if (left.unit && right.unit && left.unit !== right.unit) divergences.push("UNIT");
  if (left.ncm && right.ncm && left.ncm !== right.ncm) divergences.push("NCM");
  return divergences;
}

function matchUniqueItems(
  left: SourceItem[],
  right: SourceItem[],
  keyOf: (item: SourceItem) => string,
) {
  const leftGroups = groupBy(left, keyOf);
  const rightGroups = groupBy(right, keyOf);
  const pairs: Array<[SourceItem, SourceItem]> = [];
  const ambiguous = new Map<string, string[]>();
  for (const [key, leftGroup] of leftGroups) {
    const rightGroup = rightGroups.get(key) ?? [];
    if (leftGroup.length === 1 && rightGroup.length === 1) {
      pairs.push([leftGroup[0], rightGroup[0]]);
    } else if (rightGroup.length > 0) {
      const candidates = [...leftGroup, ...rightGroup].map((item) => item.sourceId);
      for (const item of [...leftGroup, ...rightGroup]) {
        ambiguous.set(
          item.sourceId,
          candidates.filter((id) => id !== item.sourceId),
        );
      }
    }
  }
  return { pairs, ambiguous };
}

export function matchItems(
  documentMatches: DocumentMatch[],
  icms: IntegratedParseResult,
  contributions: IntegratedParseResult,
) {
  const results: ItemMatch[] = [];
  const icmsItemsByDocument = groupBy(icms.items, (item) => item.documentSourceId);
  const contributionsItemsByDocument = groupBy(
    contributions.items,
    (item) => item.documentSourceId,
  );

  for (const documentMatch of documentMatches) {
    if (
      !documentMatch.icmsDocumentSourceId ||
      !documentMatch.contributionsDocumentSourceId ||
      documentMatch.classification === "AMBIGUO"
    ) {
      continue;
    }

    const leftItems = [
      ...(icmsItemsByDocument.get(documentMatch.icmsDocumentSourceId) ?? []),
    ];
    const rightItems = [
      ...(contributionsItemsByDocument.get(
        documentMatch.contributionsDocumentSourceId,
      ) ?? []),
    ];

    if (!leftItems.length || !rightItems.length) {
      results.push({
        id: `item-match:${results.length + 1}`,
        documentMatchId: documentMatch.id,
        classification: "NAO_APLICAVEL",
        method: "NOT_APPLICABLE",
        confidence: 0,
        icmsItemSourceId: null,
        contributionsItemSourceId: null,
        candidateSourceIds: [],
        divergences: ["ITEM_DETAIL_NOT_AVAILABLE_IN_BOTH_SOURCES"],
      });
      continue;
    }

    const unmatchedLeft = new Map(leftItems.map((item) => [item.sourceId, item]));
    const unmatchedRight = new Map(rightItems.map((item) => [item.sourceId, item]));
    const stages: Array<{
      method: ItemMatch["method"];
      confidence: number;
      keyOf: (item: SourceItem) => string;
    }> = [
      {
        method: "ITEM_NUMBER",
        confidence: 100,
        keyOf: (item) => item.itemNumber,
      },
      {
        method: "PRODUCT_CODE",
        confidence: 95,
        keyOf: (item) => normalizeCode(item.productCode),
      },
      {
        method: "NCM_QUANTITY_UNIT_VALUE",
        confidence: 85,
        keyOf: (item) =>
          item.ncm && item.quantity && item.unit && item.value
            ? [item.ncm, item.quantity, item.unit, item.value].join("|")
            : "",
      },
    ];

    for (const stage of stages) {
      const matched = matchUniqueItems(
        Array.from(unmatchedLeft.values()),
        Array.from(unmatchedRight.values()),
        stage.keyOf,
      );
      for (const [left, right] of matched.pairs) {
        const divergences = itemDivergences(left, right);
        results.push({
          id: `item-match:${results.length + 1}`,
          documentMatchId: documentMatch.id,
          classification:
            divergences.length === 0
              ? "CONCILIADO_EXATO"
              : "CONCILIADO_COM_DIVERGENCIA",
          method: stage.method,
          confidence: stage.confidence,
          icmsItemSourceId: left.sourceId,
          contributionsItemSourceId: right.sourceId,
          candidateSourceIds: [],
          divergences,
        });
        unmatchedLeft.delete(left.sourceId);
        unmatchedRight.delete(right.sourceId);
      }
    }

    const ambiguousRightIds = new Set<string>();
    for (const item of Array.from(unmatchedLeft.values())) {
      const candidates = Array.from(unmatchedRight.values()).filter((candidate) =>
        stages.some((stage) => {
          const key = stage.keyOf(item);
          return key && key === stage.keyOf(candidate);
        }),
      );
      if (!candidates.length) continue;
      results.push({
        id: `item-match:${results.length + 1}`,
        documentMatchId: documentMatch.id,
        classification: "AMBIGUO",
        method: "AMBIGUOUS",
        confidence: 0,
        icmsItemSourceId: item.sourceId,
        contributionsItemSourceId: null,
        candidateSourceIds: candidates.map((candidate) => candidate.sourceId),
        divergences: ["MULTIPLE_ITEM_CANDIDATES"],
      });
      unmatchedLeft.delete(item.sourceId);
      for (const candidate of candidates) ambiguousRightIds.add(candidate.sourceId);
    }
    for (const sourceId of ambiguousRightIds) unmatchedRight.delete(sourceId);

    for (const item of unmatchedLeft.values()) {
      results.push({
        id: `item-match:${results.length + 1}`,
        documentMatchId: documentMatch.id,
        classification: "SOMENTE_ICMS_IPI",
        method: "UNMATCHED",
        confidence: 0,
        icmsItemSourceId: item.sourceId,
        contributionsItemSourceId: null,
        candidateSourceIds: [],
        divergences: [],
      });
    }
    for (const item of unmatchedRight.values()) {
      results.push({
        id: `item-match:${results.length + 1}`,
        documentMatchId: documentMatch.id,
        classification: "SOMENTE_CONTRIBUICOES",
        method: "UNMATCHED",
        confidence: 0,
        icmsItemSourceId: null,
        contributionsItemSourceId: item.sourceId,
        candidateSourceIds: [],
        divergences: [],
      });
    }
  }

  return results;
}

export const matchingInternals = {
  completeCompositeKey,
  scoreDocuments,
};
