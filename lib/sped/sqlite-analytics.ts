"use client";

import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";
import type {
  AverageUnitValue,
  CancellationSummary,
  DashboardData,
  GeographicShare,
  InventorySummary,
  ManagementInsight,
  RankingItem,
  SpedParseResult,
  TrendPoint,
  WeekdayActivity,
} from "./types";

let sqlPromise: Promise<SqlJsStatic> | null = null;

function getSql() {
  sqlPromise ??=
    typeof window === "undefined"
      ? initSqlJs()
      : initSqlJs({
          locateFile: () => "/sql-wasm.wasm",
        });
  return sqlPromise;
}

function runValue(db: Database, sql: string) {
  const result = db.exec(sql);
  return Number(result[0]?.values[0]?.[0] ?? 0);
}

function runRanking(db: Database, sql: string): RankingItem[] {
  const result = db.exec(sql)[0];
  if (!result) return [];
  return result.values.map((row) => ({
    label: String(row[0] || "Não informado"),
    value: Number(row[1] ?? 0),
    detail: row[2] ? String(row[2]) : undefined,
  }));
}

function runTrend(db: Database): TrendPoint[] {
  const result = db.exec(`
    SELECT date,
      SUM(CASE WHEN operation = 'entry' THEN total ELSE 0 END),
      SUM(CASE WHEN operation = 'exit' THEN total ELSE 0 END)
    FROM documents
    WHERE cancelled = 0 AND TRIM(COALESCE(date, '')) <> ''
    GROUP BY date
    ORDER BY date
  `)[0];
  if (!result) return [];
  return result.values.map((row) => ({
    date: String(row[0]),
    entries: Number(row[1] ?? 0),
    exits: Number(row[2] ?? 0),
  }));
}

function withShares(values: RankingItem[], total: number) {
  return values.map((item) => ({
    ...item,
    share: total > 0 ? item.value / total : undefined,
  }));
}

function withAbc(values: RankingItem[]) {
  const total = values.reduce((sum, item) => sum + item.value, 0);
  if (total <= 0) return [];
  let cumulative = 0;
  return values.map((item) => {
    const share = item.value / total;
    cumulative += share;
    return {
      ...item,
      share,
      cumulativeShare: cumulative,
      abcClass: (cumulative <= 0.8 ? "A" : cumulative <= 0.95 ? "B" : "C") as
        | "A"
        | "B"
        | "C",
    };
  });
}

function concentration(values: RankingItem[], total: number) {
  if (total <= 0 || values.length === 0) return null;
  return values.slice(0, 3).reduce((sum, item) => sum + item.value, 0) / total;
}

function runAverageUnitValues(db: Database): AverageUnitValue[] {
  const result = db.exec(`
    SELECT
      COALESCE(NULLIF(product_description, ''), product_code, 'Não identificado'),
      COALESCE(NULLIF(unit, ''), 'sem unidade'),
      operation,
      SUM(quantity),
      SUM(value),
      CASE WHEN SUM(quantity) > 0 THEN SUM(value) / SUM(quantity) ELSE 0 END
    FROM items
    WHERE TRIM(COALESCE(product_code, '')) <> ''
    GROUP BY product_code, product_description, unit, operation
    HAVING SUM(quantity) > 0
    ORDER BY SUM(value) DESC
    LIMIT 12
  `)[0];
  if (!result) return [];
  return result.values.map((row) => ({
    label: String(row[0]),
    unit: String(row[1]),
    operation: String(row[2]) as "entry" | "exit",
    quantity: Number(row[3] ?? 0),
    totalValue: Number(row[4] ?? 0),
    averageValue: Number(row[5] ?? 0),
  }));
}

