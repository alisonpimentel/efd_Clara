"use client";

import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";
import type { DashboardData, RankingItem, SpedParseResult } from "./types";

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
      value REAL NOT NULL
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

  const itemStatement = db.prepare("INSERT INTO items VALUES (?, ?, ?, ?, ?)");
  for (const item of parsed.items) {
    itemStatement.run([
      item.documentId,
      item.operation,
      item.productCode,
      item.productDescription,
      item.value,
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

    const totalEntries = runValue(
      db,
      "SELECT COALESCE(SUM(total), 0) FROM documents WHERE operation = 'entry' AND cancelled = 0",
    );
    const totalExits = runValue(
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
    const icmsRegistered = parsed.summaries.length
      ? runValue(db, "SELECT COALESCE(SUM(icms), 0) FROM summaries")
      : parsed.documents
          .filter((document) => !document.cancelled)
          .reduce((sum, document) => sum + document.icms, 0);

    return {
      company: parsed.company,
      totalEntries,
      totalExits,
      operationDifference: totalExits - totalEntries,
      activeDocuments,
      cancelledDocuments,
      icmsRegistered,
      averageTicket: activeDocuments ? (totalEntries + totalExits) / activeDocuments : 0,
      topSuppliers: runRanking(
        db,
        `SELECT COALESCE(NULLIF(participant_name, ''), 'Não identificado'), SUM(total), COUNT(*)
         FROM documents
         WHERE operation = 'entry' AND cancelled = 0
         GROUP BY participant_name
         ORDER BY SUM(total) DESC
         LIMIT 5`,
      ),
      topCustomers: runRanking(
        db,
        `SELECT COALESCE(NULLIF(participant_name, ''), 'Não identificado'), SUM(total), COUNT(*)
         FROM documents
         WHERE operation = 'exit' AND cancelled = 0
         GROUP BY participant_name
         ORDER BY SUM(total) DESC
         LIMIT 5`,
      ),
      topPurchasedProducts: runRanking(
        db,
        `SELECT COALESCE(NULLIF(product_description, ''), product_code, 'Não identificado'), SUM(value), COUNT(*)
         FROM items
         WHERE operation = 'entry'
         GROUP BY product_code, product_description
         ORDER BY SUM(value) DESC
         LIMIT 5`,
      ),
      topSoldProducts: runRanking(
        db,
        `SELECT COALESCE(NULLIF(product_description, ''), product_code, 'Não identificado'), SUM(value), COUNT(*)
         FROM items
         WHERE operation = 'exit'
         GROUP BY product_code, product_description
         ORDER BY SUM(value) DESC
         LIMIT 5`,
      ),
      cfopRanking: runRanking(
        db,
        `SELECT COALESCE(NULLIF(cfop, ''), 'Não informado'), SUM(operation_value), COUNT(*)
         FROM summaries
         GROUP BY cfop
         ORDER BY SUM(operation_value) DESC
         LIMIT 8`,
      ),
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
      },
      technical: {
        lineCount: parsed.lineCount,
        documentCount: parsed.documents.length,
        itemCount: parsed.items.length,
        summaryCount: parsed.summaries.length,
        processedAt: new Date().toISOString(),
        engine: "SQLite temporário em memória",
      },
      warnings: parsed.warnings,
    };
  } finally {
    db.close();
  }
}
