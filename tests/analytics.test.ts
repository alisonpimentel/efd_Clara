import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import { parseSped } from "../lib/sped/parser";
import { dashboardToCsv } from "../lib/sped/export";
import { buildDashboard } from "../lib/sped/sqlite-analytics";

describe("indicadores gerados em SQLite temporário", () => {
  it("reproduz os valores esperados da base fictícia", async () => {
    const text = await readFile(new URL("../public/exemplo-efd.txt", import.meta.url), "utf8");
    const dashboard = await buildDashboard(parseSped(text));

    assert.equal(dashboard.totalEntries, 15500);
    assert.equal(dashboard.totalExits, 27000);
    assert.equal(dashboard.operationDifference, 11500);
    assert.equal(dashboard.activeDocuments, 4);
    assert.equal(dashboard.cancelledDocuments, 1);
    assert.equal(dashboard.icmsRegistered, 5100);
    assert.equal(dashboard.averageTicket, 10625);
    assert.equal(dashboard.topSuppliers[0]?.label, "DISTRIBUIDORA HORIZONTE LTDA");
    assert.equal(dashboard.topCustomers[0]?.label, "MERCADO NOVO DIA LTDA");
    assert.equal(dashboard.topSoldProducts[0]?.label, "CAFE TORRADO 500G");
    assert.equal(dashboard.cfopRanking[0]?.label, "5102");
    assert.equal(dashboard.technical.engine, "SQLite temporário em memória");

    const csv = dashboardToCsv(dashboard);
    assert.match(csv, /Total de entradas/);
    assert.match(csv, /15500\.00/);
    assert.match(csv, /MERCADO NOVO DIA LTDA/);
  });

  it("mantém valores zerados quando o arquivo não possui movimento válido", async () => {
    const parsed = parseSped(
      [
        "|0000|019|0|01062026|30062026|EMPRESA TESTE|12345678000195||SP|123|3550308|||A|1|",
        "|C100|1|0||55|02|1|1||10062026|10062026|100,00|0|0,00|0,00|100,00|9|0,00|0,00|0,00|100,00|12,00|0,00|0,00|0,00|0,00|0,00|0,00|",
      ].join("\n"),
    );
    const dashboard = await buildDashboard(parsed);

    assert.equal(dashboard.totalEntries, 0);
    assert.equal(dashboard.totalExits, 0);
    assert.equal(dashboard.activeDocuments, 0);
    assert.equal(dashboard.cancelledDocuments, 1);
    assert.equal(dashboard.averageTicket, 0);
  });
});