function runGeographicShares(db: Database): GeographicShare[] {
  const labels: Record<GeographicShare["category"], string> = {
    internal: "Operações internas",
    interstate: "Operações interestaduais",
    foreign: "Operações com o exterior",
    unclassified: "Não classificadas",
  };
  const result = db.exec(`
    SELECT
      CASE
        WHEN SUBSTR(TRIM(cfop), 1, 1) = '5' THEN 'internal'
        WHEN SUBSTR(TRIM(cfop), 1, 1) = '6' THEN 'interstate'
        WHEN SUBSTR(TRIM(cfop), 1, 1) = '7' THEN 'foreign'
        ELSE 'unclassified'
      END,
      SUM(operation_value)
    FROM summaries
    WHERE operation = 'exit'
    GROUP BY 1
    ORDER BY SUM(operation_value) DESC
  `)[0];
  if (!result) return [];
  const total = result.values.reduce((sum, row) => sum + Number(row[1] ?? 0), 0);
  if (total <= 0) return [];
  return result.values.map((row) => {
    const category = String(row[0]) as GeographicShare["category"];
    const value = Number(row[1] ?? 0);
    return {
      category,
      label: labels[category],
      value,
      share: value / total,
    };
  });
}

const WEEKDAY_LABELS = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

function parseUtcDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(Date.UTC(year, month - 1, day));
}

function runWeekdayActivity(parsed: SpedParseResult): WeekdayActivity[] {
  const daysInPeriod = Array.from({ length: 7 }, () => 0);
  const start = parseUtcDate(parsed.company.startDate);
  const end = parseUtcDate(parsed.company.endDate);

  if (!start || !end || start > end) return [];

  for (
    let cursor = new Date(start);
    cursor <= end;
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  ) {
    daysInPeriod[cursor.getUTCDay()] += 1;
  }

  const buckets = WEEKDAY_LABELS.map((label, weekday) => ({
    weekday,
    label,
    documentCount: 0,
    totalValue: 0,
    daysInPeriod: daysInPeriod[weekday],
    averageDocuments: 0,
    averageValue: 0,
  }));

  for (const document of parsed.documents) {
    if (document.cancelled || document.operation !== "exit") continue;
    const date = parseUtcDate(document.date);
    if (!date) continue;
    const bucket = buckets[date.getUTCDay()];
    bucket.documentCount += 1;
    bucket.totalValue += document.total;
  }

  if (!buckets.some((bucket) => bucket.documentCount > 0)) return [];

  for (const bucket of buckets) {
    if (bucket.daysInPeriod > 0) {
      bucket.averageDocuments = bucket.documentCount / bucket.daysInPeriod;
      bucket.averageValue = bucket.totalValue / bucket.daysInPeriod;
    }
  }

  return buckets;
}

function runCancellations(db: Database): CancellationSummary {
  function summary(operation: "entry" | "exit") {
    const total = runValue(
      db,
      `SELECT COUNT(*) FROM documents WHERE operation = '${operation}'`,
    );
    const cancelled = runValue(
      db,
      `SELECT COUNT(*) FROM documents WHERE operation = '${operation}' AND cancelled = 1`,
    );
    return {
      cancelled,
      total,
      rate: total > 0 ? cancelled / total : null,
    };
  }

  return {
    entry: summary("entry"),
    exit: summary("exit"),
  };
}

