import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ABSENCE_LABELS,
  CFOP_EXCLUIDOS_COM_MOTIVO,
  CFOP_SEM_RECEITA_E_SEM_CREDITO,
  CST_COM_DIREITO_A_CREDITO,
  CST_SAIDA_AMBIGUO,
  CST_SAIDA_SEM_INCIDENCIA,
  CST_SAIDA_TRIBUTAVEL,
  CST_SEM_DIREITO_A_CREDITO,
  assessDocumentAbsence,
  detectConsolidatedBookkeeping,
} from "../lib/integrated/absence";
import type {
  IntegratedParseResult,
  SourceDocument,
  SourceItem,
} from "../lib/integrated/types";

function makeDocument(overrides: Partial<SourceDocument> = {}): SourceDocument {
  return {
    sourceId: "icms:doc:1",
    source: "efd-icms-ipi",
    lineNumber: 10,
    establishmentDocument: "12345678000199",
    operation: "exit",
    issuer: "own",
    participantCode: "P1",
    participantDocument: "98765432000188",
    model: "55",
    status: "00",
    series: "1",
    subseries: "",
    number: "1001",
    documentKey: "",
    documentKeyValid: false,
    issueDate: "2026-06-10",
    movementDate: "2026-06-10",
    total: "1000.00",
    merchandiseTotal: "1000.00",
    icms: "180.00",
    ipi: null,
    pis: null,
    cofins: null,
    cancelled: false,
    ...overrides,
  };
}

function makeItem(overrides: Partial<SourceItem> = {}): SourceItem {
  return {
    sourceId: "icms:item:1",
    source: "efd-icms-ipi",
    lineNumber: 11,
    documentSourceId: "icms:doc:1",
    establishmentDocument: "12345678000199",
    itemNumber: "1",
    productCode: "SKU-1",
    description: "Produto de teste",
    ncm: "12345678",
    quantity: "1.000000",
    unit: "UN",
    value: "1000.00",
    cfop: "5152",
    icmsCst: "000",
    icmsBase: "1000.00",
    icmsRate: "18.00",
    icms: "180.00",
    ipiCst: "",
    ipiBase: null,
    ipiRate: null,
    ipi: null,
    pisCst: "",
    pisBase: null,
    pisRate: null,
    pis: null,
    cofinsCst: "",
    cofinsBase: null,
    cofinsRate: null,
    cofins: null,
    ...overrides,
  };
}

function makeParseResult(
  recordCounts: Record<string, number>,
): IntegratedParseResult {
  return {
    kind: "efd-contribuicoes",
    header: null,
    establishments: [],
    participants: [],
    products: [],
    documents: [],
    items: [],
    summaries: [],
    contributionAssessments: [],
    inventories: [],
    recordCounts,
    warnings: [],
    lineCount: 0,
  } as unknown as IntegratedParseResult;
}

const NOT_CONSOLIDATED = { consolidatedBookkeeping: false };

describe("tabelas oficiais de CFOP e CST", () => {
  it("inclui as transferências entre estabelecimentos da mesma pessoa jurídica", () => {
    for (const cfop of ["1151", "1152", "2153", "5151", "5152", "6155"]) {
      assert.equal(
        CFOP_SEM_RECEITA_E_SEM_CREDITO.has(cfop),
        true,
        `CFOP ${cfop} deveria constar da lista`,
      );
    }
  });

  it("não inclui transferências nos grupos 3.15x e 7.15x, que não existem na tabela oficial", () => {
    for (const cfop of ["3151", "3152", "7151", "7152"]) {
      assert.equal(CFOP_SEM_RECEITA_E_SEM_CREDITO.has(cfop), false);
    }
  });

  it("exclui o CFOP 5910 porque bonificação, doação e brinde compartilham o código", () => {
    assert.equal(CFOP_SEM_RECEITA_E_SEM_CREDITO.has("5910"), false);
    assert.match(
      CFOP_EXCLUIDOS_COM_MOTIVO.get("5910") ?? "",
      /bonifica/i,
    );
  });

  it("exclui os códigos residuais 1949 e 5949", () => {
    assert.equal(CFOP_SEM_RECEITA_E_SEM_CREDITO.has("5949"), false);
    assert.equal(CFOP_SEM_RECEITA_E_SEM_CREDITO.has("1949"), false);
  });

  it("exclui devoluções, que produzem efeito na base de cálculo de PIS e Cofins", () => {
    for (const cfop of ["1201", "1202", "5201", "5202", "1918", "5919"]) {
      assert.equal(
        CFOP_SEM_RECEITA_E_SEM_CREDITO.has(cfop),
        false,
        `CFOP ${cfop} não pode ser tratado como ausência esperada`,
      );
    }
  });

  it("reconhece crédito presumido até o CST 67, e não até 66", () => {
    assert.equal(CST_COM_DIREITO_A_CREDITO.has("66"), true);
    assert.equal(CST_COM_DIREITO_A_CREDITO.has("67"), true);
    assert.equal(CST_COM_DIREITO_A_CREDITO.has("68"), false);
  });

  it("separa as faixas de crédito, de ausência de crédito e de receita", () => {
    assert.equal(CST_COM_DIREITO_A_CREDITO.has("50"), true);
    assert.equal(CST_SEM_DIREITO_A_CREDITO.has("70"), true);
    assert.equal(CST_SAIDA_TRIBUTAVEL.has("01"), true);
    assert.equal(CST_SAIDA_TRIBUTAVEL.has("06"), true);
    assert.equal(CST_SAIDA_TRIBUTAVEL.has("08"), false);
    assert.equal(CST_SAIDA_SEM_INCIDENCIA.has("08"), true);
    assert.equal(CST_SAIDA_AMBIGUO.has("07"), true);
    assert.equal(CST_SAIDA_AMBIGUO.has("09"), true);
  });
});

