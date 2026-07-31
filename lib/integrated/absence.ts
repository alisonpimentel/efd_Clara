/**
 * Qualificação da ausência documental entre a EFD ICMS/IPI e a EFD-Contribuições.
 *
 * PROBLEMA QUE ESTE MÓDULO RESOLVE
 * --------------------------------
 * Um documento presente na EFD ICMS/IPI e ausente na EFD-Contribuições não é,
 * por si só, uma divergência. A Receita Federal delimita expressamente o que
 * precisa ser escriturado na EFD-Contribuições:
 *
 *   "No tocante às aquisições do período, só precisam ser escriturados os
 *    documentos referentes a operações geradoras de crédito (CST 50 a 56, no
 *    caso de créditos básicos; e CST 60 a 66, no caso de créditos presumidos)."
 *    — RFB, Perguntas e Respostas, Capítulo XXVII, Questão 010
 *
 *   "No tocante às notas fiscais de saída e/ou de entrada de mercadorias, só
 *    precisam ser relacionados os documentos fiscais representativos de receitas
 *    (saídas) ou de aquisições (entradas) com direito a crédito. Os documentos
 *    fiscais representativos de transferência de mercadorias e produtos entre
 *    estabelecimentos da pessoa jurídica, bem como outras operações que não se
 *    caracterizam transações comerciais (geradores de receitas ou de créditos)
 *    não precisam ser escrituradas."
 *    — RFB, Perguntas e Respostas, Capítulo XXVII, Questão 011
 *
 * Disponível em: https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/
 * declaracoes-e-demonstrativos/ecf/perguntas-e-respostas-pessoa-juridica-2021-arquivos/
 * capitulo-xxvii-efd-contribuicoes-2021.pdf — acesso em 31 jul. 2026.
 *
 * LIMITE CONHECIDO DO MÉTODO
 * --------------------------
 * O CFOP é instituído pelo Convênio S/Nº de 15/12/1970 (SINIEF), Anexo II, e
 * classifica a natureza da circulação da mercadoria para fins de ICMS/IPI. A
 * incidência de PIS/Cofins é matéria de lei federal e segue o conceito de
 * receita. Não há vínculo normativo entre as duas tabelas: o CFOP é condição
 * NECESSÁRIA, porém NÃO SUFICIENTE. Por isso este módulo:
 *
 *   1. usa uma lista POSITIVA e conservadora de CFOP (nunca uma lista de exclusão);
 *   2. confirma com o CST de PIS/Cofins do C170 quando disponível;
 *   3. devolve estado INDETERMINADO em vez de concluir sem base.
 *
 * A regra pressupõe escrituração individualizada por documento na
 * EFD-Contribuições. Se o estabelecimento usar escrituração consolidada
 * (registros C180 e C190 da EFD-Contribuições, irmãos do C100 na hierarquia
 * oficial), não existem C100/C170 para conciliar e a avaliação é NAO_APLICAVEL.
 */

import type { IntegratedParseResult, SourceDocument, SourceItem } from "./types";

/* -------------------------------------------------------------------------- */
/* Tabela CFOP — Convênio S/Nº de 15/12/1970 (SINIEF), Anexo II                */
/* Reprodução oficial consultada: RICMS-SP, Anexo V, Tabela I                  */
/* https://legislacao.fazenda.sp.gov.br/Paginas/l6an5.aspx                     */
/* Alterações incorporadas: Ajuste SINIEF 07/01 (estrutura de 4 dígitos) e     */
/* Ajuste SINIEF 20/2019 (comodato ou locação nos códigos 908 e 909).          */
/* -------------------------------------------------------------------------- */

/**
 * CFOP de operações que NÃO representam receita (saída) nem aquisição com
 * direito a crédito (entrada). Lista positiva e deliberadamente conservadora:
 * na dúvida, o código fica de fora e o documento vai para conferência.
 *
 * Não existem CFOP de transferência nos grupos 3.15x e 7.15x — não há
 * transferência entre estabelecimentos cruzando a fronteira aduaneira.
 */
