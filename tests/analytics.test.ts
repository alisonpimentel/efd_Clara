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
    assert.equal(dashboard.company.tradeName, "EFD CLARA MERCADO");
    assert.equal(dashboard.accountant?.crc, "1SP000000/O-0");
    assert.equal(dashboard.totalExits, 27000);
    assert.equal(dashboard.operationDifference, 11500);
    assert.equal(dashboard.activeDocuments, 4);
    assert.equal(dashboard.cancelledDocuments, 1);
    assert.equal(dashboard.icmsRegistered, 5100);
    assert.equal(dashboard.averageTicket, 10625);
    assert.equal(dashboard.averageEntryTicket, 7750);
    assert.equal(dashboard.averageExitTicket, 13500);
    assert.equal(dashboard.uniqueSuppliers, 2);
    assert.equal(dashboard.uniqueCustomers, 2);
    assert.equal(dashboard.supplierConcentration, 1);
    assert.equal(dashboard.customerConcentration, 1);
    assert.equal(dashboard.icmsOnEntries, 1860);
    assert.equal(dashboard.icmsOnExits, 3240);
    assert.equal(dashboard.icmsCreditEntryValue, 15500);
    assert.equal(dashboard.totalEntryOperationValue, 15500);
    assert.equal(dashboard.icmsCreditEntryShare, 1);
    assert.equal(dashboard.apparentIcmsBurden, 0.04);
    assert.deepEqual(dashboard.skuActivity, {
      moved: 3,
      purchased: 3,
      sold: 3,
      soldShareOfMoved: 1,
    });
    assert.equal(dashboard.cancellations.entry.rate, 0);
    assert.equal(dashboard.cancellations.exit.cancelled, 1);
    assert.equal(dashboard.cancellations.exit.total, 3);
    assert.equal(dashboard.cancellations.exit.rate, 1 / 3);
    assert.equal(dashboard.quality.documentsOutsideReferencePeriod, 0);
    assert.equal(dashboard.quality.priorIssueDocumentsInPeriod, 0);
    assert.deepEqual(dashboard.quality.entryItemAvailability, {
      documentsWithItems: 2,
      totalDocuments: 2,
      rate: 1,
      electronicOwnIssueWithoutItems: 0,
      otherWithoutItems: 0,
      eligibleDocuments: 2,
      eligibleRate: 1,
    });
    assert.deepEqual(dashboard.quality.exitItemAvailability, {
      documentsWithItems: 2,
      totalDocuments: 2,
      rate: 1,
      electronicOwnIssueWithoutItems: 0,
      otherWithoutItems: 0,
      eligibleDocuments: 2,
      eligibleRate: 1,
    });
    assert.equal(dashboard.customerAbc[0]?.label, "MERCADO NOVO DIA LTDA");
    assert.equal(dashboard.customerAbc[0]?.abcClass, "A");
    assert.equal(dashboard.customerAbc[0]?.cumulativeShare, 2 / 3);
    assert.equal(dashboard.productAbc[0]?.label, "CAFE TORRADO 500G");
    assert.equal(dashboard.averageUnitValues[0]?.averageValue, 15);
    assert.equal(dashboard.geographicShares[0]?.category, "internal");
    assert.equal(dashboard.geographicShares[0]?.share, 2 / 3);
    const thursday = dashboard.weekdayActivity.find((item) => item.weekday === 4);
    assert.equal(thursday?.documentCount, 2);
    assert.equal(thursday?.daysInPeriod, 4);
    assert.equal(thursday?.averageValue, 6750);
    assert.equal(dashboard.trend.length, 4);
    assert.equal(dashboard.trend[0]?.entries, 10000);
    assert.equal(dashboard.trend[2]?.exits, 18000);
    assert.equal(dashboard.topSuppliers[0]?.label, "DISTRIBUIDORA HORIZONTE LTDA");
    assert.equal(dashboard.topSuppliers[0]?.share, 10000 / 15500);
    assert.equal(dashboard.topCustomers[0]?.label, "MERCADO NOVO DIA LTDA");
    assert.equal(dashboard.topSoldProducts[0]?.label, "CAFE TORRADO 500G");
    assert.equal(dashboard.cfopRanking[0]?.label, "5102");
    assert.equal(dashboard.assessment?.icmsToCollect, 1080);
    assert.equal(dashboard.assessment?.totalDebits, 3240);
    assert.equal(dashboard.inventory?.totalValue, 22000);
    assert.equal(dashboard.inventory?.topItems[0]?.label, "CAFE TORRADO 500G");
    assert.equal(dashboard.inventory?.ownership.own, 22000);
    assert.ok(
      dashboard.insights.some((insight) => insight.title.includes("clientes")),
    );
    assert.equal(dashboard.technical.engine, "SQLite temporário em memória");

    const csv = dashboardToCsv(dashboard);
    assert.match(csv, /Total de entradas/);
    assert.match(csv, /15500\.00/);
    assert.match(csv, /MERCADO NOVO DIA LTDA/);
    assert.match(csv, /ICMS a recolher/);
    assert.match(csv, /1080\.00/);
    assert.match(csv, /Curva ABC de clientes/);
    assert.match(csv, /Entradas com ICMS informado/);
    assert.match(csv, /Operações internas/);
    assert.match(csv, /Valor total declarado/);
    assert.match(csv, /Razão social/);
    assert.match(csv, /EFD CLARA MERCADO/);
    assert.match(csv, /MARCIA CONTADORA DEMONSTRACAO/);
    assert.match(csv, /Itens C170 disponíveis nas entradas/);
    assert.match(csv, /Movimentos fora da competência de referência/);
    assert.doesNotMatch(csv, /00000000191/);
  });

  it("distingue zero observado de indicador sem denominador", async () => {
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
    assert.equal(dashboard.averageTicket, null);
    assert.equal(dashboard.averageEntryTicket, null);
    assert.equal(dashboard.averageExitTicket, null);
    assert.equal(dashboard.cancellations.entry.rate, null);
    assert.equal(dashboard.cancellations.exit.rate, 1);
  });

  it("não fabrica zeros quando registros opcionais não existem", async () => {
    const parsed = parseSped(
      [
        "|0000|019|0|01062026|30062026|EMPRESA TESTE|12345678000195||SP|123|3550308|||A|1|",
        "|C100|0|0||55|00|1|1||10062026|10062026|100,00|0|0,00|0,00|100,00|9|0,00|0,00|0,00|0,00|0,00|0,00|0,00|0,00|0,00|0,00|0,00|",
      ].join("\n"),
    );
    const dashboard = await buildDashboard(parsed);

    assert.equal(dashboard.totalEntries, 100);
    assert.equal(dashboard.totalExits, 0);
    assert.equal(dashboard.averageEntryTicket, 100);
    assert.equal(dashboard.averageExitTicket, null);
    assert.equal(dashboard.uniqueSuppliers, 0);
    assert.equal(dashboard.supplierConcentration, null);
    assert.equal(dashboard.icmsOnEntries, null);
    assert.equal(dashboard.icmsOnExits, null);
    assert.equal(dashboard.icmsCreditEntryShare, null);
    assert.equal(dashboard.apparentIcmsBurden, null);
    assert.equal(dashboard.skuActivity.soldShareOfMoved, null);
    assert.equal(dashboard.quality.c100C190Difference, null);
    assert.equal(dashboard.quality.exitItemAvailability.rate, null);
    assert.equal(dashboard.weekdayActivity.length, 0);

    const csv = dashboardToCsv(dashboard);
    assert.match(csv, /Ticket médio de saída";"não disponível"/);
    assert.match(csv, /ICMS nas entradas";"não disponível"/);
    assert.doesNotMatch(csv, /ICMS nas entradas";"0\.00"/);
  });

  it("separa disponibilidade de itens, emissão anterior e movimento fora da competência", async () => {
    const text = await readFile(new URL("../public/exemplo-efd.txt", import.meta.url), "utf8");
    const parsed = parseSped(text);
    const activeEntry = parsed.documents.find(
      (document) => document.operation === "entry" && !document.cancelled,
    );
    const activeExit = parsed.documents.find(
      (document) => document.operation === "exit" && !document.cancelled,
    );
    assert.ok(activeEntry);
    assert.ok(activeExit);
    activeEntry.issueDate = "2026-05-28";
    activeEntry.movementDate = "2026-06-03";
    activeEntry.date = "2026-06-03";
    activeExit.issueDate = "2026-05-31";
    activeExit.movementDate = "";
    activeExit.date = "2026-05-31";
    parsed.items = parsed.items.filter((item) => item.operation === "entry");

    const dashboard = await buildDashboard(parsed);

    assert.equal(dashboard.quality.documentsOutsideReferencePeriod, 1);
    assert.equal(dashboard.quality.priorIssueDocumentsInPeriod, 1);
    assert.deepEqual(dashboard.quality.exitItemAvailability, {
      documentsWithItems: 0,
      totalDocuments: 2,
      rate: 0,
      electronicOwnIssueWithoutItems: 2,
      otherWithoutItems: 0,
      eligibleDocuments: 0,
      eligibleRate: null,
    });
  });
});