describe("detecção de escrituração consolidada", () => {
  it("identifica consolidação quando há C180 ou C190 sem nenhum C100", () => {
    const result = detectConsolidatedBookkeeping(
      makeParseResult({ C010: 1, C180: 12, C190: 3 }),
    );
    assert.equal(result.consolidated, true);
    assert.equal(result.c180, 12);
    assert.equal(result.documentsForEstablishment, 0);
  });

  it("avalia a consolidação no estabelecimento sob análise, não no arquivo inteiro", () => {
    const parsed = makeParseResult({ C010: 2, C180: 5, C100: 30 });
    (parsed as { documents: SourceDocument[] }).documents = [
      makeDocument({ sourceId: "c:1", establishmentDocument: "11111111000111" }),
    ];
    const matriz = detectConsolidatedBookkeeping(parsed, "11111111000111");
    assert.equal(matriz.consolidated, false);
    const filial = detectConsolidatedBookkeeping(parsed, "11111111000222");
    assert.equal(filial.consolidated, true);
    assert.equal(filial.documentsForEstablishment, 0);
  });

  it("não classifica como consolidada quando existem documentos individualizados", () => {
    const result = detectConsolidatedBookkeeping(
      makeParseResult({ C010: 1, C100: 40, C190: 2 }),
    );
    assert.equal(result.consolidated, false);
  });

  it("não classifica como consolidada quando não há nenhum registro de consolidação", () => {
    const result = detectConsolidatedBookkeeping(makeParseResult({ C010: 1 }));
    assert.equal(result.consolidated, false);
  });
});