export const CFOP_SEM_RECEITA_E_SEM_CREDITO: ReadonlySet<string> = new Set([
  // Transferências entre estabelecimentos da mesma pessoa jurídica.
  // Após a ADC 49 e a Lei Complementar nº 204/2023 não configuram operação
  // mercantil, logo não geram receita nem crédito de PIS/Cofins.
  "1151", "1152", "1153", "1154",
  "2151", "2152", "2153", "2154",
  "5151", "5152", "5153", "5155", "5156",
  "6151", "6152", "6153", "6155", "6156",

  // Industrialização por encomenda — remessa, retorno e não aplicação.
  "1901", "1902", "1903", "2901", "2902", "2903",
  "5901", "5902", "5903", "6901", "6902", "6903",

  // Venda fora do estabelecimento — remessa e retorno.
  "1904", "2904", "5904", "6904",

  // Depósito fechado e armazém geral — remessa, retorno e simbólicos.
  "1905", "1906", "1907", "2905", "2906", "2907",
  "5905", "5906", "5907", "6905", "6906", "6907",
  "1934", "2934", "5934", "6934",

  // Comodato ou locação — remessa e retorno (Ajuste SINIEF 20/2019).
  "1908", "1909", "2908", "2909",
  "5908", "5909", "6908", "6909",

  // Amostra grátis.
  "1911", "2911", "5911", "6911",

  // Demonstração — remessa e retorno.
  "1912", "1913", "2912", "2913",
  "5912", "5913", "6912", "6913",

  // Exposição ou feira — remessa e retorno.
  "1914", "2914", "5914", "6914",

  // Conserto ou reparo — remessa e retorno.
  "1915", "1916", "2915", "2916",
  "5915", "5916", "6915", "6916",

  // Consignação mercantil ou industrial — apenas a REMESSA.
  // As devoluções (918 e 919) ficam de fora: geram efeito na base de cálculo.
  "1917", "2917", "5917", "6917",

  // Vasilhame ou sacaria — remessa e retorno.
  "1920", "1921", "2920", "2921",
  "5920", "5921", "6920", "6921",

  // Industrialização por conta e ordem sem trânsito pelo adquirente.
  "1924", "1925", "2924", "2925",
  "5924", "5925", "6924", "6925",

  // Reclassificação por formação ou desagregação de kit.
  // O código 5926 não possui correspondente interestadual (não existe 6926).
  "1926", "2926", "5926",
]);

/**
 * CFOP deliberadamente EXCLUÍDOS da lista acima, com o motivo. Documentar a
 * exclusão é tão importante quanto documentar a inclusão: cada item abaixo é um
 * caso em que o CFOP, sozinho, levaria a conclusão errada.
 */
export const CFOP_EXCLUIDOS_COM_MOTIVO: ReadonlyMap<string, string> = new Map([
  ["1910", "bonificação, doação e brinde compartilham o mesmo código; bonificação condicionada integra a receita bruta"],
  ["2910", "bonificação, doação e brinde compartilham o mesmo código"],
  ["5910", "bonificação, doação e brinde compartilham o mesmo código; bonificação condicionada integra a receita bruta"],
  ["6910", "bonificação, doação e brinde compartilham o mesmo código"],
  ["1949", "código residual de uso heterogêneo; não sustenta conclusão"],
  ["2949", "código residual de uso heterogêneo; não sustenta conclusão"],
  ["5949", "código residual de uso heterogêneo; não sustenta conclusão"],
  ["6949", "código residual de uso heterogêneo; não sustenta conclusão"],
  ["1918", "devolução em consignação produz efeito na base de cálculo"],
  ["1919", "devolução simbólica em consignação produz efeito na base de cálculo"],
  ["5918", "devolução em consignação produz efeito na base de cálculo"],
  ["5919", "devolução simbólica em consignação produz efeito na base de cálculo"],
  ["1922", "simples faturamento de compra futura pode antecipar reconhecimento"],
  ["5922", "simples faturamento de venda futura pode antecipar reconhecimento"],
  ["1923", "venda à ordem envolve operação mercantil subjacente"],
  ["5923", "venda à ordem envolve operação mercantil subjacente"],
  ["5927", "baixa por perda ou deterioração pode exigir estorno de crédito"],
  ["5928", "baixa por encerramento de atividade pode exigir estorno de crédito"],
  ["1931", "substituição tributária de serviço de transporte"],
  ["5931", "substituição tributária de serviço de transporte"],
  ["1932", "aquisição de serviço de transporte pode gerar crédito"],
  ["5932", "prestação de serviço de transporte é receita"],
  ["1933", "aquisição de serviço tributado pelo ISSQN"],
  ["5933", "prestação de serviço tributado pelo ISSQN é receita"],
]);

