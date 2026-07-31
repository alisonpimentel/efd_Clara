import type { DashboardData, RankingItem } from "./types";

function escapeCsv(value: string | number) {
  const text = String(value).replace(/"/g, '""');
  return `"${text}"`;
}

function rankingRows(section: string, values: RankingItem[]) {
  return values.map((item) =>
    [
      section,
      item.label,
      item.value.toFixed(2),
      [
        item.detail ?? "",
        item.share !== undefined ? `participação ${(item.share * 100).toFixed(2)}%` : "",
        item.cumulativeShare !== undefined
          ? `acumulado ${(item.cumulativeShare * 100).toFixed(2)}%`
          : "",
        item.abcClass ? `classe ${item.abcClass}` : "",
      ]
        .filter(Boolean)
        .join(" | "),
    ]
      .map(escapeCsv)
      .join(";"),
  );
}

export function dashboardToCsv(data: DashboardData) {
  const rows = [
    ["seção", "indicador", "valor", "detalhe"].map(escapeCsv).join(";"),
    ["Identificação", "Razão social", data.company.name, ""].map(escapeCsv).join(";"),
    ["Identificação", "Nome fantasia", data.company.tradeName, ""]
      .map(escapeCsv)
      .join(";"),
    ["Identificação", "CNPJ ou CPF", data.company.document, ""]
      .map(escapeCsv)
      .join(";"),
    ["Identificação", "Inscrição estadual", data.company.stateRegistration, data.company.state]
      .map(escapeCsv)
      .join(";"),
    ["Identificação", "Município IBGE", data.company.municipalityCode, ""]
      .map(escapeCsv)
      .join(";"),
    ["Identificação", "Competência inicial", data.company.startDate, data.company.endDate]
      .map(escapeCsv)
      .join(";"),
    ...(data.accountant
      ? [
          ["Contabilista", "Nome", data.accountant.name, ""].map(escapeCsv).join(";"),
          ["Contabilista", "CRC", data.accountant.crc, ""].map(escapeCsv).join(";"),
          ["Contabilista", "CNPJ do escritório", data.accountant.officeDocument, ""]
            .map(escapeCsv)
            .join(";"),
        ]
      : []),
    ["Resumo", "Total de entradas", data.totalEntries.toFixed(2), ""]
      .map(escapeCsv)
      .join(";"),
    ["Resumo", "Total de saídas", data.totalExits.toFixed(2), ""]
      .map(escapeCsv)
      .join(";"),
    ["Resumo", "Diferença operacional", data.operationDifference.toFixed(2), ""]
      .map(escapeCsv)
      .join(";"),
    ["Resumo", "Documentos válidos", data.activeDocuments, ""].map(escapeCsv).join(";"),
    ["Resumo", "Documentos cancelados", data.cancelledDocuments, ""]
      .map(escapeCsv)
      .join(";"),
    ["Resumo", "ICMS escriturado", data.icmsRegistered.toFixed(2), ""]
      .map(escapeCsv)
      .join(";"),
    ["Resumo", "Ticket médio de entrada", data.averageEntryTicket.toFixed(2), ""]
      .map(escapeCsv)
      .join(";"),
    ["Resumo", "Ticket médio de saída", data.averageExitTicket.toFixed(2), ""]
      .map(escapeCsv)
      .join(";"),
    ["Resumo", "Concentração nos 3 maiores fornecedores", data.supplierConcentration, "percentual"]
      .map(escapeCsv)
      .join(";"),
    ["Resumo", "Concentração nos 3 maiores clientes", data.customerConcentration, "percentual"]
      .map(escapeCsv)
      .join(";"),
    ["Fiscal", "ICMS nas entradas", data.icmsOnEntries.toFixed(2), "C190"]
      .map(escapeCsv)
      .join(";"),
    ["Fiscal", "ICMS nas saídas", data.icmsOnExits.toFixed(2), "C190"]
      .map(escapeCsv)
      .join(";"),
    [
      "Fiscal",
      "Entradas com ICMS informado",
      data.icmsCreditEntryShare,
      `${data.icmsCreditEntryValue.toFixed(2)} de ${data.totalEntryOperationValue.toFixed(2)} no C190`,
    ]
      .map(escapeCsv)
      .join(";"),
    [
      "Fiscal",
      "ICMS a recolher dividido pelas saídas",
      data.apparentIcmsBurden,
      "indicador aparente; não é alíquota efetiva",
    ]
      .map(escapeCsv)
      .join(";"),
    ["Operacional", "Cancelamentos de entrada", data.cancellations.entry.rate, `${data.cancellations.entry.cancelled} de ${data.cancellations.entry.total}`]
      .map(escapeCsv)
      .join(";"),
    ["Operacional", "Cancelamentos de saída", data.cancellations.exit.rate, `${data.cancellations.exit.cancelled} de ${data.cancellations.exit.total}`]
      .map(escapeCsv)
      .join(";"),
    ["Produtos", "SKUs movimentados", data.skuActivity.moved, "C170"]
      .map(escapeCsv)
      .join(";"),
    ["Produtos", "SKUs com saída", data.skuActivity.sold, "C170"]
      .map(escapeCsv)
      .join(";"),
    [
      "Disponibilidade",
      "Movimentos fora da competência de referência",
      data.quality.documentsOutsideReferencePeriod,
      "DT_E_S; quando ausente, DT_DOC",
    ]
      .map(escapeCsv)
      .join(";"),
    [
      "Disponibilidade",
      "Emissões anteriores escrituradas no período",
      data.quality.priorIssueDocumentsInPeriod,
      "DT_DOC anterior e data de referência dentro da competência",
    ]
      .map(escapeCsv)
      .join(";"),
    [
      "Disponibilidade",
      "Itens C170 disponíveis nas entradas",
      data.quality.entryItemAvailability.rate,
      `${data.quality.entryItemAvailability.documentsWithItems} de ${data.quality.entryItemAvailability.totalDocuments} documentos | cobertura elegível: ${data.quality.entryItemAvailability.eligibleRate === null ? "não aplicável" : data.quality.entryItemAvailability.eligibleRate} (${data.quality.entryItemAvailability.documentsWithItems} de ${data.quality.entryItemAvailability.eligibleDocuments}) | ${data.quality.entryItemAvailability.electronicOwnIssueWithoutItems} NF-e/NFC-e própria(s) sem C170 | ${data.quality.entryItemAvailability.otherWithoutItems} outro(s) sem itens`,
    ]
      .map(escapeCsv)
      .join(";"),
    [
      "Disponibilidade",
      "Itens C170 disponíveis nas saídas",
      data.quality.exitItemAvailability.rate,
      `${data.quality.exitItemAvailability.documentsWithItems} de ${data.quality.exitItemAvailability.totalDocuments} documentos | cobertura elegível: ${data.quality.exitItemAvailability.eligibleRate === null ? "não aplicável" : data.quality.exitItemAvailability.eligibleRate} (${data.quality.exitItemAvailability.documentsWithItems} de ${data.quality.exitItemAvailability.eligibleDocuments}) | ${data.quality.exitItemAvailability.electronicOwnIssueWithoutItems} NF-e/NFC-e própria(s) sem C170 | ${data.quality.exitItemAvailability.otherWithoutItems} outro(s) sem itens`,
    ]
      .map(escapeCsv)
      .join(";"),
    ...(data.assessment
      ? [
          ["Apuração E110", "Total de débitos", data.assessment.totalDebits.toFixed(2), ""]
            .map(escapeCsv)
            .join(";"),
          ["Apuração E110", "Total de créditos", data.assessment.totalCredits.toFixed(2), ""]
            .map(escapeCsv)
            .join(";"),
          ["Apuração E110", "ICMS a recolher", data.assessment.icmsToCollect.toFixed(2), ""]
            .map(escapeCsv)
            .join(";"),
          ["Apuração E110", "Crédito a transportar", data.assessment.creditToCarry.toFixed(2), ""]
            .map(escapeCsv)
            .join(";"),
        ]
      : []),
    ...(data.inventory
      ? [
          ["Inventário", "Valor total declarado", data.inventory.totalValue.toFixed(2), data.inventory.date]
            .map(escapeCsv)
            .join(";"),
          ["Inventário", "Quantidade de itens", data.inventory.itemCount, "H010"]
            .map(escapeCsv)
            .join(";"),
        ]
      : []),
    ...rankingRows("Fornecedores", data.topSuppliers),
    ...rankingRows("Clientes", data.topCustomers),
    ...rankingRows("Curva ABC de clientes", data.customerAbc),
    ...rankingRows("Produtos comprados", data.topPurchasedProducts),
    ...rankingRows("Produtos vendidos", data.topSoldProducts),
    ...rankingRows("Curva ABC de produtos", data.productAbc),
    ...rankingRows("CFOP", data.cfopRanking),
    ...data.geographicShares.map((item) =>
      ["Abrangência", item.label, item.value.toFixed(2), `${(item.share * 100).toFixed(2)}%`]
        .map(escapeCsv)
        .join(";"),
    ),
    ...data.averageUnitValues.map((item) =>
      [
        "Valor médio por unidade",
        item.label,
        item.averageValue.toFixed(2),
        `${item.operation} | ${item.quantity} ${item.unit} | total ${item.totalValue.toFixed(2)}`,
      ]
        .map(escapeCsv)
        .join(";"),
    ),
    ...data.weekdayActivity.map((item) =>
      [
        "Distribuição semanal",
        item.label,
        item.averageValue.toFixed(2),
        `${item.documentCount} documento(s) | ${item.daysInPeriod} ocorrência(s) no período`,
      ]
        .map(escapeCsv)
        .join(";"),
    ),
  ];
  return `\uFEFF${rows.join("\r\n")}`;
}

export function downloadCsv(data: DashboardData) {
  const blob = new Blob([dashboardToCsv(data)], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `efd-clara-${data.company.startDate || "analise"}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