function summarizeInventory(parsed: SpedParseResult): InventorySummary | null {
  const inventory = parsed.inventories.at(-1);
  if (!inventory) return null;

  const ownership = {
    own: 0,
    ownWithThirdParty: 0,
    thirdParty: 0,
    unknown: 0,
  };

  for (const item of inventory.items) {
    if (item.ownership === "own") ownership.own += item.totalValue;
    else if (item.ownership === "own-with-third-party") {
      ownership.ownWithThirdParty += item.totalValue;
    } else if (item.ownership === "third-party") ownership.thirdParty += item.totalValue;
    else ownership.unknown += item.totalValue;
  }

  return {
    date: inventory.date,
    totalValue: inventory.totalValue,
    itemCount: inventory.items.length,
    reason: inventory.reason,
    topItems: inventory.items
      .map((item) => ({
        label: item.description,
        value: item.totalValue,
        detail: `${item.quantity} ${item.unit}`.trim(),
        share: inventory.totalValue > 0 ? item.totalValue / inventory.totalValue : undefined,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5),
    ownership,
  };
}

function buildInsights(input: {
  supplierConcentration: number | null;
  customerConcentration: number | null;
  cancelledDocuments: number;
  activeDocuments: number;
  c100C190Difference: number | null;
  assessment: DashboardData["assessment"];
  inventory: InventorySummary | null;
}): ManagementInsight[] {
  const insights: ManagementInsight[] = [];
  const {
    supplierConcentration,
    customerConcentration,
    cancelledDocuments,
    activeDocuments,
    c100C190Difference,
    assessment,
    inventory,
  } = input;

  if (customerConcentration !== null && customerConcentration >= 0.5) {
    insights.push({
      tone: "attention",
      title: "Saídas concentradas em poucos clientes",
      description: `${Math.round(customerConcentration * 100)}% das saídas estão nos três maiores clientes. Vale acompanhar dependência comercial e limites de crédito.`,
    });
  } else if (customerConcentration !== null && customerConcentration > 0) {
    insights.push({
      tone: "positive",
      title: "Carteira de saídas mais distribuída",
      description: `Os três maiores clientes representam ${Math.round(customerConcentration * 100)}% das saídas escrituradas no período.`,
    });
  }

  if (supplierConcentration !== null && supplierConcentration >= 0.5) {
    insights.push({
      tone: "attention",
      title: "Compras concentradas em poucos fornecedores",
      description: `${Math.round(supplierConcentration * 100)}% das entradas estão nos três maiores fornecedores. A leitura pode apoiar negociação e avaliação de dependência.`,
    });
  }

  const documentTotal = activeDocuments + cancelledDocuments;
  if (documentTotal && cancelledDocuments / documentTotal >= 0.05) {
    insights.push({
      tone: "neutral",
      title: "Cancelamentos merecem conferência",
      description: `${cancelledDocuments} de ${documentTotal} documentos foram desconsiderados por cancelamento. O painel os separa para não inflar os totais.`,
    });
  }

  if (assessment?.icmsToCollect) {
    insights.push({
      tone: "attention",
      title: "ICMS a recolher informado no E110",
      description: `A apuração registra ICMS a recolher no período. Este valor vem do arquivo e deve ser conferido com a escrituração e as obrigações aplicáveis.`,
    });
  } else if (assessment?.creditToCarry) {
    insights.push({
      tone: "neutral",
      title: "Saldo credor transportado",
      description: "O E110 informa saldo credor a transportar para o período seguinte.",
    });
  }

  if (inventory) {
    insights.push({
      tone: "neutral",
      title: "Inventário disponível para leitura",
      description: `O bloco H informa ${inventory.itemCount} item(ns) e valor total declarado de inventário.`,
    });
  }

  if (c100C190Difference !== null && c100C190Difference > 0.01) {
    insights.push({
      tone: "neutral",
      title: "C100 e C190 possuem bases diferentes",
      description:
        "A soma dos documentos não coincide com a soma das operações por CFOP. Isso exige conciliação e pode decorrer das regras do leiaute, inclusive da reforma tributária.",
    });
  }

  if (!insights.length) {
    insights.push({
      tone: "neutral",
      title: "Leitura inicial concluída",
      description:
        "Os dados disponíveis não geraram alertas automáticos. Use os gráficos para explorar valores e confirme as decisões com a contabilidade.",
    });
  }

  return insights.slice(0, 5);
}

function createSchema(db: Database) {
  db.run(`
    CREATE TABLE documents (
      id INTEGER PRIMARY KEY,
      operation TEXT NOT NULL,
      participant_name TEXT,
      date TEXT,
      total REAL NOT NULL,
      cancelled INTEGER NOT NULL
    );
    CREATE TABLE items (
      document_id INTEGER NOT NULL,
      operation TEXT NOT NULL,
      product_code TEXT,
      product_description TEXT,
      quantity REAL NOT NULL,
      unit TEXT,
      value REAL NOT NULL,
      cfop TEXT,
      icms_base REAL NOT NULL,
      icms_rate REAL NOT NULL,
      icms REAL NOT NULL
    );
    CREATE TABLE summaries (
      document_id INTEGER NOT NULL,
      operation TEXT NOT NULL,
      cfop TEXT,
      operation_value REAL NOT NULL,
      icms REAL NOT NULL
    );
  `);
}

function loadData(db: Database, parsed: SpedParseResult) {
  db.run("BEGIN TRANSACTION");
  const documentStatement = db.prepare(
    "INSERT INTO documents VALUES (?, ?, ?, ?, ?, ?)",
  );
  for (const document of parsed.documents) {
    documentStatement.run([
      document.id,
      document.operation,
      document.participantName,
      document.date,
      document.total,
      document.cancelled ? 1 : 0,
    ]);
  }
  documentStatement.free();

  const itemStatement = db.prepare(
    "INSERT INTO items VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  );
  for (const item of parsed.items) {
    itemStatement.run([
      item.documentId,
      item.operation,
      item.productCode,
      item.productDescription,
      item.quantity,
      item.unit,
      item.value,
      item.cfop,
      item.icmsBase,
      item.icmsRate,
      item.icms,
    ]);
  }
  itemStatement.free();

  const summaryStatement = db.prepare("INSERT INTO summaries VALUES (?, ?, ?, ?, ?)");
  for (const summary of parsed.summaries) {
    summaryStatement.run([
      summary.documentId,
      summary.operation,
      summary.cfop,
      summary.operationValue,
      summary.icms,
    ]);
  }
  summaryStatement.free();
  db.run("COMMIT");
}

export async function buildDashboard(parsed: SpedParseResult): Promise<DashboardData> {
  const SQL = await getSql();
  const db = new SQL.Database();

  try {
    createSchema(db);
    loadData(db, parsed);

    const hasC100 = (parsed.recordCounts.C100 ?? 0) > 0;
    const hasC190 = (parsed.recordCounts.C190 ?? 0) > 0;
    const hasReferencePeriod = Boolean(
      parsed.company.startDate &&
        parsed.company.endDate &&
        parsed.company.startDate <= parsed.company.endDate,
    );
    const totalEntriesValue = runValue(
      db,
      "SELECT COALESCE(SUM(total), 0) FROM documents WHERE operation = 'entry' AND cancelled = 0",
    );
    const totalExitsValue = runValue(
      db,
      "SELECT COALESCE(SUM(total), 0) FROM documents WHERE operation = 'exit' AND cancelled = 0",
    );
    const activeDocuments = runValue(
      db,
      "SELECT COUNT(*) FROM documents WHERE cancelled = 0",
    );
    const cancelledDocuments = runValue(
      db,
      "SELECT COUNT(*) FROM documents WHERE cancelled = 1",
    );
    const icmsRegisteredValue = parsed.summaries.length
      ? runValue(db, "SELECT COALESCE(SUM(icms), 0) FROM summaries")
      : parsed.documents
          .filter((document) => !document.cancelled)
          .reduce((sum, document) => sum + document.icms, 0);
    const entryDocuments = runValue(
      db,
      "SELECT COUNT(*) FROM documents WHERE operation = 'entry' AND cancelled = 0",
    );
    const exitDocuments = runValue(
      db,
      "SELECT COUNT(*) FROM documents WHERE operation = 'exit' AND cancelled = 0",
    );
    const activeEntryIds = new Set(
      parsed.documents
        .filter((document) => document.operation === "entry" && !document.cancelled)
        .map((document) => document.id),
    );
    const activeExitIds = new Set(
      parsed.documents
        .filter((document) => document.operation === "exit" && !document.cancelled)
        .map((document) => document.id),
    );
    const entryDocumentIdsWithItems = new Set(
      parsed.items
        .filter((item) => activeEntryIds.has(item.documentId))
        .map((item) => item.documentId),
    );
    const exitDocumentIdsWithItems = new Set(
      parsed.items
        .filter((item) => activeExitIds.has(item.documentId))
        .map((item) => item.documentId),
    );
    const activeEntryDocuments = parsed.documents.filter(
      (document) => document.operation === "entry" && !document.cancelled,
    );
    const activeExitDocuments = parsed.documents.filter(
      (document) => document.operation === "exit" && !document.cancelled,
    );
    const availability = (
      documents: typeof activeEntryDocuments,
      documentIdsWithItems: Set<number>,
    ) => {
      const withoutItems = documents.filter(
        (document) => !documentIdsWithItems.has(document.id),
      );
      const electronicOwnIssueWithoutItems = withoutItems.filter(
        (document) =>
          document.issuer === "own" && (document.model === "55" || document.model === "65"),
      ).length;
      const eligibleDocuments = documents.length - electronicOwnIssueWithoutItems;
      return {
        documentsWithItems: documentIdsWithItems.size,
        totalDocuments: documents.length,
        rate: documents.length > 0 ? documentIdsWithItems.size / documents.length : null,
        electronicOwnIssueWithoutItems,
        otherWithoutItems: withoutItems.length - electronicOwnIssueWithoutItems,
        eligibleDocuments,
        eligibleRate:
          eligibleDocuments > 0 ? documentIdsWithItems.size / eligibleDocuments : null,
      };
    };
    const documentsOutsideReferencePeriod = hasReferencePeriod
      ? parsed.documents.filter(
          (document) =>
            !document.cancelled &&
            document.date &&
            (document.date < parsed.company.startDate ||
              document.date > parsed.company.endDate),
        ).length
      : null;
    const priorIssueDocumentsInPeriod = hasReferencePeriod
      ? parsed.documents.filter(
          (document) =>
            !document.cancelled &&
            document.issueDate &&
            document.issueDate < parsed.company.startDate &&
            document.date >= parsed.company.startDate &&
            document.date <= parsed.company.endDate,
        ).length
      : null;
    const topSuppliers = withShares(
      runRanking(
        db,
        `SELECT COALESCE(NULLIF(participant_name, ''), 'Não identificado'), SUM(total), COUNT(*)
         FROM documents
         WHERE operation = 'entry' AND cancelled = 0
           AND TRIM(COALESCE(participant_name, '')) <> ''
         GROUP BY participant_name
         ORDER BY SUM(total) DESC
         LIMIT 5`,
      ),
      totalEntriesValue,
    );
    const topCustomers = withShares(
      runRanking(
        db,
        `SELECT COALESCE(NULLIF(participant_name, ''), 'Não identificado'), SUM(total), COUNT(*)
         FROM documents
         WHERE operation = 'exit' AND cancelled = 0
           AND TRIM(COALESCE(participant_name, '')) <> ''
         GROUP BY participant_name
         ORDER BY SUM(total) DESC
         LIMIT 5`,
      ),
      totalExitsValue,
    );
    const supplierConcentration = concentration(topSuppliers, totalEntriesValue);
    const customerConcentration = concentration(topCustomers, totalExitsValue);
    const entrySummaryCount = runValue(
      db,
      "SELECT COUNT(*) FROM summaries WHERE operation = 'entry'",
    );
    const exitSummaryCount = runValue(
      db,
      "SELECT COUNT(*) FROM summaries WHERE operation = 'exit'",
    );
    const icmsOnEntries = entrySummaryCount > 0
      ? runValue(db, "SELECT COALESCE(SUM(icms), 0) FROM summaries WHERE operation = 'entry'")
      : null;
    const icmsOnExits = exitSummaryCount > 0
      ? runValue(db, "SELECT COALESCE(SUM(icms), 0) FROM summaries WHERE operation = 'exit'")
      : null;
    const c100C190Difference =
      hasC100 && hasC190
        ? Math.abs(
            totalEntriesValue +
              totalExitsValue -
              runValue(db, "SELECT COALESCE(SUM(operation_value), 0) FROM summaries"),
          )
        : null;
    const assessment = parsed.assessments.at(-1) ?? null;
    const inventory = summarizeInventory(parsed);
    const customerAbc = withAbc(
      runRanking(
        db,
        `SELECT COALESCE(NULLIF(participant_name, ''), 'Não identificado'), SUM(total), COUNT(*)
         FROM documents
         WHERE operation = 'exit' AND cancelled = 0
           AND TRIM(COALESCE(participant_name, '')) <> ''
         GROUP BY participant_name
         ORDER BY SUM(total) DESC`,
      ),
    );
    const productAbc = withAbc(
      runRanking(
        db,
        `SELECT COALESCE(NULLIF(product_description, ''), product_code, 'Não identificado'), SUM(value), COUNT(*)
         FROM items
         WHERE operation = 'exit'
           AND TRIM(COALESCE(product_code, '')) <> ''
         GROUP BY product_code, product_description
         ORDER BY SUM(value) DESC`,
      ),
    );
    const totalEntryOperationValue = runValue(
      db,
      "SELECT COALESCE(SUM(operation_value), 0) FROM summaries WHERE operation = 'entry'",
    );
    const icmsCreditEntryValue = runValue(
      db,
      "SELECT COALESCE(SUM(operation_value), 0) FROM summaries WHERE operation = 'entry' AND icms > 0",
    );
    const movedSkus = runValue(
      db,
      "SELECT COUNT(DISTINCT product_code) FROM items WHERE TRIM(COALESCE(product_code, '')) <> ''",
    );
    const purchasedSkus = runValue(
      db,
      "SELECT COUNT(DISTINCT product_code) FROM items WHERE operation = 'entry' AND TRIM(COALESCE(product_code, '')) <> ''",
    );
    const soldSkus = runValue(
      db,
      "SELECT COUNT(DISTINCT product_code) FROM items WHERE operation = 'exit' AND TRIM(COALESCE(product_code, '')) <> ''",
    );
    const totalPurchasedItemValue = runValue(
      db,
      "SELECT COALESCE(SUM(value), 0) FROM items WHERE operation = 'entry' AND TRIM(COALESCE(product_code, '')) <> ''",
    );
    const totalSoldItemValue = runValue(
      db,
      "SELECT COALESCE(SUM(value), 0) FROM items WHERE operation = 'exit' AND TRIM(COALESCE(product_code, '')) <> ''",
    );
    const insights = buildInsights({
      supplierConcentration,
      customerConcentration,
      cancelledDocuments,
      activeDocuments,
      c100C190Difference,
      assessment,
      inventory,
    });

    return {
      company: parsed.company,
      accountant: parsed.accountant,
      totalEntries: hasC100 ? totalEntriesValue : null,
      totalExits: hasC100 ? totalExitsValue : null,
      operationDifference: hasC100 ? totalExitsValue - totalEntriesValue : null,
      activeDocuments,
      cancelledDocuments,
      icmsRegistered: hasC100 || hasC190 ? icmsRegisteredValue : null,
      averageTicket:
        activeDocuments > 0
          ? (totalEntriesValue + totalExitsValue) / activeDocuments
          : null,
      averageEntryTicket:
        entryDocuments > 0 ? totalEntriesValue / entryDocuments : null,
      averageExitTicket: exitDocuments > 0 ? totalExitsValue / exitDocuments : null,
      uniqueSuppliers: entryDocuments > 0
        ? runValue(
            db,
            "SELECT COUNT(DISTINCT participant_name) FROM documents WHERE operation = 'entry' AND cancelled = 0 AND TRIM(COALESCE(participant_name, '')) <> ''",
          )
        : null,
      uniqueCustomers: exitDocuments > 0
        ? runValue(
            db,
            "SELECT COUNT(DISTINCT participant_name) FROM documents WHERE operation = 'exit' AND cancelled = 0 AND TRIM(COALESCE(participant_name, '')) <> ''",
          )
        : null,
      supplierConcentration,
      customerConcentration,
      icmsOnEntries,
      icmsOnExits,
      trend: runTrend(db),
      topSuppliers,
      topCustomers,
      topPurchasedProducts: withShares(
        runRanking(
          db,
          `SELECT COALESCE(NULLIF(product_description, ''), product_code, 'Não identificado'), SUM(value), COUNT(*)
           FROM items
           WHERE operation = 'entry'
             AND TRIM(COALESCE(product_code, '')) <> ''
           GROUP BY product_code, product_description
           ORDER BY SUM(value) DESC
           LIMIT 5`,
        ),
        totalPurchasedItemValue,
      ),
      topSoldProducts: withShares(
        runRanking(
          db,
          `SELECT COALESCE(NULLIF(product_description, ''), product_code, 'Não identificado'), SUM(value), COUNT(*)
           FROM items
           WHERE operation = 'exit'
             AND TRIM(COALESCE(product_code, '')) <> ''
           GROUP BY product_code, product_description
           ORDER BY SUM(value) DESC
           LIMIT 5`,
        ),
        totalSoldItemValue,
      ),
      customerAbc,
      productAbc,
      averageUnitValues: runAverageUnitValues(db),
      geographicShares: runGeographicShares(db),
      weekdayActivity: runWeekdayActivity(parsed),
      skuActivity: {
        moved: movedSkus,
        purchased: purchasedSkus,
        sold: soldSkus,
        soldShareOfMoved: movedSkus > 0 ? soldSkus / movedSkus : null,
      },
      cancellations: runCancellations(db),
      cfopRanking: runRanking(
        db,
        `SELECT COALESCE(NULLIF(cfop, ''), 'Não informado'), SUM(operation_value), COUNT(*)
         FROM summaries
         GROUP BY cfop
         ORDER BY SUM(operation_value) DESC
         LIMIT 8`,
      ),
      icmsCreditEntryValue,
      totalEntryOperationValue,
      icmsCreditEntryShare:
        entrySummaryCount > 0 && totalEntryOperationValue > 0
          ? icmsCreditEntryValue / totalEntryOperationValue
          : null,
      apparentIcmsBurden:
        assessment && totalExitsValue > 0
          ? assessment.icmsToCollect / totalExitsValue
          : null,
      assessment,
      inventory,
      insights,
      quality: {
        documentsWithoutParticipant: runValue(
          db,
          "SELECT COUNT(*) FROM documents WHERE cancelled = 0 AND TRIM(COALESCE(participant_name, '')) = ''",
        ),
        itemsWithoutProduct: runValue(
          db,
          "SELECT COUNT(*) FROM items WHERE TRIM(COALESCE(product_code, '')) = ''",
        ),
        documentsWithoutDate: runValue(
          db,
          "SELECT COUNT(*) FROM documents WHERE cancelled = 0 AND TRIM(COALESCE(date, '')) = ''",
        ),
        documentsOutsideReferencePeriod,
        priorIssueDocumentsInPeriod,
        entryItemAvailability: availability(activeEntryDocuments, entryDocumentIdsWithItems),
        exitItemAvailability: availability(activeExitDocuments, exitDocumentIdsWithItems),
        c100C190Difference,
      },
      technical: {
        lineCount: parsed.lineCount,
        documentCount: parsed.documents.length,
        itemCount: parsed.items.length,
        summaryCount: parsed.summaries.length,
        assessmentCount: parsed.assessments.length,
        inventoryCount: parsed.inventories.length,
        processedAt: new Date().toISOString(),
        engine: "SQLite temporário em memória",
      },
      warnings: parsed.warnings,
    };
  } finally {
    db.close();
  }
}