/* -------------------------------------------------------------------------- */
/* Tabela CST de PIS/Pasep e Cofins                                            */
/* Instrução Normativa RFB nº 1.009, de 10 de fevereiro de 2010                */
/* Reproduzida nas Tabelas 4.3.3 e 4.3.4 do leiaute da EFD-Contribuições       */
/* -------------------------------------------------------------------------- */

/** Créditos básicos (50 a 56) e créditos presumidos (60 a 67). */
export const CST_COM_DIREITO_A_CREDITO: ReadonlySet<string> = new Set([
  "50", "51", "52", "53", "54", "55", "56",
  "60", "61", "62", "63", "64", "65", "66", "67",
]);

/** Aquisições sem direito a crédito (70 a 75). */
export const CST_SEM_DIREITO_A_CREDITO: ReadonlySet<string> = new Set([
  "70", "71", "72", "73", "74", "75",
]);

/**
 * Operações de saída com incidência — tributadas, monofásicas, por substituição
 * ou a alíquota zero. Indicam receita e, portanto, obrigação de escrituração na
 * EFD-Contribuições (Questão 011).
 */
export const CST_SAIDA_TRIBUTAVEL: ReadonlySet<string> = new Set([
  "01", "02", "03", "04", "05", "06",
]);

/**
 * Saída SEM incidência da contribuição (CST 08). É o código correto para
 * operações que não configuram receita — transferência entre estabelecimentos,
 * remessa, comodato. Confirma a ausência esperada, e não o contrário.
 */
export const CST_SAIDA_SEM_INCIDENCIA: ReadonlySet<string> = new Set(["08"]);

/**
 * Isenção (07) e suspensão (09) descrevem receita existente cuja tributação é
 * afastada ou diferida. Não confirmam nem negam a obrigação de escriturar, logo
 * são tratados como evidência indisponível.
 */
export const CST_SAIDA_AMBIGUO: ReadonlySet<string> = new Set(["07", "09"]);

/**
 * Códigos residuais e genéricos. Sua presença não permite concluir nada:
 * "outras operações" não informa se houve receita ou crédito.
 */
export const CST_GENERICO: ReadonlySet<string> = new Set(["49", "98", "99"]);

/* -------------------------------------------------------------------------- */
/* Avaliação                                                                   */
/* -------------------------------------------------------------------------- */

export type AbsenceAssessmentCode =
  /** CFOP e CST concordam: a ausência é esperada pela regra de escrituração. */
  | "AUSENCIA_ESPERADA"
  /** O CFOP indica ausência esperada, mas o CST não está disponível para confirmar. */
  | "AUSENCIA_PROVAVEL"
  /** Há indício de receita ou de crédito: a ausência merece conferência. */
  | "A_CONFERIR"
  /** Não há elementos suficientes para avaliar (documento sem itens detalhados). */
  | "INDETERMINADO"
  /** Escrituração consolidada: não existem C100/C170 para conciliar. */
  | "NAO_APLICAVEL";

export type AbsenceAssessment = {
  code: AbsenceAssessmentCode;
  /** Base normativa ou factual que sustenta a classificação. */
  reason: string;
  /** Quantos itens do documento foram examinados. */
  itemsExamined: number;
  /** Camada de evidência que sustentou a conclusão. */
  evidence: "CFOP_E_CST" | "CFOP" | "CST" | "NENHUMA";
};

const CFOP_LENGTH = 4;

function normalizeCfop(value: string) {
  const digits = (value ?? "").replace(/\D/g, "");
  return digits.length === CFOP_LENGTH ? digits : "";
}

