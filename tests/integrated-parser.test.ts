import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  decimalDifferenceWithin,
  isValidNfeKey,
  normalizeDate,
  normalizeDecimal,
} from "../lib/integrated/normalization";
import {
  detectEfdKind,
  parseIntegratedEfd,
} from "../lib/integrated/parser";
import { validateEfdPair } from "../lib/integrated/pair-validation";
import { matchDocuments } from "../lib/integrated/matching";
import { buildIntegratedOperational } from "../lib/integrated/analytics";

const establishment = "12345678000195";
const nfeKey = "35260612345678000195550010000035011000035010";

const icmsText = [
  `|0000|019|0|01062026|30062026|EMPRESA TESTE LTDA|${establishment}||SP|110042490114|3550308|||A|1|`,
  "|0150|CLI001|CLIENTE TESTE|01058|33444555000166||330445566|SP|3550308|",
  "|0200|PROD001|PRODUTO TESTE|||UN|00|09012100|",
  `|C100|1|0|CLI001|55|00|1|3501|${nfeKey}|18062026|18062026|1000,00|0|0,00|0,00|1000,00|9|0,00|0,00|0,00|1000,00|120,00|0,00|0,00|0,00|0,00|0,00|0,00|`,
  "|C170|1|PROD001||10,000|UN|1000,00|0,00|0|000|5102||1000,00|12,00|120,00|0,00|0,00|0,00|0|50||0,00|0,00|0,00|50|1000,00|1,65|0,00|0,00|16,50|50|1000,00|7,60|0,00|0,00|76,00||0,00|",
  "|C190|000|5102|12,00|1000,00|1000,00|120,00|0,00|0,00|0,00|0,00|",
].join("\n");

const contributionsText = [
  `|0000|006|0|||01062026|30062026|MATRIZ TESTE LTDA|99999999000199|SP|3550308||00|0|`,
  `|0140|EST001|EMPRESA TESTE LTDA|${establishment}|SP|110042490114|3550308||`,
  "|0150|CLI001|CLIENTE TESTE|01058|33444555000166||330445566|SP|3550308|",
  "|0200|PROD001|PRODUTO TESTE|||UN|00|09012100|",
  `|C010|${establishment}|2|`,
  `|C100|1|0|CLI001|55|00|1||3501|${nfeKey}|18062026|18062026|1000,00|0|0,00|0,00|1000,00|9|0,00|0,00|0,00|1000,00|120,00|0,00|0,00|0,00||16,50|76,00||`,
  "|C170|1|PROD001||10,000|UN|1000,00|0,00|0|000|5102||1000,00|12,00|120,00|0,00|0,00|0,00|0|50||0,00|0,00|0,00|50|1000,00|1,65|0,00|0,00|16,50|50|1000,00|7,60|0,00|0,00|76,00||",
  "|M100|101|0|1000,00|1,65|0,00|0,00|16,50|0,00|0,00|0,00|16,50|0|0,00|16,50|",
  "|M200|16,50|0,00|0,00|16,50|0,00|0,00|16,50|0,00|0,00|0,00|0,00|16,50|",
  "|M500|101|0|1000,00|7,60|0,00|0,00|76,00|0,00|0,00|0,00|76,00|0|0,00|76,00|",
  "|M600|76,00|0,00|0,00|76,00|0,00|0,00|76,00|0,00|0,00|0,00|0,00|76,00|",
].join("\n");

test("normalização preserva zero, rejeita ausência e não usa ponto flutuante", () => {
  assert.equal(normalizeDecimal("1.234,5600"), "1234.56");
  assert.equal(normalizeDecimal("0,00"), "0");
  assert.equal(normalizeDecimal(""), null);
  assert.equal(normalizeDecimal("texto"), null);
  assert.equal(decimalDifferenceWithin("100.01", "100.03"), true);
  assert.equal(decimalDifferenceWithin("100.01", "100.04"), false);
});

test("datas e chaves inválidas não são promovidas a valores válidos", () => {
  assert.equal(normalizeDate("29022024"), "2024-02-29");
  assert.equal(normalizeDate("29022023"), "");
  assert.equal(isValidNfeKey(nfeKey), true);
  assert.equal(isValidNfeKey(`${nfeKey.slice(0, 43)}9`), false);
});

