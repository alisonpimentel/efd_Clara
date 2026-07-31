"use client";

import type {
  DecimalText,
  DocumentMatchClass,
  IntegratedAnalysis,
} from "../../lib/integrated/types";
import {
  formatDecimalCurrency,
  sumDecimals,
  decimalToScaledInteger,
} from "../../lib/integrated/normalization";
import type { ExactRankingItem } from "../../lib/integrated/types";

type Props = {
  analysis: IntegratedAnalysis;
  fileNames: string[];
  onReset: () => void;
};

const ABSENCE_LABELS_UI: Record<string, string> = {
  AUSENCIA_ESPERADA: "Ausência esperada",
  AUSENCIA_PROVAVEL: "Ausência provável",
  A_CONFERIR: "A conferir",
  INDETERMINADO: "Indeterminado",
  NAO_APLICAVEL: "Não aplicável",
};

/**
 * Explicação da CLASSE, não do documento. A contagem é agregada, então exibir o
 * motivo de um documento específico ao lado dela induziria a erro.
 */
const ABSENCE_CLASS_NOTES: Record<string, string> = {
  AUSENCIA_ESPERADA:
    "O CFOP indica operação sem receita e sem crédito, o CST de PIS/Cofins confirma, ou o documento está cancelado. Não é esperado na EFD-Contribuições.",
  AUSENCIA_PROVAVEL:
    "O CFOP indica operação sem receita e sem crédito, mas o CST de PIS/Cofins está ausente, genérico ou ambíguo no C170. A conclusão apoia-se apenas no CFOP.",
  A_CONFERIR:
    "Há indício de receita ou de direito a crédito, por CST ou por CFOP fora da lista. Merece conferência antes de ser tratado como conformidade.",
  INDETERMINADO:
    "Faltam elementos para avaliar: o documento não possui itens C170 ou não teve o indicador de entrada e saída identificado.",
  NAO_APLICAVEL:
    "A EFD-Contribuições apresenta escrituração consolidada para este estabelecimento. A conciliação documento a documento não se aplica.",
};

const ABSENCE_ORDER = [
  "AUSENCIA_ESPERADA",
  "AUSENCIA_PROVAVEL",
  "A_CONFERIR",
  "INDETERMINADO",
  "NAO_APLICAVEL",
] as const;

const MATCH_LABELS: Record<DocumentMatchClass, string> = {
  CONCILIADO_EXATO: "Conciliado exato",
  CONCILIADO_COM_DIVERGENCIA: "Conciliado com divergência",
  CONCILIADO_PROVAVEL: "Conciliado provável",
  SOMENTE_ICMS_IPI: "Somente na EFD ICMS/IPI",
  SOMENTE_CONTRIBUICOES: "Somente na EFD-Contribuições",
  AMBIGUO: "Ambíguo",
};