function normalizeCst(value: string) {
  const digits = (value ?? "").replace(/\D/g, "");
  if (!digits) return "";
  return digits.length === 1 ? `0${digits}` : digits.slice(-2);
}

/**
 * Detecta escrituração consolidada na EFD-Contribuições.
 *
 * Na hierarquia oficial do leiaute da EFD-Contribuições, C180 e C190 são
 * registros de nível 3, irmãos do C100 — caminhos alternativos sob o mesmo
 * C010. Quando o estabelecimento é escriturado por consolidação, os documentos
 * aparecem em C180/C190 e NÃO em C100/C170. Sem C100 não há chave de documento;
 * sem C170 não há item. A conciliação documento a documento fica impossível.
 *
 * Observação importante: na EFD ICMS/IPI o registro C190 tem significado
 * completamente diferente — é o registro analítico, filho do C100. Por isso
 * esta função só deve ser aplicada ao resultado da EFD-Contribuições.
 */
export function detectConsolidatedBookkeeping(
  contributions: IntegratedParseResult,
  establishmentDocument?: string,
): {
  consolidated: boolean;
  c180: number;
  c190: number;
  documentsForEstablishment: number;
} {
  const c180 = contributions.recordCounts["C180"] ?? 0;
  const c190 = contributions.recordCounts["C190"] ?? 0;

  // A EFD-Contribuições é centralizada pela matriz e pode conter vários
  // estabelecimentos, cada um com sua forma de escrituração. Por isso a
  // contagem de documentos é feita no estabelecimento sob análise, e não no
  // arquivo inteiro. Os registros de consolidação, por sua vez, só existem em
  // contagem global — daí a avaliação combinada.
  const documentsForEstablishment = establishmentDocument
    ? contributions.documents.filter(
        (document) => document.establishmentDocument === establishmentDocument,
      ).length
    : (contributions.recordCounts["C100"] ?? 0);

  return {
    consolidated: c180 + c190 > 0 && documentsForEstablishment === 0,
    c180,
    c190,
    documentsForEstablishment,
  };
}

/**
 * Qualifica a ausência de um documento da EFD ICMS/IPI na EFD-Contribuições.
 *
 * A avaliação é feita em nível de item e agregada de forma conservadora: só há
 * ausência esperada quando TODOS os itens examinados apontam nessa direção. Um
 * único item com indício de receita ou de crédito leva o documento inteiro a
 * conferência.
 */