test("detecta os dois leiautes pelo registro 0000", () => {
  assert.equal(detectEfdKind(icmsText), "efd-icms-ipi");
  assert.equal(detectEfdKind(contributionsText), "efd-contribuicoes");
});

test("parser da EFD ICMS/IPI preserva a hierarquia C100, C170 e C190", () => {
  const parsed = parseIntegratedEfd(icmsText, "efd-icms-ipi");
  assert.equal(parsed.identity.companyDocument, establishment);
  assert.equal(parsed.identity.periodStart, "2026-06-01");
  assert.equal(parsed.documents.length, 1);
  assert.equal(parsed.items.length, 1);
  assert.equal(parsed.summaries.length, 1);
  assert.equal(parsed.items[0].documentSourceId, parsed.documents[0].sourceId);
  assert.equal(parsed.items[0].pis, "16.5");
  assert.equal(parsed.items[0].cofins, "76");
});

test("parser da EFD-Contribuições preserva C010 e os registros M", () => {
  const parsed = parseIntegratedEfd(
    contributionsText,
    "efd-contribuicoes",
  );
  assert.equal(parsed.identity.companyDocument, "99999999000199");
  assert.equal(parsed.establishments[0].document, establishment);
  assert.equal(parsed.establishments[0].bookkeepingIndicator, "2");
  assert.equal(parsed.documents[0].establishmentDocument, establishment);
  assert.equal(parsed.documents[0].number, "3501");
  assert.equal(parsed.documents[0].pis, "16.5");
  assert.equal(parsed.documents[0].cofins, "76");
  assert.equal(parsed.contributionAssessments.length, 4);
  assert.deepEqual(
    parsed.contributionAssessments.map((assessment) => assessment.register),
    ["M100", "M200", "M500", "M600"],
  );
});

test("validação aceita matriz centralizadora somente quando o estabelecimento exato existe", () => {
  const icms = parseIntegratedEfd(icmsText);
  const contributions = parseIntegratedEfd(contributionsText);
  const result = validateEfdPair(icms, contributions);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.establishmentDocument, establishment);
    assert.equal(result.contributionsEstablishment.bookkeepingIndicator, "2");
  }
});

test("igualdade apenas da raiz do CNPJ não autoriza a conciliação", () => {
  const icms = parseIntegratedEfd(icmsText);
  const changed = contributionsText.replace(
    `|${establishment}|SP|`,
    "|12345678000276|SP|",
  );
  const contributions = parseIntegratedEfd(changed);
  const result = validateEfdPair(icms, contributions);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.code, "ESTABLISHMENT_NOT_DECLARED");
});

test("competências diferentes interrompem a análise antes da conciliação", () => {
  const icms = parseIntegratedEfd(icmsText);
  const contributions = parseIntegratedEfd(
    contributionsText.replace("01062026|30062026", "01072026|31072026"),
  );
  const result = validateEfdPair(icms, contributions);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.code, "PERIOD_MISMATCH");
});

test("par fictício público reproduz quatro conciliações sem chaves inválidas", () => {
  const icms = parseIntegratedEfd(
    readFileSync(new URL("../public/exemplo-efd.txt", import.meta.url), "utf8"),
  );
  const contributions = parseIntegratedEfd(
    readFileSync(
      new URL("../public/exemplo-efd-contribuicoes.txt", import.meta.url),
      "utf8",
    ),
  );
  const validation = validateEfdPair(icms, contributions);
  assert.equal(validation.ok, true);
  if (!validation.ok) return;
  const matches = matchDocuments(
    icms,
    contributions,
    validation.establishmentDocument,
  );
  assert.equal(
    matches.filter((match) => match.classification === "CONCILIADO_EXATO")
      .length,
    4,
  );
  assert.equal(
    [...icms.documents, ...contributions.documents].filter(
      (document) => document.documentKey && !document.documentKeyValid,
    ).length,
    0,
  );
  const operational = buildIntegratedOperational(
    icms,
    validation.establishmentDocument,
  );
  assert.equal(operational.totalEntries, "15500");
  assert.equal(operational.totalExits, "27000");
  assert.equal(operational.customerConcentration, "100");
  assert.equal(operational.supplierConcentration, "100");
  assert.equal(operational.inventoryTotal, "22000");
  assert.equal(operational.topCustomers[0].value, "18000");
  assert.equal(operational.topSoldProducts[0].value, "12000");
});