function formatDate(value: string) {
  if (!value) return "não informada";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function metricValue(value: DecimalText | null) {
  return value === null ? "Não disponível" : formatDecimalCurrency(value);
}

function downloadCsv(rows: string[][]) {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(";"),
    )
    .join("\r\n");
  const url = URL.createObjectURL(
    new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "efd-clara-analise-integrada.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

function countDuplicateKeys(
  documents: IntegratedAnalysis["icms"]["documents"],
) {
  const groups = new Map<string, number>();
  for (const document of documents) {
    if (!document.documentKeyValid) continue;
    groups.set(document.documentKey, (groups.get(document.documentKey) ?? 0) + 1);
  }
  return Array.from(groups.values()).filter((count) => count > 1).length;
}

function RankingBars({
  title,
  items,
  emptyMessage,
}: {
  title: string;
  items: ExactRankingItem[];
  emptyMessage: string;
}) {
  const maximum = items.reduce(
    (largest, item) => {
      const value = decimalToScaledInteger(item.value);
      return value > largest ? value : largest;
    },
    BigInt(0),
  );
  return (
    <article className="integrated-ranking-panel">
      <h3>{title}</h3>
      {items.length ? (
        <ol>
          {items.slice(0, 5).map((item) => (
            <li key={`${title}-${item.label}`}>
              <div>
                <span>{item.label}</span>
                <strong>{formatDecimalCurrency(item.value)}</strong>
              </div>
              <span
                className="ranking-track"
                role="img"
                aria-label={`${item.label}: ${formatDecimalCurrency(String(item.value))}`}
              >
                <span
                  style={{
                    width: `${
                      maximum > BigInt(0)
                        ? Number(
                            (decimalToScaledInteger(item.value) * BigInt(10000)) /
                              maximum,
                          ) / 100
                        : 0
                    }%`,
                  }}
                />
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="empty-state">{emptyMessage}</p>
      )}
    </article>
  );
}

export function IntegratedDashboard({ analysis, fileNames, onReset }: Props) {
  const {
    icms,
    contributions,
    pair,
    documentMatches,
    itemMatches,
    operational,
  } = analysis;
  const canonicalDocuments = icms.documents.filter(
    (document) =>
      document.establishmentDocument === pair.establishmentDocument &&
      !document.cancelled,
  );
  const entries = canonicalDocuments.filter(
    (document) => document.operation === "entry",
  );
  const exits = canonicalDocuments.filter(
    (document) => document.operation === "exit",
  );
  const totalEntries = operational.totalEntries;
  const totalExits = operational.totalExits;
  const activeDocumentIds = new Set(
    canonicalDocuments.map((document) => document.sourceId),
  );
  const icmsRegistered = sumDecimals(
    icms.summaries
      .filter((summary) => activeDocumentIds.has(summary.documentSourceId))
      .map((summary) => summary.icms),
  );
  const ipiRegistered = sumDecimals(
    canonicalDocuments.map((document) => document.ipi),
  );
  const pisCredits = sumDecimals(
    contributions.contributionAssessments
      .filter((assessment) => assessment.register === "M100")
      .map((assessment) => assessment.calculated),
  );
  const pisPayable = sumDecimals(
    contributions.contributionAssessments
      .filter((assessment) => assessment.register === "M200")
      .map((assessment) => assessment.payable),
  );
  const cofinsCredits = sumDecimals(
    contributions.contributionAssessments
      .filter((assessment) => assessment.register === "M500")
      .map((assessment) => assessment.calculated),
  );
  const cofinsPayable = sumDecimals(
    contributions.contributionAssessments
      .filter((assessment) => assessment.register === "M600")
      .map((assessment) => assessment.payable),
  );

  const matchCounts = Object.fromEntries(
    Object.keys(MATCH_LABELS).map((classification) => [
      classification,
      documentMatches.filter(
        (match) => match.classification === classification,
      ).length,
    ]),
  ) as Record<DocumentMatchClass, number>;
  const reconciled =
    matchCounts.CONCILIADO_EXATO +
    matchCounts.CONCILIADO_COM_DIVERGENCIA +
    matchCounts.CONCILIADO_PROVAVEL;
  const reconciliationPopulation = documentMatches.length;
  const absenceMatches = documentMatches.filter(
    (match) => match.classification === "SOMENTE_ICMS_IPI" && match.absence,
  );
  const absenceCounts = Object.fromEntries(
    ABSENCE_ORDER.map((code) => [
      code,
      absenceMatches.filter((match) => match.absence?.code === code).length,
    ]),
  ) as Record<(typeof ABSENCE_ORDER)[number], number>;
  const absenceReasons = ABSENCE_ORDER.filter(
    (code) => absenceCounts[code] > 0,
  ).map((code) => ({ code, reason: ABSENCE_CLASS_NOTES[code] }));
  const reconciliationRate =
    reconciliationPopulation > 0
      ? Math.round((reconciled / reconciliationPopulation) * 1000) / 10
      : null;
  const reconciledItems = itemMatches.filter((item) =>
    ["CONCILIADO_EXATO", "CONCILIADO_COM_DIVERGENCIA"].includes(
      item.classification,
    ),
  ).length;
  const itemPopulation = itemMatches.filter(
    (item) => item.classification !== "NAO_APLICAVEL",
  ).length;
  const itemRate =
    itemPopulation > 0
      ? Math.round((reconciledItems / itemPopulation) * 1000) / 10
      : null;

  const icmsItemDocumentIds = new Set(
    icms.items.map((item) => item.documentSourceId),
  );
  const contributionsItemDocumentIds = new Set(
    contributions.items.map((item) => item.documentSourceId),
  );
  const documentsWithoutItems =
    icms.documents.filter(
      (document) => !icmsItemDocumentIds.has(document.sourceId),
    ).length +
    contributions.documents.filter(
      (document) => !contributionsItemDocumentIds.has(document.sourceId),
    ).length;
  const invalidKeys = [...icms.documents, ...contributions.documents].filter(
    (document) =>
      ["55", "65"].includes(document.model) &&
      Boolean(document.documentKey) &&
      !document.documentKeyValid,
  ).length;
  const missingDates = [...icms.documents, ...contributions.documents].filter(
    (document) => !document.issueDate,
  ).length;
  const duplicateKeys =
    countDuplicateKeys(icms.documents) +
    countDuplicateKeys(contributions.documents);

  const rows = [
    ["Seção", "Indicador", "Resultado", "Fonte"],
    ["Empresarial", "Compras escrituradas", metricValue(totalEntries), "EFD ICMS/IPI C100"],
    ["Empresarial", "Vendas escrituradas", metricValue(totalExits), "EFD ICMS/IPI C100"],
    ["Conciliação", "Documentos conciliados", String(reconciled), "C100 das duas EFDs"],
    [
      "Conciliação",
      "Taxa documental",
      reconciliationRate === null ? "Não aplicável" : `${reconciliationRate}%`,
      "Regras de conciliação do protótipo",
    ],
    ["Tributária", "ICMS nos resumos", metricValue(icmsRegistered), "EFD ICMS/IPI C190"],
    ["Tributária", "PIS a recolher informado", metricValue(pisPayable), "EFD-Contribuições M200"],
    ["Tributária", "Cofins a recolher informada", metricValue(cofinsPayable), "EFD-Contribuições M600"],
  ];

  return (
    <section className="dashboard-page integrated-dashboard" aria-labelledby="integrated-dashboard-title">
      <div className="dashboard-toolbar">
        <div>
          <p className="eyebrow">Análise integrada concluída</p>
          <h1 id="integrated-dashboard-title">{icms.identity.companyName}</h1>
          <p>
            Competência {formatDate(pair.periodStart)} a {formatDate(pair.periodEnd)}
            {" · "}
            estabelecimento {pair.establishmentDocument}
          </p>
        </div>
        <div className="toolbar-actions">
          <button className="secondary-button" type="button" onClick={() => downloadCsv(rows)}>
            Exportar resumo CSV
          </button>
          <button className="secondary-button" type="button" onClick={() => window.print()}>
            Salvar em PDF
          </button>
          <button className="primary-button" type="button" onClick={onReset}>
            Nova análise
          </button>
        </div>
      </div>

      <aside className="integrated-trust-banner">
        <strong>Leitura combinada, sem dupla contagem.</strong>
        <span>
          Compras e vendas vêm da EFD ICMS/IPI; PIS e Cofins complementam os mesmos
          documentos quando a conciliação é segura.
        </span>
      </aside>

      <section className="identity-panel" aria-labelledby="sources-title">
        <div className="identity-heading">
          <div>
            <p className="eyebrow">Fontes validadas</p>
            <h2 id="sources-title">O que foi realmente lido</h2>
          </div>
          <p>
            O CNPJ completo do estabelecimento foi localizado no 0140 e no contexto
            C010. Igualdade somente da raiz nunca é aceita.
          </p>
        </div>
        <div className="integrated-source-cards">
          <article>
            <span>EFD ICMS/IPI</span>
            <strong>{icms.identity.companyName}</strong>
            <p>{icms.documents.length} documento(s) · {icms.items.length} item(ns)</p>
            <small>{fileNames[0]}</small>
          </article>
          <article>
            <span>EFD-Contribuições</span>
            <strong>{contributions.identity.companyName}</strong>
            <p>
              {contributions.documents.length} documento(s) ·{" "}
              {contributions.items.length} item(ns)
            </p>
            <small>{fileNames[1]}</small>
          </article>
        </div>
      </section>

      <nav className="integrated-section-nav" aria-label="Áreas do painel">
        <a href="#visao-empresarial">Visão empresarial</a>
        <a href="#visao-tributaria">Visão tributária</a>
        <a href="#conciliacao">Conciliação</a>
        <a href="#qualidade">Qualidade</a>
      </nav>

      <section id="visao-empresarial" className="integrated-section" aria-labelledby="business-title">
        <div className="integrated-section-heading">
          <div>
            <p className="eyebrow">01 · Visão empresarial</p>
            <h2 id="business-title">Quanto foi movimentado?</h2>
          </div>
          <p>Valores escriturados, não fluxo de caixa, lucro ou faturamento contábil completo.</p>
        </div>
        <div className="integrated-metric-grid">
          <article className="integrated-metric featured">
            <span>Compras escrituradas</span>
            <strong>{metricValue(totalEntries)}</strong>
            <small>{entries.length} documento(s) ativo(s) · C100</small>
          </article>
          <article className="integrated-metric featured">
            <span>Vendas escrituradas</span>
            <strong>{metricValue(totalExits)}</strong>
            <small>{exits.length} documento(s) ativo(s) · C100</small>
          </article>
          <article className="integrated-metric">
            <span>Documentos operacionais</span>
            <strong>{canonicalDocuments.length}</strong>
            <small>Fonte canônica: EFD ICMS/IPI</small>
          </article>
          <article className="integrated-metric">
            <span>Itens operacionais disponíveis</span>
            <strong>{icms.items.length}</strong>
            <small>Não extrapola documentos sem C170</small>
          </article>
        </div>
        <div className="integrated-decision-grid">
          <RankingBars
            title="Maiores clientes no período"
            items={operational.topCustomers}
            emptyMessage="Não há participantes identificados para formar o ranking."
          />
          <RankingBars
            title="Maiores fornecedores no período"
            items={operational.topSuppliers}
            emptyMessage="Não há participantes identificados para formar o ranking."
          />
          <RankingBars
            title="Produtos de maior valor nas saídas"
            items={operational.topSoldProducts}
            emptyMessage="Não há itens C170 de saída disponíveis."
          />
          <RankingBars
            title="Produtos de maior valor nas entradas"
            items={operational.topPurchasedProducts}
            emptyMessage="Não há itens C170 de entrada disponíveis."
          />
        </div>
        <div className="integrated-context-strip">
          <div>
            <span>Concentração nos 3 maiores clientes</span>
            <strong>
              {operational.customerConcentration === null
                ? "Não disponível"
                : `${operational.customerConcentration}%`}
            </strong>
          </div>
          <div>
            <span>Concentração nos 3 maiores fornecedores</span>
            <strong>
              {operational.supplierConcentration === null
                ? "Não disponível"
                : `${operational.supplierConcentration}%`}
            </strong>
          </div>
          <div>
            <span>Inventário informado</span>
            <strong>
              {formatDecimalCurrency(operational.inventoryTotal)}
            </strong>
          </div>
          <div>
            <span>SKUs movimentados disponíveis</span>
            <strong>{operational.skuMoved}</strong>
          </div>
        </div>
      </section>

      <section id="visao-tributaria" className="integrated-section" aria-labelledby="tax-title">
        <div className="integrated-section-heading">
          <div>
            <p className="eyebrow">02 · Visão tributária</p>
            <h2 id="tax-title">O que foi informado sobre tributos?</h2>
          </div>
          <p>Leitura gerencial dos registros. Não constitui apuração fiscal oficial.</p>
        </div>
        <div className="integrated-metric-grid tax-grid">
          <article className="integrated-metric">
            <span>ICMS em C190</span>
            <strong>{metricValue(icmsRegistered)}</strong>
            <small>Resumos disponíveis da EFD ICMS/IPI</small>
          </article>
          <article className="integrated-metric">
            <span>IPI em C100</span>
            <strong>{metricValue(ipiRegistered)}</strong>
            <small>Somente documentos canônicos</small>
          </article>
          <article className="integrated-metric">
            <span>Créditos de PIS informados</span>
            <strong>{metricValue(pisCredits)}</strong>
            <small>Registro M100</small>
          </article>
          <article className="integrated-metric">
            <span>PIS a recolher informado</span>
            <strong>{metricValue(pisPayable)}</strong>
            <small>Registro M200</small>
          </article>
          <article className="integrated-metric">
            <span>Créditos de Cofins informados</span>
            <strong>{metricValue(cofinsCredits)}</strong>
            <small>Registro M500</small>
          </article>
          <article className="integrated-metric">
            <span>Cofins a recolher informada</span>
            <strong>{metricValue(cofinsPayable)}</strong>
            <small>Registro M600</small>
          </article>
        </div>
      </section>

      <section id="conciliacao" className="integrated-section" aria-labelledby="matching-title">
        <div className="integrated-section-heading">
          <div>
            <p className="eyebrow">03 · Conciliação</p>
            <h2 id="matching-title">Quanto das duas fontes pôde ser ligado?</h2>
          </div>
          <p>Correspondências prováveis e ambíguas permanecem identificadas como tal.</p>
        </div>
        <div className="reconciliation-overview">
          <div className="reconciliation-score">
            <span>Taxa documental observada</span>
            <strong>
              {reconciliationRate === null ? "Não aplicável" : `${reconciliationRate}%`}
            </strong>
            <small>{reconciled} correspondência(s) em {reconciliationPopulation} resultado(s)</small>
          </div>
          <div>
            <div
              className="reconciliation-bar"
              role="img"
              aria-label={`${reconciled} documentos conciliados e ${Math.max(reconciliationPopulation - reconciled, 0)} não conciliados ou ambíguos`}
            >
              <span
                className="bar-reconciled"
                style={{
                  width: `${reconciliationRate ?? 0}%`,
                }}
              />
            </div>
            <p className="data-source">
              A taxa descreve a saída do algoritmo, não a conformidade fiscal dos arquivos.
            </p>
          </div>
        </div>
        <div className="match-class-grid">
          {(Object.keys(MATCH_LABELS) as DocumentMatchClass[]).map((classification) => (
            <article key={classification}>
              <span>{MATCH_LABELS[classification]}</span>
              <strong>{matchCounts[classification]}</strong>
            </article>
          ))}
        </div>
        {absenceMatches.length > 0 ? (
          <div className="absence-panel">
            <div className="absence-heading">
              <strong>Documentos presentes somente na EFD ICMS/IPI</strong>
              <p className="data-source">
                A ausência de um documento na EFD-Contribuições nem sempre é divergência.
                Conforme as Questões 010 e 011 das Perguntas e Respostas da Receita Federal,
                só precisam ser escrituradas as saídas representativas de receita e as
                entradas com direito a crédito. Transferências entre estabelecimentos,
                remessas, retornos e comodato não precisam constar.
              </p>
            </div>
            <div className="absence-grid">
              {ABSENCE_ORDER.filter((code) => absenceCounts[code] > 0).map((code) => (
                <article key={code} data-absence={code}>
                  <span>{ABSENCE_LABELS_UI[code]}</span>
                  <strong>{absenceCounts[code]}</strong>
                </article>
              ))}
            </div>
            <ul className="absence-reasons">
              {absenceReasons.map((entry) => (
                <li key={entry.code}>
                  <strong>{ABSENCE_LABELS_UI[entry.code]}:</strong> {entry.reason}
                </li>
              ))}
            </ul>
            <p className="data-source">
              O CFOP, instituído pelo Convênio S/Nº de 15/12/1970 (SINIEF), classifica a
              circulação da mercadoria e é condição necessária, porém não suficiente, para
              concluir sobre incidência de PIS e Cofins. Quando o CST das Tabelas 4.3.3 e
              4.3.4 não está disponível no C170, a análise permanece como ausência provável.
            </p>
          </div>
        ) : null}
        <div className="item-coverage">
          <strong>Itens conciliados</strong>
          <span>
            {itemRate === null
              ? "Não disponível: uma das fontes não forneceu detalhamento suficiente."
              : `${reconciledItems} de ${itemPopulation} (${itemRate}%)`}
          </span>
        </div>
      </section>

      <section id="qualidade" className="integrated-section" aria-labelledby="quality-title">
        <div className="integrated-section-heading">
          <div>
            <p className="eyebrow">04 · Qualidade e limites</p>
            <h2 id="quality-title">O que exige atenção antes de interpretar?</h2>
          </div>
          <p>Zero significa que a verificação foi executada e não encontrou ocorrências.</p>
        </div>
        <dl className="integrated-quality-list">
          <div>
            <dt>Chaves eletrônicas informadas e inválidas</dt>
            <dd>{invalidKeys}</dd>
          </div>
          <div>
            <dt>Grupos de chaves duplicadas</dt>
            <dd>{duplicateKeys}</dd>
          </div>
          <div>
            <dt>Documentos sem itens nas respectivas fontes</dt>
            <dd>{documentsWithoutItems}</dd>
          </div>
          <div>
            <dt>Documentos sem data de emissão válida</dt>
            <dd>{missingDates}</dd>
          </div>
          <div>
            <dt>Correspondências ambíguas</dt>
            <dd>{matchCounts.AMBIGUO}</dd>
          </div>
        </dl>
        {[...icms.warnings, ...contributions.warnings].length > 0 && (
          <details className="integrated-warnings">
            <summary>Avisos de disponibilidade dos registros</summary>
            <ul>
              {Array.from(new Set([...icms.warnings, ...contributions.warnings])).map(
                (warning) => <li key={warning}>{warning}</li>,
              )}
            </ul>
          </details>
        )}
      </section>

      <p className="academic-disclaimer">
        Este protótipo possui finalidade acadêmica. Não transmite arquivos ao Fisco, não
        substitui os programas validadores oficiais e não constitui parecer contábil ou
        tributário.
      </p>
    </section>
  );
}