export function assessDocumentAbsence(
  document: SourceDocument,
  items: SourceItem[],
  options: { consolidatedBookkeeping: boolean },
): AbsenceAssessment {
  if (options.consolidatedBookkeeping) {
    return {
      code: "NAO_APLICAVEL",
      reason:
        "A EFD-Contribuições apresenta escrituração consolidada (C180 ou C190) e não contém documentos individualizados em C100. A conciliação documento a documento não se aplica.",
      itemsExamined: 0,
      evidence: "NENHUMA",
    };
  }

  if (document.cancelled) {
    return {
      code: "AUSENCIA_ESPERADA",
      reason:
        "O documento está cancelado na EFD ICMS/IPI. Documento cancelado não representa receita nem aquisição com direito a crédito, logo não é esperado na EFD-Contribuições.",
      itemsExamined: 0,
      evidence: "NENHUMA",
    };
  }

  if (document.operation !== "entry" && document.operation !== "exit") {
    return {
      code: "INDETERMINADO",
      reason:
        "O indicador de operação (entrada ou saída) não foi identificado no documento. A regra de escrituração da EFD-Contribuições é distinta para entradas e saídas, portanto a avaliação não se aplica.",
      itemsExamined: 0,
      evidence: "NENHUMA",
    };
  }

  const documentItems = items.filter(
    (item) => item.documentSourceId === document.sourceId,
  );

  if (!documentItems.length) {
    return {
      code: "INDETERMINADO",
      reason:
        "O documento não possui itens C170 na EFD ICMS/IPI. Sem CFOP e sem CST não há elementos para avaliar se a ausência é esperada.",
      itemsExamined: 0,
      evidence: "NENHUMA",
    };
  }

  const isEntry = document.operation === "entry";
  let cfopOutsideList = 0;
  let cstIndicatesCreditOrRevenue = 0;
  let cstConfirms = 0;
  let cstUnavailable = 0;

  for (const item of documentItems) {
    const cfop = normalizeCfop(item.cfop);
    if (!cfop || !CFOP_SEM_RECEITA_E_SEM_CREDITO.has(cfop)) {
      cfopOutsideList += 1;
    }

    const csts = [normalizeCst(item.pisCst), normalizeCst(item.cofinsCst)].filter(
      Boolean,
    );

    if (!csts.length || csts.every((cst) => CST_GENERICO.has(cst))) {
      cstUnavailable += 1;
      continue;
    }

    if (isEntry) {
      if (csts.some((cst) => CST_COM_DIREITO_A_CREDITO.has(cst))) {
        cstIndicatesCreditOrRevenue += 1;
      } else if (csts.some((cst) => CST_SEM_DIREITO_A_CREDITO.has(cst))) {
        cstConfirms += 1;
      } else {
        cstUnavailable += 1;
      }
      continue;
    }

    if (csts.some((cst) => CST_SAIDA_TRIBUTAVEL.has(cst))) {
      cstIndicatesCreditOrRevenue += 1;
    } else if (csts.some((cst) => CST_SAIDA_SEM_INCIDENCIA.has(cst))) {
      cstConfirms += 1;
    } else {
      // Isenção, suspensão e demais códigos não confirmam nem negam.
      cstUnavailable += 1;
    }
  }

  if (cstIndicatesCreditOrRevenue > 0) {
    return {
      code: "A_CONFERIR",
      reason: isEntry
        ? `${cstIndicatesCreditOrRevenue} item(ns) apresentam CST de PIS/Cofins na faixa de direito a crédito (50 a 56 ou 60 a 67). Pela Questão 010 das Perguntas e Respostas da RFB, aquisições geradoras de crédito devem ser escrituradas na EFD-Contribuições.`
        : `${cstIndicatesCreditOrRevenue} item(ns) apresentam CST de PIS/Cofins de saída com incidência (01 a 06). Pela Questão 011, saídas representativas de receita devem ser escrituradas na EFD-Contribuições.`,
      itemsExamined: documentItems.length,
      evidence: "CST",
    };
  }

  if (cfopOutsideList > 0) {
    return {
      code: "A_CONFERIR",
      reason: `${cfopOutsideList} de ${documentItems.length} item(ns) possuem CFOP fora da lista de operações sem receita e sem crédito. O documento pode representar operação mercantil e deveria constar da EFD-Contribuições.`,
      itemsExamined: documentItems.length,
      evidence: "CFOP",
    };
  }

  if (cstConfirms > 0 && cstUnavailable === 0) {
    return {
      code: "AUSENCIA_ESPERADA",
      reason: isEntry
        ? "Todos os itens possuem CFOP de operação sem crédito e o CST de PIS/Cofins confirma a ausência de direito a crédito (70 a 75). Pela Questão 010, a aquisição não precisa ser escriturada na EFD-Contribuições."
        : "Todos os itens possuem CFOP de operação sem receita e o CST de PIS/Cofins indica saída sem incidência (08). Pela Questão 011, a operação não precisa ser escriturada na EFD-Contribuições.",
      itemsExamined: documentItems.length,
      evidence: "CFOP_E_CST",
    };
  }

  return {
    code: "AUSENCIA_PROVAVEL",
    reason:
      "Todos os itens possuem CFOP de operação sem receita e sem crédito, mas o CST de PIS/Cofins está ausente ou é genérico no C170 da EFD ICMS/IPI. A conclusão apoia-se apenas no CFOP, que é condição necessária e não suficiente.",
    itemsExamined: documentItems.length,
    evidence: "CFOP",
  };
}

export const ABSENCE_LABELS: Record<AbsenceAssessmentCode, string> = {
  AUSENCIA_ESPERADA: "Ausência esperada",
  AUSENCIA_PROVAVEL: "Ausência provável",
  A_CONFERIR: "A conferir",
  INDETERMINADO: "Indeterminado",
  NAO_APLICAVEL: "Não aplicável",
};
