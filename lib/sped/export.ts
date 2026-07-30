import type { DashboardData, RankingItem } from "./types";

function escapeCsv(value: string | number) {
  const text = String(value).replace(/"/g, '""');
  return `"${text}"`;
}

function rankingRows(section: string, values: RankingItem[]) {
  return values.map((item) =>
    [section, item.label, item.value.toFixed(2), item.detail ?? ""].map(escapeCsv).join(";"),
  );
}

export function dashboardToCsv(data: DashboardData) {
  const rows = [
    ["seção", "indicador", "valor", "detalhe"].map(escapeCsv).join(";"),
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
    ...rankingRows("Fornecedores", data.topSuppliers),
    ...rankingRows("Clientes", data.topCustomers),
    ...rankingRows("Produtos comprados", data.topPurchasedProducts),
    ...rankingRows("Produtos vendidos", data.topSoldProducts),
    ...rankingRows("CFOP", data.cfopRanking),
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

