import assert from "node:assert/strict";
import test from "node:test";
import {
  matchDocuments,
  matchItems,
} from "../lib/integrated/matching";
import { parseIntegratedEfd } from "../lib/integrated/parser";

const establishment = "12345678000195";
const key = "35260612345678000195550010000035011000035010";

function icmsDocument(options?: {
  key?: string;
  total?: string;
  participant?: string;
  number?: string;
  extraItems?: string[];
}) {
  const participant = options?.participant ?? "CLI001";
  return [
    `|0000|019|0|01062026|30062026|EMPRESA TESTE|${establishment}||SP|IE|3550308|||A|1|`,
    "|0150|CLI001|CLIENTE|01058|33444555000166||IE|SP|3550308|",
    "|0200|P1|PRODUTO 1|||UN|00|09012100|",
    "|0200|P2|PRODUTO 2|||UN|00|09012100|",
    `|C100|1|0|${participant}|55|00|1|${options?.number ?? "3501"}|${options?.key ?? key}|18062026|18062026|${options?.total ?? "1000,00"}|0|0,00|0,00|1000,00|9|0,00|0,00|0,00|1000,00|120,00|0,00|0,00|0,00|0,00|0,00|0,00|`,
    "|C170|1|P1||10,000|UN|1000,00|0,00|0|000|5102||1000,00|12,00|120,00|0,00|0,00|0,00|0|50||0,00|0,00|0,00|50|1000,00|1,65|0,00|0,00|16,50|50|1000,00|7,60|0,00|0,00|76,00||",
    ...(options?.extraItems ?? []),
  ].join("\n");
}

function contributionsDocument(options?: {
  key?: string;
  total?: string;
  participant?: string;
  number?: string;
  duplicateDocument?: boolean;
  extraItems?: string[];
}) {
  const participant = options?.participant ?? "CLI001";
  const document = `|C100|1|0|${participant}|55|00|1||${options?.number ?? "3501"}|${options?.key ?? key}|18062026|18062026|${options?.total ?? "1000,00"}|0|0,00|0,00|1000,00|9|0,00|0,00|0,00|1000,00|120,00|0,00|0,00|0,00||16,50|76,00||`;
  const item =
    "|C170|1|P1||10,000|UN|1000,00|0,00|0|000|5102||1000,00|12,00|120,00|0,00|0,00|0,00|0|50||0,00|0,00|0,00|50|1000,00|1,65|0,00|0,00|16,50|50|1000,00|7,60|0,00|0,00|76,00||";
  return [
    "|0000|006|0|||01062026|30062026|MATRIZ|99999999000199|SP|3550308||00|0|",
    `|0140|EST1|EMPRESA TESTE|${establishment}|SP|IE|3550308||`,
    "|0150|CLI001|CLIENTE|01058|33444555000166||IE|SP|3550308|",
    "|0200|P1|PRODUTO 1|||UN|00|09012100|",
    "|0200|P2|PRODUTO 2|||UN|00|09012100|",
    `|C010|${establishment}|2|`,
    document,
    item,
    ...(options?.extraItems ?? []),
    ...(options?.duplicateDocument ? [document, item] : []),
  ].join("\n");
}

test("chave única associa um documento uma única vez e concilia seus itens", () => {
  const icms = parseIntegratedEfd(icmsDocument());
  const contributions = parseIntegratedEfd(contributionsDocument());
  const documents = matchDocuments(icms, contributions, establishment);
  assert.equal(documents.length, 1);
  assert.equal(documents[0].classification, "CONCILIADO_EXATO");
  assert.equal(documents[0].method, "NFE_KEY");
  assert.equal(documents[0].confidence, 100);

  const items = matchItems(documents, icms, contributions);
  assert.equal(items.length, 1);
  assert.equal(items[0].classification, "CONCILIADO_EXATO");
  assert.equal(items[0].method, "ITEM_NUMBER");
});

test("mesma identidade com total diferente registra divergência", () => {
  const icms = parseIntegratedEfd(icmsDocument());
  const contributions = parseIntegratedEfd(
    contributionsDocument({ total: "999,00" }),
  );
  const [match] = matchDocuments(icms, contributions, establishment);
  assert.equal(match.classification, "CONCILIADO_COM_DIVERGENCIA");
  assert.deepEqual(match.divergences, ["TOTAL"]);
});

test("chave duplicada não gera conciliação automática nem dupla contagem", () => {
  const icms = parseIntegratedEfd(icmsDocument());
  const contributions = parseIntegratedEfd(
    contributionsDocument({ duplicateDocument: true }),
  );
  const matches = matchDocuments(icms, contributions, establishment);
  assert.equal(matches.length, 3);
  assert.ok(matches.every((match) => match.classification === "AMBIGUO"));
  assert.equal(
    new Set(
      matches.flatMap((match) => [
        match.icmsDocumentSourceId,
        match.contributionsDocumentSourceId,
      ]),
    ).size,
    4,
  );
});

test("chave ausente usa composição completa, sem usar o valor como identidade", () => {
  const icms = parseIntegratedEfd(icmsDocument({ key: "" }));
  const contributions = parseIntegratedEfd(
    contributionsDocument({ key: "" }),
  );
  const [match] = matchDocuments(icms, contributions, establishment);
  assert.equal(match.classification, "CONCILIADO_EXATO");
  assert.equal(match.method, "COMPOSITE_KEY");
});

test("campos parciais únicos geram provável com pontuação explícita", () => {
  const icms = parseIntegratedEfd(icmsDocument({ key: "" }));
  const contributions = parseIntegratedEfd(
    contributionsDocument({ key: "", participant: "" }),
  );
  const [match] = matchDocuments(icms, contributions, establishment);
  assert.equal(match.classification, "CONCILIADO_PROVAVEL");
  assert.equal(match.method, "SCORED");
  assert.equal(match.confidence, 85);
});

test("documentos sem candidato permanecem associados à sua fonte", () => {
  const icms = parseIntegratedEfd(icmsDocument({ number: "3501" }));
  const contributions = parseIntegratedEfd(
    contributionsDocument({ number: "9999", key: "" }),
  );
  const matches = matchDocuments(icms, contributions, establishment);
  assert.deepEqual(
    matches.map((match) => match.classification).sort(),
    ["SOMENTE_CONTRIBUICOES", "SOMENTE_ICMS_IPI"].sort(),
  );
});

test("itens duplicados permanecem ambíguos em vez de serem escolhidos arbitrariamente", () => {
  const duplicateItem =
    "|C170|1|P1||10,000|UN|1000,00|0,00|0|000|5102||1000,00|12,00|120,00|0,00|0,00|0,00|0|50||0,00|0,00|0,00|50|1000,00|1,65|0,00|0,00|16,50|50|1000,00|7,60|0,00|0,00|76,00||";
  const icms = parseIntegratedEfd(
    icmsDocument({ extraItems: [duplicateItem] }),
  );
  const contributions = parseIntegratedEfd(
    contributionsDocument({ extraItems: [duplicateItem] }),
  );
  const documents = matchDocuments(icms, contributions, establishment);
  const items = matchItems(documents, icms, contributions);
  assert.equal(items.length, 2);
  assert.ok(items.every((item) => item.classification === "AMBIGUO"));
});

