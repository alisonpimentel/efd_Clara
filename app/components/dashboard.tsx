"use client";

import { useState } from "react";
import { downloadCsv } from "../../lib/sped/export";
import type {
  DashboardData,
  ManagementInsight,
  RankingItem,
  TrendPoint,
} from "../../lib/sped/types";

const moneyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});

const compactMoneyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});

const numberFormatter = new Intl.NumberFormat("pt-BR");
const percentFormatter = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  maximumFractionDigits: 1,
});

function money(value: number) {
  return moneyFormatter.format(value);
}

function dateLabel(value: string) {
  if (!value) return "não informado";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function Metric({
  label,
  value,
  note,
  tone = "default",
}: {
  label: string;
  value: string;
  note: string;
  tone?: "default" | "positive" | "attention";
}) {
  return (
    <article className={`metric metric-${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

function PanelHeading({
  kicker,
  title,
  question,
}: {
  kicker?: string;
  title: string;
  question: string;
}) {
  return (
    <div className="panel-heading">
      <div>
        {kicker && <span>{kicker}</span>}
        <h3>{title}</h3>
        <p>{question}</p>
      </div>
    </div>
  );
}

function BarList({
  title,
  question,
  values,
  emptyMessage,
  kicker,
  source,
}: {
  title: string;
  question: string;
  values: RankingItem[];
  emptyMessage: string;
  kicker?: string;
  source: string;
}) {
  const max = Math.max(...values.map((item) => item.value), 1);
  return (
    <section className="data-panel">
      <PanelHeading kicker={kicker} title={title} question={question} />
      {values.length ? (
        <ol className="bar-list">
          {values.map((item, index) => (
            <li key={`${item.label}-${index}`}>
              <div className="bar-label">
                <span title={item.label}>{item.label}</span>
                <strong>{money(item.value)}</strong>
              </div>
              <div className="bar-track" aria-hidden="true">
                <span style={{ width: `${Math.max((item.value / max) * 100, 3)}%` }} />
              </div>
              <small>
                {item.share !== undefined && (
                  <b>{percentFormatter.format(item.share)} do total</b>
                )}
                {item.detail && (
                  <span>
                    {item.share !== undefined ? " · " : ""}
                    {Number.isNaN(Number(item.detail))
                      ? item.detail
                      : `${numberFormatter.format(Number(item.detail))} ocorrência(s)`}
                  </span>
                )}
              </small>
            </li>
          ))}
        </ol>
      ) : (
        <div className="empty-chart">
          <strong>Sem dados para exibir</strong>
          <p>{emptyMessage}</p>
        </div>
      )}
      <p className="data-source">{source}</p>
    </section>
  );
}

function linePoints(
  values: number[],
  max: number,
  width: number,
  height: number,
  padding: number,
) {
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;
  return values
    .map((value, index) => {
      const x =
        values.length === 1
          ? width / 2
          : padding + (index / (values.length - 1)) * usableWidth;
      const y = height - padding - (value / max) * usableHeight;
      return `${x},${y}`;
    })
    .join(" ");
}

function TrendChart({ values }: { values: TrendPoint[] }) {
  const width = 760;
  const height = 300;
  const padding = 42;
  const max = Math.max(...values.flatMap((point) => [point.entries, point.exits]), 1);
  const entries = linePoints(
    values.map((point) => point.entries),
    max,
    width,
    height,
    padding,
  );
  const exits = linePoints(
    values.map((point) => point.exits),
    max,
    width,
    height,
    padding,
  );

  return (
    <section className="data-panel trend-panel">
      <PanelHeading
        kicker="Evolução no período"
        title="Entradas e saídas ao longo do tempo"
        question="Em quais datas as movimentações ganharam intensidade?"
      />
      {values.length ? (
        <>
          <div className="chart-legend" aria-hidden="true">
            <span className="entry-legend">Entradas</span>
            <span className="exit-legend">Saídas</span>
          </div>
          <svg
            className="trend-chart"
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-labelledby="trend-title trend-description"
          >
            <title id="trend-title">Evolução de entradas e saídas escrituradas</title>
            <desc id="trend-description">
              Série temporal dos valores de documentos válidos. Entradas em verde e saídas
              em amarelo.
            </desc>
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = height - padding - ratio * (height - padding * 2);
              return (
                <g key={ratio}>
                  <line
                    className="chart-grid-line"
                    x1={padding}
                    x2={width - padding}
                    y1={y}
                    y2={y}
                  />
                  <text x={padding - 8} y={y + 4} textAnchor="end">
                    {compactMoneyFormatter.format(max * ratio)}
                  </text>
                </g>
              );
            })}
            <polyline className="trend-line trend-entry" points={entries} />
            <polyline className="trend-line trend-exit" points={exits} />
            {values.map((point, index) => {
              const x =
                values.length === 1
                  ? width / 2
                  : padding + (index / (values.length - 1)) * (width - padding * 2);
              const showLabel =
                values.length <= 7 || index === 0 || index === values.length - 1;
              return (
                <g key={point.date}>
                  {showLabel && (
                    <text className="chart-date" x={x} y={height - 12} textAnchor="middle">
                      {dateLabel(point.date).slice(0, 5)}
                    </text>
                  )}
                  <circle
                    className="trend-dot trend-entry"
                    cx={x}
                    cy={
                      height -
                      padding -
                      (point.entries / max) * (height - padding * 2)
                    }
                    r="4"
                  />
                  <circle
                    className="trend-dot trend-exit"
                    cx={x}
                    cy={height - padding - (point.exits / max) * (height - padding * 2)}
                    r="4"
                  />
                </g>
              );
            })}
          </svg>
          <details className="chart-data-table">
            <summary>Ver valores exatos do gráfico</summary>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Entradas</th>
                    <th>Saídas</th>
                  </tr>
                </thead>
                <tbody>
                  {values.map((point) => (
                    <tr key={point.date}>
                      <td>{dateLabel(point.date)}</td>
                      <td>{money(point.entries)}</td>
                      <td>{money(point.exits)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      ) : (
        <div className="empty-chart">
          <strong>Datas indisponíveis</strong>
          <p>O arquivo não contém datas válidas para construir a evolução temporal.</p>
        </div>
      )}
      <p className="data-source">
        Fonte: registros C100 válidos, agrupados pela data do documento.
      </p>
    </section>
  );
}

function InsightPanel({ insights }: { insights: ManagementInsight[] }) {
  return (
    <section className="data-panel insight-panel">
      <PanelHeading
        kicker="Leitura orientada"
        title="O que merece atenção agora?"
        question="Pistas gerenciais geradas pelos dados disponíveis"
      />
      <div className="insight-list">
        {insights.map((insight) => (
          <article className={`insight insight-${insight.tone}`} key={insight.title}>
            <span aria-hidden="true" />
            <div>
              <strong>{insight.title}</strong>
              <p>{insight.description}</p>
            </div>
          </article>
        ))}
      </div>
      <p className="data-source">
        Leituras exploratórias; não substituem análise contábil, fiscal ou comercial.
      </p>
    </section>
  );
}

function CompositionBar({
  title,
  values,
}: {
  title: string;
  values: { label: string; value: number; className: string }[];
}) {
  const total = values.reduce((sum, item) => sum + item.value, 0);
  return (
    <div className="composition">
      <strong>{title}</strong>
      <div className="composition-track" role="img" aria-label={title}>
        {values.map((item) =>
          item.value > 0 ? (
            <span
              className={item.className}
              key={item.label}
              style={{ width: `${(item.value / total) * 100}%` }}
              title={`${item.label}: ${money(item.value)}`}
            />
          ) : null,
        )}
      </div>
      <ul>
        {values.map((item) => (
          <li key={item.label}>
            <i className={item.className} aria-hidden="true" />
            <span>{item.label}</span>
            <strong>{money(item.value)}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

type Tab = "overview" | "relationships" | "products" | "fiscal";

export function Dashboard({
  data,
  fileName,
  onReset,
}: {
  data: DashboardData;
  fileName: string;
  onReset: () => void;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const companyLabel = data.company.name || "Empresa não identificada";
  const period = `${dateLabel(data.company.startDate)} a ${dateLabel(data.company.endDate)}`;
  const cancellationRate =
    data.activeDocuments + data.cancelledDocuments
      ? data.cancelledDocuments / (data.activeDocuments + data.cancelledDocuments)
      : 0;

  return (
    <article className="dashboard-page">
      <div className="dashboard-toolbar">
        <div>
          <p className="eyebrow">Análise concluída</p>
          <h1>{companyLabel}</h1>
          <p>
            Período {period} · arquivo {fileName}
          </p>
        </div>
        <div className="toolbar-actions">
          <button className="secondary-button" type="button" onClick={() => downloadCsv(data)}>
            Exportar CSV
          </button>
          <button className="secondary-button" type="button" onClick={() => window.print()}>
            Salvar em PDF
          </button>
          <button className="primary-button compact" type="button" onClick={onReset}>
            Nova análise
          </button>
        </div>
      </div>

      <div className="interpretation-note">
        <strong>Leia assim:</strong> entradas e saídas representam documentos escriturados.
        A diferença entre elas não é lucro, prejuízo nem fluxo de caixa.
      </div>

      <nav className="dashboard-tabs" aria-label="Seções da análise">
        {[
          ["overview", "Visão executiva"],
          ["relationships", "Clientes e fornecedores"],
          ["products", "Produtos e estoque"],
          ["fiscal", "Fiscal e qualidade"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={tab === value ? "active" : ""}
            aria-current={tab === value ? "page" : undefined}
            onClick={() => setTab(value as Tab)}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === "overview" && (
        <div className="dashboard-section">
          <div className="section-intro">
            <p className="eyebrow">Pergunta central</p>
            <h2>Qual é o retrato das movimentações deste período?</h2>
          </div>
          <div className="metrics-grid">
            <Metric
              label="Entradas escrituradas"
              value={money(data.totalEntries)}
              note={`Ticket médio de entrada: ${money(data.averageEntryTicket)}`}
            />
            <Metric
              label="Saídas escrituradas"
              value={money(data.totalExits)}
              note={`Ticket médio de saída: ${money(data.averageExitTicket)}`}
              tone="positive"
            />
            <Metric
              label="Diferença operacional"
              value={money(data.operationDifference)}
              note="Saídas menos entradas; não equivale a resultado"
              tone={data.operationDifference < 0 ? "attention" : "default"}
            />
            <Metric
              label="Documentos válidos"
              value={numberFormatter.format(data.activeDocuments)}
              note={`${data.cancelledDocuments} cancelado(s), taxa de ${percentFormatter.format(cancellationRate)}`}
            />
            <Metric
              label="Clientes identificados"
              value={numberFormatter.format(data.uniqueCustomers)}
              note={`${percentFormatter.format(data.customerConcentration)} das saídas nos 3 maiores`}
            />
            <Metric
              label="Fornecedores identificados"
              value={numberFormatter.format(data.uniqueSuppliers)}
              note={`${percentFormatter.format(data.supplierConcentration)} das entradas nos 3 maiores`}
            />
          </div>

          <div className="dashboard-grid dashboard-grid-wide">
            <TrendChart values={data.trend} />
            <InsightPanel insights={data.insights} />
          </div>
        </div>
      )}

      {tab === "relationships" && (
        <div className="dashboard-section">
          <div className="section-intro">
            <p className="eyebrow">Concentração comercial</p>
            <h2>A empresa depende de poucos clientes ou fornecedores?</h2>
            <p>
              Participações altas não são um erro, mas ajudam a direcionar negociação,
              crédito e diversificação.
            </p>
          </div>
          <div className="concentration-grid">
            <Metric
              label="3 maiores fornecedores"
              value={percentFormatter.format(data.supplierConcentration)}
              note="Participação nas entradas escrituradas"
              tone={data.supplierConcentration >= 0.5 ? "attention" : "default"}
            />
            <Metric
              label="3 maiores clientes"
              value={percentFormatter.format(data.customerConcentration)}
              note="Participação nas saídas escrituradas"
              tone={data.customerConcentration >= 0.5 ? "attention" : "default"}
            />
          </div>
          <div className="dashboard-grid">
            <BarList
              kicker="Entradas"
              title="Principais fornecedores"
              question="Quem concentra o maior valor registrado?"
              values={data.topSuppliers}
              emptyMessage="O arquivo não relacionou participantes aos documentos de entrada."
              source="Fonte: participantes 0150 associados aos documentos C100 de entrada."
            />
            <BarList
              kicker="Saídas"
              title="Principais clientes"
              question="Quem concentra o maior valor registrado?"
              values={data.topCustomers}
              emptyMessage="O arquivo não relacionou participantes aos documentos de saída."
              source="Fonte: participantes 0150 associados aos documentos C100 de saída."
            />
          </div>
        </div>
      )}

      {tab === "products" && (
        <div className="dashboard-section">
          <div className="section-intro">
            <p className="eyebrow">Movimentação e inventário</p>
            <h2>Quais itens concentram valor e o que consta no estoque declarado?</h2>
          </div>
          <div className="dashboard-grid">
            <BarList
              kicker="Entradas"
              title="Produtos mais adquiridos"
              question="Quais itens representam mais valor nas entradas?"
              values={data.topPurchasedProducts}
              emptyMessage="Os registros C170 de entrada não estão disponíveis neste arquivo."
              source="Fonte: itens C170 dos documentos de entrada válidos."
            />
            <BarList
              kicker="Saídas"
              title="Produtos movimentados nas saídas"
              question="Quais itens representam mais valor nas saídas?"
              values={data.topSoldProducts}
              emptyMessage="Os registros C170 de saída não estão disponíveis neste arquivo."
              source="Fonte: itens C170 dos documentos de saída válidos."
            />
          </div>

          {data.inventory ? (
            <div className="inventory-grid">
              <section className="data-panel inventory-summary">
                <PanelHeading
                  kicker={`Inventário em ${dateLabel(data.inventory.date)}`}
                  title="Estoque declarado no Bloco H"
                  question="Quanto foi informado e onde está a propriedade?"
                />
                <div className="inventory-number">
                  <strong>{money(data.inventory.totalValue)}</strong>
                  <span>
                    {numberFormatter.format(data.inventory.itemCount)} item(ns) · motivo{" "}
                    {data.inventory.reason || "não informado"}
                  </span>
                </div>
                <CompositionBar
                  title="Composição por indicador de propriedade"
                  values={[
                    {
                      label: "Próprio em posse",
                      value: data.inventory.ownership.own,
                      className: "composition-own",
                    },
                    {
                      label: "Próprio com terceiros",
                      value: data.inventory.ownership.ownWithThirdParty,
                      className: "composition-away",
                    },
                    {
                      label: "De terceiros em posse",
                      value: data.inventory.ownership.thirdParty,
                      className: "composition-third",
                    },
                    {
                      label: "Não classificado",
                      value: data.inventory.ownership.unknown,
                      className: "composition-unknown",
                    },
                  ]}
                />
                <p className="data-source">Fonte: registros H005 e H010.</p>
              </section>
              <BarList
                kicker="Inventário"
                title="Itens de maior valor"
                question="Quais itens mais pesam no inventário informado?"
                values={data.inventory.topItems}
                emptyMessage="O inventário não possui itens H010 detalhados."
                source="Fonte: valor informado por item no H010."
              />
            </div>
          ) : (
            <section className="availability-note">
              <strong>Inventário não disponível neste arquivo</strong>
              <p>
                O Bloco H costuma ser informado em situações e períodos específicos. O painel
                continua válido para documentos e itens disponíveis.
              </p>
            </section>
          )}
        </div>
      )}

      {tab === "fiscal" && (
        <div className="dashboard-section">
          <div className="section-intro">
            <p className="eyebrow">Leitura fiscal-contábil</p>
            <h2>O que o arquivo informa sobre ICMS e qualidade da escrituração?</h2>
          </div>
          {data.assessment ? (
            <section className="assessment-panel">
              <div className="assessment-heading">
                <div>
                  <p className="eyebrow">Apuração própria · E110</p>
                  <h3>Resumo do ICMS do período</h3>
                  <p>
                    {dateLabel(data.assessment.periodStart)} a{" "}
                    {dateLabel(data.assessment.periodEnd)}
                  </p>
                </div>
                <div className="assessment-result">
                  <span>ICMS a recolher informado</span>
                  <strong>{money(data.assessment.icmsToCollect)}</strong>
                </div>
              </div>
              <div className="assessment-metrics">
                <Metric
                  label="Total de débitos"
                  value={money(data.assessment.totalDebits)}
                  note="Valor informado no E110"
                />
                <Metric
                  label="Total de créditos"
                  value={money(data.assessment.totalCredits)}
                  note="Valor informado no E110"
                />
                <Metric
                  label="Saldo credor anterior"
                  value={money(data.assessment.priorCreditBalance)}
                  note="Crédito trazido do período anterior"
                />
                <Metric
                  label="Saldo devedor apurado"
                  value={money(data.assessment.assessedBalance)}
                  note="Antes das deduções informadas"
                />
                <Metric
                  label="Deduções"
                  value={money(data.assessment.totalDeductions)}
                  note="Total declarado no registro"
                />
                <Metric
                  label="Crédito a transportar"
                  value={money(data.assessment.creditToCarry)}
                  note="Saldo para o período seguinte"
                />
              </div>
              <p className="data-source">
                Valores declarados no registro E110; o protótipo não recalcula a obrigação.
              </p>
            </section>
          ) : (
            <section className="availability-note">
              <strong>Apuração E110 não encontrada</strong>
              <p>
                Sem esse registro, o painel não apresenta ICMS a recolher nem saldo credor.
                Os valores de operações continuam disponíveis.
              </p>
            </section>
          )}

          <div className="dashboard-grid">
            <section className="data-panel">
              <PanelHeading
                kicker="ICMS nas operações"
                title="Entradas versus saídas"
                question="Onde está o ICMS destacado nos resumos por CFOP?"
              />
              <div className="fiscal-comparison">
                <Metric
                  label="ICMS nas entradas"
                  value={money(data.icmsOnEntries)}
                  note="Soma dos C190 de entrada"
                />
                <Metric
                  label="ICMS nas saídas"
                  value={money(data.icmsOnExits)}
                  note="Soma dos C190 de saída"
                  tone="positive"
                />
              </div>
              <p className="fiscal-explainer">
                Esses destaques ajudam a conferir a composição das operações, mas não
                substituem a apuração do E110.
              </p>
              <p className="data-source">Fonte: campo VL_ICMS dos registros C190.</p>
            </section>
            <BarList
              kicker="Natureza das operações"
              title="Operações por CFOP"
              question="Quais códigos concentram mais valor?"
              values={data.cfopRanking}
              emptyMessage="Os resumos C190 não estão disponíveis neste arquivo."
              source="Fonte: valor de operação informado no C190."
            />
          </div>

          <section className="data-panel quality-panel">
            <PanelHeading
              kicker="Confiabilidade da leitura"
              title="Qualidade para esta análise"
              question="Quais pontos podem limitar ou exigir conciliação?"
            />
            <dl>
              <div>
                <dt>Documentos sem participante identificado</dt>
                <dd>{data.quality.documentsWithoutParticipant}</dd>
              </div>
              <div>
                <dt>Itens sem código de produto</dt>
                <dd>{data.quality.itemsWithoutProduct}</dd>
              </div>
              <div>
                <dt>Documentos sem data válida</dt>
                <dd>{data.quality.documentsWithoutDate}</dd>
              </div>
              <div>
                <dt>Diferença absoluta entre totais C100 e C190</dt>
                <dd>{money(data.quality.c100C190Difference)}</dd>
              </div>
            </dl>
            <p className="quality-context">
              Uma diferença entre C100 e C190 não é classificada automaticamente como erro.
              Desde 2026, componentes ligados à reforma tributária podem afetar a conciliação
              entre os valores dos documentos e das operações registrados na EFD ICMS/IPI.
            </p>
            {data.warnings.length > 0 && (
              <div className="warning-list">
                <strong>Avisos do arquivo</strong>
                <ul>
                  {data.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>
      )}

      <details className="technical-details">
        <summary>Ver detalhes técnicos da análise</summary>
        <dl>
          <div>
            <dt>Linhas processadas</dt>
            <dd>{numberFormatter.format(data.technical.lineCount)}</dd>
          </div>
          <div>
            <dt>Documentos encontrados</dt>
            <dd>{numberFormatter.format(data.technical.documentCount)}</dd>
          </div>
          <div>
            <dt>Itens considerados</dt>
            <dd>{numberFormatter.format(data.technical.itemCount)}</dd>
          </div>
          <div>
            <dt>Apurações E110</dt>
            <dd>{numberFormatter.format(data.technical.assessmentCount)}</dd>
          </div>
          <div>
            <dt>Inventários H005</dt>
            <dd>{numberFormatter.format(data.technical.inventoryCount)}</dd>
          </div>
          <div>
            <dt>Mecanismo</dt>
            <dd>{data.technical.engine}</dd>
          </div>
        </dl>
      </details>
    </article>
  );
}
