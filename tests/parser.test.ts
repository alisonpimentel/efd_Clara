import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import { parseSped, spedParserInternals } from "../lib/sped/parser";

describe("parser da EFD ICMS/IPI", () => {
  it("interpreta números brasileiros e datas do leiaute", () => {
    assert.equal(spedParserInternals.parseBrazilianNumber("1.234,56"), 1234.56);
    assert.equal(spedParserInternals.parseBrazilianNumber(""), 0);
    assert.equal(spedParserInternals.normalizeDate("30062026"), "2026-06-30");
    assert.equal(spedParserInternals.normalizeDate("data inválida"), "");
  });

  it("relaciona participantes, documentos, itens e resumos", async () => {
    const text = await readFile(new URL("../public/exemplo-efd.txt", import.meta.url), "utf8");
    const parsed = parseSped(text);

    assert.equal(parsed.company.name, "COMERCIO DEMONSTRACAO LTDA");
    assert.equal(parsed.company.startDate, "2026-06-01");
    assert.equal(parsed.participants.length, 4);
    assert.equal(parsed.products.length, 3);
    assert.equal(parsed.documents.length, 5);
    assert.equal(parsed.documents.filter((document) => document.cancelled).length, 1);
    assert.equal(parsed.items.length, 6, "o item do documento cancelado deve ser descartado");
    assert.equal(parsed.summaries.length, 4);
    assert.equal(parsed.documents[0]?.participantName, "DISTRIBUIDORA HORIZONTE LTDA");
    assert.equal(parsed.assessments.length, 1);
    assert.equal(parsed.assessments[0]?.icmsToCollect, 1080);
    assert.equal(parsed.assessments[0]?.priorCreditBalance, 200);
    assert.equal(parsed.inventories.length, 1);
    assert.equal(parsed.inventories[0]?.totalValue, 22000);
    assert.equal(parsed.inventories[0]?.items.length, 3);
    assert.equal(parsed.inventories[0]?.items[0]?.description, "CAFE TORRADO 500G");
  });

  it("avisa quando faltam itens e resumos sem interromper o painel básico", () => {
    const parsed = parseSped(
      [
        "|0000|019|0|01062026|30062026|EMPRESA TESTE|12345678000195||SP|123|3550308|||A|1|",
        "|C100|1|0||55|00|1|1||10062026|10062026|100,00|0|0,00|0,00|100,00|9|0,00|0,00|0,00|0,00|0,00|0,00|0,00|0,00|0,00|0,00|0,00|",
      ].join("\n"),
    );

    assert.equal(parsed.documents.length, 1);
    assert.ok(parsed.warnings.some((warning) => warning.includes("C170")));
    assert.ok(parsed.warnings.some((warning) => warning.includes("C190")));
    assert.ok(parsed.warnings.some((warning) => warning.includes("E110")));
    assert.ok(parsed.warnings.some((warning) => warning.includes("H005")));
  });
});