describe("qualificação da ausência documental", () => {
  it("devolve NAO_APLICAVEL quando a EFD-Contribuições é consolidada", () => {
    const assessment = assessDocumentAbsence(makeDocument(), [makeItem()], {
      consolidatedBookkeeping: true,
    });
    assert.equal(assessment.code, "NAO_APLICAVEL");
    assert.equal(assessment.evidence, "NENHUMA");
  });

  it("devolve INDETERMINADO quando o documento não possui itens C170", () => {
    const assessment = assessDocumentAbsence(makeDocument(), [], NOT_CONSOLIDATED);
    assert.equal(assessment.code, "INDETERMINADO");
    assert.equal(assessment.itemsExamined, 0);
  });

  it("classifica transferência sem CST como AUSENCIA_PROVAVEL, apoiada só no CFOP", () => {
    const assessment = assessDocumentAbsence(
      makeDocument(),
      [makeItem({ cfop: "5152", pisCst: "", cofinsCst: "" })],
      NOT_CONSOLIDATED,
    );
    assert.equal(assessment.code, "AUSENCIA_PROVAVEL");
    assert.equal(assessment.evidence, "CFOP");
    assert.match(assessment.reason, /necessária e não suficiente/);
  });

  it("classifica entrada de comodato com CST 70 como AUSENCIA_ESPERADA", () => {
    const assessment = assessDocumentAbsence(
      makeDocument({ operation: "entry" }),
      [makeItem({ cfop: "1908", pisCst: "70", cofinsCst: "70" })],
      NOT_CONSOLIDATED,
    );
    assert.equal(assessment.code, "AUSENCIA_ESPERADA");
    assert.equal(assessment.evidence, "CFOP_E_CST");
  });

  it("classifica venda como A_CONFERIR quando o CFOP está fora da lista", () => {
    const assessment = assessDocumentAbsence(
      makeDocument(),
      [makeItem({ cfop: "5102" })],
      NOT_CONSOLIDATED,
    );
    assert.equal(assessment.code, "A_CONFERIR");
    assert.equal(assessment.evidence, "CFOP");
  });

  it("prioriza o CST sobre o CFOP quando há indício de crédito na entrada", () => {
    const assessment = assessDocumentAbsence(
      makeDocument({ operation: "entry" }),
      [makeItem({ cfop: "1152", pisCst: "50", cofinsCst: "50" })],
      NOT_CONSOLIDATED,
    );
    assert.equal(assessment.code, "A_CONFERIR");
    assert.equal(assessment.evidence, "CST");
    assert.match(assessment.reason, /Questão 010/);
  });

  it("prioriza o CST sobre o CFOP quando há indício de receita na saída", () => {
    const assessment = assessDocumentAbsence(
      makeDocument({ operation: "exit" }),
      [makeItem({ cfop: "5152", pisCst: "01", cofinsCst: "01" })],
      NOT_CONSOLIDATED,
    );
    assert.equal(assessment.code, "A_CONFERIR");
    assert.match(assessment.reason, /Questão 011/);
  });

  it("aceita saída sem incidência (CST 08) como ausência esperada", () => {
    const assessment = assessDocumentAbsence(
      makeDocument({ operation: "exit" }),
      [makeItem({ cfop: "5152", pisCst: "08", cofinsCst: "08" })],
      NOT_CONSOLIDATED,
    );
    assert.equal(assessment.code, "AUSENCIA_ESPERADA");
    assert.equal(assessment.evidence, "CFOP_E_CST");
  });

  it("trata isenção e suspensão na saída como evidência ambígua", () => {
    for (const cst of ["07", "09"]) {
      const assessment = assessDocumentAbsence(
        makeDocument({ operation: "exit" }),
        [makeItem({ cfop: "5152", pisCst: cst, cofinsCst: cst })],
        NOT_CONSOLIDATED,
      );
      assert.equal(assessment.code, "AUSENCIA_PROVAVEL", `CST ${cst}`);
    }
  });

  it("devolve INDETERMINADO quando o indicador de operação não foi identificado", () => {
    const assessment = assessDocumentAbsence(
      makeDocument({ operation: null }),
      [makeItem({ cfop: "5102", pisCst: "01" })],
      NOT_CONSOLIDATED,
    );
    assert.equal(assessment.code, "INDETERMINADO");
  });

  it("classifica documento cancelado como ausência esperada, sem avaliar CFOP", () => {
    const assessment = assessDocumentAbsence(
      makeDocument({ cancelled: true }),
      [makeItem({ cfop: "5102" })],
      NOT_CONSOLIDATED,
    );
    assert.equal(assessment.code, "AUSENCIA_ESPERADA");
    assert.match(assessment.reason, /cancelado/);
  });

  it("trata CST genérico como indisponível e não conclui além do CFOP", () => {
    const assessment = assessDocumentAbsence(
      makeDocument(),
      [makeItem({ cfop: "5905", pisCst: "49", cofinsCst: "99" })],
      NOT_CONSOLIDATED,
    );
    assert.equal(assessment.code, "AUSENCIA_PROVAVEL");
  });

  it("é conservador: um único item fora da lista leva o documento a conferência", () => {
    const assessment = assessDocumentAbsence(
      makeDocument(),
      [
        makeItem({ sourceId: "icms:item:1", cfop: "5152" }),
        makeItem({ sourceId: "icms:item:2", cfop: "5102" }),
      ],
      NOT_CONSOLIDATED,
    );
    assert.equal(assessment.code, "A_CONFERIR");
    assert.equal(assessment.itemsExamined, 2);
  });

  it("avalia apenas os itens do próprio documento", () => {
    const assessment = assessDocumentAbsence(
      makeDocument(),
      [
        makeItem({ sourceId: "icms:item:1", cfop: "5152" }),
        makeItem({
          sourceId: "icms:item:9",
          documentSourceId: "icms:doc:outro",
          cfop: "5102",
        }),
      ],
      NOT_CONSOLIDATED,
    );
    assert.equal(assessment.itemsExamined, 1);
    assert.equal(assessment.code, "AUSENCIA_PROVAVEL");
  });

  it("expõe rótulo legível para cada estado", () => {
    assert.equal(ABSENCE_LABELS.AUSENCIA_ESPERADA, "Ausência esperada");
    assert.equal(ABSENCE_LABELS.A_CONFERIR, "A conferir");
    assert.equal(ABSENCE_LABELS.NAO_APLICAVEL, "Não aplicável");
  });
});
