"use client";

import { useState } from "react";
import { downloadCsv } from "../../lib/sped/export";
import type {
  AverageUnitValue,
  DashboardData,
  GeographicShare,
  ManagementInsight,
  RankingItem,
  TrendPoint,
  WeekdayActivity,
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

function moneyOrUnavailable(value: number | null) {
  return value === null ? "Não disponível" : money(value);
}

function numberOrUnavailable(value: number | null) {
  return value === null ? "Não disponível" : numberFormatter.format(value);
}

function percentOrUnavailable(value: number | null) {
  return value === null ? "Não disponível" : percentFormatter.format(value);
}

function dateLabel(value: string) {
  if (!value) return "não informado";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function taxIdLabel(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 14) {
    return digits.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      "$1.$2.$3/$4-$5",
    );
  }
  if (digits.length === 11) {
    return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  }
  return value || "não informado";
}

function maskedCpf(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 11) return value ? "documento informado" : "não informado";
  return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
}

function postalCodeLabel(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length === 8 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : value;
}

function phoneLabel(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return value;
}

function addressLabel(address: {
  postalCode: string;
  street: string;
  number: string;
  complement: string;
  district: string;
}) {
  const line = [
    address.street,
    address.number,
    address.complement,
    address.district,
  ].filter(Boolean);
  const postalCode = postalCodeLabel(address.postalCode);
  return [...line, postalCode ? `CEP ${postalCode}` : ""].filter(Boolean).join(", ");
}

const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

function competenceLabel(start: string, end: string) {
  if (start && end && start.slice(0, 7) === end.slice(0, 7)) {
    const [year, month] = start.split("-");
    return `${MONTHS[Number(month) - 1]} de ${year}`;
  }
  return `${dateLabel(start)} a ${dateLabel(end)}`;
}

function activityLabel(value: string) {
  if (value === "0") return "Industrial ou equiparado";
  if (value === "1") return "Outros estabelecimentos";
  return "não informada";
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

function ItemAvailabilityRow({
  direction,
  value,
}: {
  direction: "entradas" | "saídas";
  value: DashboardData["quality"]["entryItemAvailability"];
}) {
  return (
    <div>
      <dt>Itens C170 disponíveis nas {direction}</dt>
      <dd>
        {value.totalDocuments
          ? `${numberFormatter.format(value.documentsWithItems)} de ${numberFormatter.format(value.totalDocuments)} com itens`
          : "sem documentos"}
        <small>
          {value.totalDocuments
            ? `${percentOrUnavailable(value.rate)} de disponibilidade total para análise por produto`
            : "não há base para calcular disponibilidade"}
        </small>
        <small className="eligibility-result">
          {value.eligibleRate === null
            ? "Cobertura entre documentos elegíveis: não aplicável — nenhum documento no denominador"
            : `${percentFormatter.format(value.eligibleRate)} entre documentos elegíveis (${numberFormatter.format(value.documentsWithItems)} de ${numberFormatter.format(value.eligibleDocuments)})`}
        </small>
        {value.electronicOwnIssueWithoutItems > 0 && (
          <small>
            {numberFormatter.format(value.electronicOwnIssueWithoutItems)} NF-e/NFC-e de
            emissão própria sem C170 — ausência geralmente esperada
          </small>
        )}
        {value.otherWithoutItems > 0 && (
          <small>
            {numberFormatter.format(value.otherWithoutItems)} documento(s) sem itens requer(em)
            conferência do modelo e da situação
          </small>
        )}
      </dd>
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

function AbcPanel({
  title,
  question,
  values,
  source,
}: {
  title: string;
  question: string;
  values: RankingItem[];
  source: string;
}) {
  return (
    <section className="data-panel abc-panel">
      <PanelHeading kicker="Curva ABC" title={title} question={question} />
      {values.length ? (
        <div className="abc-table-wrap">
          <table className="abc-table">
            <thead>
              <tr>
                <th>Posição</th>
                <th>Nome</th>
                <th>Valor</th>
                <th>Participação</th>
                <th>Acumulado</th>
                <th>Classe</th>
              </tr>
            </thead>
            <tbody>
              {values.slice(0, 10).map((item, index) => (
                <tr key={`${item.label}-${index}`}>
                  <td>{index + 1}</td>
                  <td title={item.label}>{item.label}</td>
                  <td>{money(item.value)}</td>
                  <td>{percentFormatter.format(item.share ?? 0)}</td>
                  <td>
                    <span className="abc-progress">
                      <i
                        style={{
                          width: `${Math.min((item.cumulativeShare ?? 0) * 100, 100)}%`,
                        }}
                      />
                    </span>
                    <small>{percentFormatter.format(item.cumulativeShare ?? 0)}</small>
                  </td>
                  <td>
                    <b className={`abc-badge abc-${item.abcClass?.toLowerCase()}`}>
                      {item.abcClass}
                    </b>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-chart">
          <strong>Curva indisponível</strong>
          <p>Não existem valores suficientes para classificar esta competência.</p>
        </div>
      )}
      <p className="data-source">{source}</p>
    </section>
  );
}

const geographyColors: Record<GeographicShare["category"], string> = {
  internal: "#0e675e",
  interstate: "#d6b316",
  foreign: "#d7654f",
  unclassified: "#9aa9a4",
};

function GeographicChart({ values }: { values: GeographicShare[] }) {
  const stops = values.map((item, index) => {
    const start =
      values.slice(0, index).reduce((sum, previous) => sum + previous.share, 0) * 100;
    const end = start + item.share * 100;
    return `${geographyColors[item.category]} ${start}% ${end}%`;
  });
  const label = values
    .map((item) => `${item.label}: ${percentFormatter.format(item.share)}`)
    .join("; ");

  return (
    <section className="data-panel geography-panel">
      <PanelHeading
        kicker="Abrangência por CFOP"
        title="Internas, interestaduais e exterior"
        question="De onde vem o valor das saídas escrituradas?"
      />
      {values.length ? (
        <div className="geography-content">
          <div
            className="donut-chart"
            role="img"
            aria-label={label}
            style={{
              background: `conic-gradient(${stops.join(", ")})`,
            }}
          >
            <span>
              <strong>{percentFormatter.format(values[0]?.share ?? 0)}</strong>
              <small>maior faixa</small>
            </span>
          </div>
          <ul className="geography-legend">
            {values.map((item) => (
              <li key={item.category}>
                <i style={{ background: geographyColors[item.category] }} aria-hidden="true" />
                <span>
                  <strong>{item.label}</strong>
                  <small>{money(item.value)}</small>
                </span>
                <b>{percentFormatter.format(item.share)}</b>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="empty-chart">
          <strong>Classificação indisponível</strong>
          <p>O arquivo não possui resumos C190 de saída com CFOP.</p>
        </div>
      )}
      <p className="data-source">
        Fonte: valores C190 de saída classificados pelo primeiro dígito do CFOP. Não
        equivale ao faturamento contábil.
      </p>
    </section>
  );
}

function AverageUnitPanel({ values }: { values: AverageUnitValue[] }) {
  const max = Math.max(...values.map((item) => item.averageValue), 1);
  return (
    <section className="data-panel unit-value-panel">
      <PanelHeading
        kicker="Valor médio ponderado"
        title="Valor escriturado por unidade"
        question="Quais itens apresentam maior valor médio na unidade informada?"
      />
      {values.length ? (
        <ol className="unit-value-list">
          {values.map((item, index) => (
            <li key={`${item.label}-${item.unit}-${item.operation}-${index}`}>
              <div>
                <span className={`operation-tag operation-${item.operation}`}>
                  {item.operation === "entry" ? "Entrada" : "Saída"}
                </span>
                <strong title={item.label}>{item.label}</strong>
                <small>
                  {numberFormatter.format(item.quantity)} {item.unit} · total{" "}
                  {money(item.totalValue)}
                </small>
              </div>
              <div className="unit-value-result">
                <strong>{money(item.averageValue)}</strong>
                <small>por {item.unit}</small>
                <span aria-hidden="true">
                  <i style={{ width: `${(item.averageValue / max) * 100}%` }} />
                </span>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <div className="empty-chart">
          <strong>Valor médio indisponível</strong>
          <p>São necessários itens C170 com quantidade maior que zero.</p>
        </div>
      )}
      <p className="data-source">
        Fórmula: soma de VL_ITEM ÷ soma de QTD, sem misturar unidades. É valor
        escriturado, não preço comercial nem margem.
      </p>
    </section>
  );
}

function WeekdayChart({ values }: { values: WeekdayActivity[] }) {
  const max = Math.max(...values.map((item) => item.averageValue), 1);
  return (
    <section className="data-panel weekday-panel">
      <PanelHeading
        kicker="Ritmo da competência"
        title="Saídas por dia da semana"
        question="Em quais dias ocorre maior valor médio de emissão?"
      />
      {values.length ? (
        <div className="weekday-chart">
          {values.map((item) => (
            <div key={item.weekday}>
              <span>{item.label.slice(0, 3)}</span>
              <div className="weekday-track">
                <i
                  style={{ height: `${Math.max((item.averageValue / max) * 100, item.averageValue ? 5 : 0)}%` }}
                  title={`${item.label}: ${money(item.averageValue)} por ocorrência do dia na competência`}
                />
              </div>
              <strong>{compactMoneyFormatter.format(item.averageValue)}</strong>
              <small>{numberFormatter.format(item.documentCount)} doc.</small>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-chart">
          <strong>Distribuição não disponível</strong>
          <p>São necessárias saídas C100 com data válida e uma competência identificada.</p>
        </div>
      )}
      <p className="data-source">
        Média por ocorrência de cada dia na competência, incluindo dias sem emissão. É
        distribuição semanal do período, não sazonalidade histórica.
      </p>
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
  const period =
    data.company.startDate && data.company.endDate
      ? `${dateLabel(data.company.startDate)} a ${dateLabel(data.company.endDate)}`
      : "não informado";
  const companyAddress = addressLabel(data.company.address);
  const accountantAddress = data.accountant ? addressLabel(data.accountant.address) : "";
  const cancellationRate =
    data.activeDocuments + data.cancelledDocuments
      ? data.cancelledDocuments / (data.activeDocuments + data.cancelledDocuments)
      : null;

  return (
    <article className="dashboard-page">
      <div className="dashboard-toolbar">
        <div>
          <p className="eyebrow">Análise concluída</p>
          <h1>{companyLabel}</h1>
          <p>
            {period === "não informado" ? "Período não informado" : `Período ${period}`} ·
            arquivo {fileName}
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

      <section className="identity-panel" aria-labelledby="identity-title">
        <div className="identity-heading">
          <div>
            <p className="eyebrow">Registros iniciais da EFD</p>
            <h2 id="identity-title">Identificação da escrituração</h2>
          </div>
          <p>
            Confira estes dados antes da análise. Eles foram lidos dos registros 0000,
            0005 e 0100.
          </p>
        </div>
        <div className="identity-grid">
          <article className="identity-card identity-company">
            <span>Empresa informante</span>
            <h3>{data.company.tradeName || companyLabel}</h3>
            {data.company.tradeName && <p>{companyLabel}</p>}
            <dl>
              <div>
                <dt>{data.company.document.length === 11 ? "CPF" : "CNPJ"}</dt>
                <dd>{taxIdLabel(data.company.document)}</dd>
              </div>
              <div>
                <dt>Inscrição estadual</dt>
                <dd>{data.company.stateRegistration || "não informada"}</dd>
              </div>
              <div>
                <dt>UF</dt>
                <dd>{data.company.state || "não informada"}</dd>
              </div>
              <div>
                <dt>Município IBGE</dt>
                <dd>{data.company.municipalityCode || "não informado"}</dd>
              </div>
            </dl>
            <div className="identity-contact">
              <strong>Endereço cadastrado</strong>
              <p>{companyAddress || "Não informado no registro 0005."}</p>
              {(data.company.phone || data.company.email) && (
                <p>
                  {[phoneLabel(data.company.phone), data.company.email]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
            </div>
          </article>

          <article className="identity-card identity-period">
            <span>Competência</span>
            <strong>{competenceLabel(data.company.startDate, data.company.endDate)}</strong>
            <dl>
              <div>
                <dt>Período exato</dt>
                <dd>{period}</dd>
              </div>
              <div>
                <dt>Perfil</dt>
                <dd>{data.company.profile ? `Perfil ${data.company.profile}` : "não informado"}</dd>
              </div>
              <div>
                <dt>Atividade</dt>
                <dd>{activityLabel(data.company.activityIndicator)}</dd>
              </div>
              {data.company.municipalRegistration && (
                <div>
                  <dt>Inscrição municipal</dt>
                  <dd>{data.company.municipalRegistration}</dd>
                </div>
              )}
              {data.company.suframa && (
                <div>
                  <dt>SUFRAMA</dt>
                  <dd>{data.company.suframa}</dd>
                </div>
              )}
            </dl>
          </article>

          <article className="identity-card identity-accountant">
            <span>Contabilista responsável</span>
            {data.accountant ? (
              <>
                <h3>{data.accountant.name || "Nome não informado"}</h3>
                <dl>
                  <div>
                    <dt>CRC</dt>
                    <dd>{data.accountant.crc || "não informado"}</dd>
                  </div>
                  <div>
                    <dt>CPF protegido</dt>
                    <dd>{maskedCpf(data.accountant.document)}</dd>
                  </div>
                  {data.accountant.officeDocument && (
                    <div>
                      <dt>CNPJ do escritório</dt>
                      <dd>{taxIdLabel(data.accountant.officeDocument)}</dd>
                    </div>
                  )}
                </dl>
                <div className="identity-contact">
                  {accountantAddress && <p>{accountantAddress}</p>}
                  {(data.accountant.phone || data.accountant.email) && (
                    <p>
                      {[phoneLabel(data.accountant.phone), data.accountant.email]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="identity-empty">
                <strong>Registro 0100 não encontrado</strong>
                <p>O arquivo não informou os dados do contabilista responsável.</p>
              </div>
            )}
          </article>
        </div>
        <p className="identity-source">
          Os dados desta seção permanecem no navegador e não são enviados ao cadastro de
          interessados.
        </p>
      </section>

      <div className="interpretation-note">
        <strong>Leia assim:</strong> entradas e saídas representam documentos escriturados.
        A diferença entre elas não é lucro, prejuízo nem fluxo de caixa.
      </div>

      <nav className="dashboard-tabs" aria-label="Seções da análise">
        {[
          ["overview", "Visão executiva"],
          ["relationships", "Clientes e fornecedores"],
          ["products", "Produtos e estoque"],
          ["fiscal", "ICMS e limites"],
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
              value={moneyOrUnavailable(data.totalEntries)}
              note={
                data.averageEntryTicket === null
                  ? "Ticket médio não calculado: não há entrada C100 válida"
                  : `Ticket médio de entrada: ${money(data.averageEntryTicket)}`
              }
            />
            <Metric
              label="Saídas escrituradas"
              value={moneyOrUnavailable(data.totalExits)}
              note={
                data.averageExitTicket === null
                  ? "Ticket médio não calculado: não há saída C100 válida"
                  : `Ticket médio de saída: ${money(data.averageExitTicket)}`
              }
              tone="positive"
            />
            <Metric
              label="Diferença operacional"
              value={moneyOrUnavailable(data.operationDifference)}
              note={
                data.operationDifference === null
                  ? "Não calculada: registros C100 não disponíveis"
                  : "Saídas menos entradas; não equivale a resultado"
              }
              tone={
                data.operationDifference !== null && data.operationDifference < 0
                  ? "attention"
                  : "default"
              }
            />
            <Metric
              label="Documentos válidos"
              value={numberFormatter.format(data.activeDocuments)}
              note={
                cancellationRate === null
                  ? "Nenhum documento C100 encontrado"
                  : `${data.cancelledDocuments} cancelado(s), taxa de ${percentFormatter.format(cancellationRate)}`
              }
            />
            <Metric
              label="Clientes identificados"
              value={numberOrUnavailable(data.uniqueCustomers)}
              note={
                data.customerConcentration === null
                  ? "Concentração não calculada: não há base monetária de saídas"
                  : `${percentFormatter.format(data.customerConcentration)} das saídas nos 3 maiores`
              }
            />
            <Metric
              label="Fornecedores identificados"
              value={numberOrUnavailable(data.uniqueSuppliers)}
              note={
                data.supplierConcentration === null
                  ? "Concentração não calculada: não há base monetária de entradas"
                  : `${percentFormatter.format(data.supplierConcentration)} das entradas nos 3 maiores`
              }
            />
          </div>

          <div className="dashboard-grid dashboard-grid-overview">
            <TrendChart values={data.trend} />
            <InsightPanel insights={data.insights} />
          </div>
          <div className="dashboard-grid">
            <WeekdayChart values={data.weekdayActivity} />
            <section className="data-panel cancellation-panel">
              <PanelHeading
                kicker="Qualidade operacional"
                title="Cancelamentos por direção"
                question="Os cancelamentos estão nas entradas ou nas saídas?"
              />
              <div className="cancellation-comparison">
                <Metric
                  label="Entradas canceladas"
                  value={percentOrUnavailable(data.cancellations.entry.rate)}
                  note={
                    data.cancellations.entry.rate === null
                      ? "Não há documentos C100 de entrada no denominador"
                      : `${data.cancellations.entry.cancelled} de ${data.cancellations.entry.total} documento(s)`
                  }
                  tone={
                    data.cancellations.entry.rate !== null &&
                    data.cancellations.entry.rate >= 0.05
                      ? "attention"
                      : "default"
                  }
                />
                <Metric
                  label="Saídas canceladas"
                  value={percentOrUnavailable(data.cancellations.exit.rate)}
                  note={
                    data.cancellations.exit.rate === null
                      ? "Não há documentos C100 de saída no denominador"
                      : `${data.cancellations.exit.cancelled} de ${data.cancellations.exit.total} documento(s)`
                  }
                  tone={
                    data.cancellations.exit.rate !== null &&
                    data.cancellations.exit.rate >= 0.05
                      ? "attention"
                      : "default"
                  }
                />
              </div>
              <p className="fiscal-explainer">
                O indicador mede quantidade de documentos com situação cancelada. Ele não
                identifica a causa nem avalia a regularidade do cancelamento.
              </p>
              <p className="data-source">Fonte: IND_OPER e COD_SIT dos registros C100.</p>
            </section>
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
              value={percentOrUnavailable(data.supplierConcentration)}
              note={
                data.supplierConcentration === null
                  ? "Sem base monetária de entradas para calcular"
                  : "Participação nas entradas escrituradas"
              }
              tone={
                data.supplierConcentration !== null &&
                data.supplierConcentration >= 0.5
                  ? "attention"
                  : "default"
              }
            />
            <Metric
              label="3 maiores clientes"
              value={percentOrUnavailable(data.customerConcentration)}
              note={
                data.customerConcentration === null
                  ? "Sem base monetária de saídas para calcular"
                  : "Participação nas saídas escrituradas"
              }
              tone={
                data.customerConcentration !== null &&
                data.customerConcentration >= 0.5
                  ? "attention"
                  : "default"
              }
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
          <div className="dashboard-grid dashboard-grid-wide">
            <AbcPanel
              title="Concentração das saídas por cliente"
              question="Quanto do valor acumulado depende dos principais clientes?"
              values={data.customerAbc}
              source="Fonte: C100 de saída e participantes 0150. Classes A até 80%, B até 95% e C no restante."
            />
            <GeographicChart values={data.geographicShares} />
          </div>
        </div>
      )}

      {tab === "products" && (
        <div className="dashboard-section">
          <div className="section-intro">
            <p className="eyebrow">Movimentação e inventário</p>
            <h2>Quais itens concentram valor e o que consta no estoque declarado?</h2>
          </div>
          <div className="metrics-grid">
            <Metric
              label="SKUs movimentados"
              value={
                data.technical.itemCount > 0
                  ? numberFormatter.format(data.skuActivity.moved)
                  : "Não disponível"
              }
              note={
                data.technical.itemCount > 0
                  ? "Itens distintos com entrada ou saída no C170"
                  : "O arquivo não possui itens C170 analisáveis"
              }
            />
            <Metric
              label="SKUs com saída"
              value={
                data.skuActivity.soldShareOfMoved === null
                  ? "Não disponível"
                  : numberFormatter.format(data.skuActivity.sold)
              }
              note={
                data.skuActivity.soldShareOfMoved === null
                  ? "Não há SKUs movimentados no denominador"
                  : `${percentFormatter.format(data.skuActivity.soldShareOfMoved)} dos itens movimentados`
              }
              tone="positive"
            />
            <Metric
              label="SKUs com entrada"
              value={
                data.technical.itemCount > 0
                  ? numberFormatter.format(data.skuActivity.purchased)
                  : "Não disponível"
              }
              note={
                data.technical.itemCount > 0
                  ? "Não equivale ao catálogo completo do ERP"
                  : "O arquivo não possui itens C170 analisáveis"
              }
            />
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
          <div className="dashboard-grid dashboard-grid-wide">
            <AbcPanel
              title="Concentração das saídas por produto"
              question="Quais itens formam a maior parcela do valor acumulado?"
              values={data.productAbc}
              source="Fonte: itens C170 de saída. A classificação descreve valor escriturado e não margem."
            />
            <AverageUnitPanel values={data.averageUnitValues} />
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
            <h2>O que o arquivo informa sobre ICMS e os limites da análise?</h2>
            <p>
              Esta visão reproduz valores declarados e cria proporções descritivas. Ela não
              determina direito ao crédito nem recalcula a obrigação tributária.
            </p>
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
                  value={moneyOrUnavailable(data.icmsOnEntries)}
                  note={
                    data.icmsOnEntries === null
                      ? "Não há C190 de entrada para somar"
                      : "Soma dos C190 de entrada"
                  }
                />
                <Metric
                  label="ICMS nas saídas"
                  value={moneyOrUnavailable(data.icmsOnExits)}
                  note={
                    data.icmsOnExits === null
                      ? "Não há C190 de saída para somar"
                      : "Soma dos C190 de saída"
                  }
                  tone="positive"
                />
              </div>
              <p className="fiscal-explainer">
                Esses destaques ajudam a conferir a composição das operações, mas não
                substituem a apuração do E110.
              </p>
              <p className="data-source">Fonte: campo VL_ICMS dos registros C190.</p>
            </section>
            <section className="data-panel icms-indicators-panel">
              <PanelHeading
                kicker="Indicadores descritivos"
                title="Crédito informado e carga aparente"
                question="Que proporções podem orientar uma conferência do período?"
              />
              <div className="fiscal-comparison">
                <Metric
                  label="Entradas com ICMS informado"
                  value={percentOrUnavailable(data.icmsCreditEntryShare)}
                  note={
                    data.icmsCreditEntryShare === null
                      ? "Não há base monetária C190 de entrada no denominador"
                      : `${money(data.icmsCreditEntryValue)} de ${money(data.totalEntryOperationValue)} nos C190`
                  }
                  tone="positive"
                />
                <Metric
                  label="ICMS a recolher ÷ saídas"
                  value={percentOrUnavailable(data.apparentIcmsBurden)}
                  note={
                    data.apparentIcmsBurden === null
                      ? "Exige E110 e valor positivo de saídas C100"
                      : "Indicador aparente; não é alíquota efetiva"
                  }
                />
              </div>
              <p className="fiscal-explainer">
                “Entradas com ICMS informado” considera operações de entrada cujo C190
                possui VL_ICMS maior que zero. Não é uma conclusão jurídica sobre direito
                ao crédito.
              </p>
              <p className="data-source">
                Fonte: C190 e E110. Denominadores usam valores escriturados disponíveis.
              </p>
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
              kicker="Limites e consistência"
              title="Disponibilidade dos dados da análise"
              question="O que foi lido integralmente e quais análises dependem de registros opcionais?"
            />
            <dl>
              <div>
                <dt>Documentos sem participante identificado</dt>
                <dd>
                  {data.technical.documentCount > 0
                    ? data.quality.documentsWithoutParticipant
                    : "Não disponível"}
                </dd>
              </div>
              <div>
                <dt>Itens sem código de produto</dt>
                <dd>
                  {data.technical.itemCount > 0
                    ? data.quality.itemsWithoutProduct
                    : "Não disponível"}
                </dd>
              </div>
              <div>
                <dt>Documentos sem data válida</dt>
                <dd>
                  {data.technical.documentCount > 0
                    ? data.quality.documentsWithoutDate
                    : "Não disponível"}
                </dd>
              </div>
              <div>
                <dt>Movimentos fora da competência de referência</dt>
                <dd>
                  {numberOrUnavailable(data.quality.documentsOutsideReferencePeriod)}
                  <small>DT_E_S; quando ausente, utiliza DT_DOC</small>
                </dd>
              </div>
              <div>
                <dt>Emissões anteriores escrituradas no período</dt>
                <dd>
                  {numberOrUnavailable(data.quality.priorIssueDocumentsInPeriod)}
                  <small>DT_DOC anterior, com entrada/saída registrada na competência</small>
                </dd>
              </div>
              <ItemAvailabilityRow
                direction="entradas"
                value={data.quality.entryItemAvailability}
              />
              <ItemAvailabilityRow
                direction="saídas"
                value={data.quality.exitItemAvailability}
              />
              <div>
                <dt>Diferença absoluta entre totais C100 e C190</dt>
                <dd>
                  {moneyOrUnavailable(data.quality.c100C190Difference)}
                  {data.quality.c100C190Difference === null && (
                    <small>Exige a presença simultânea de C100 e C190</small>
                  )}
                </dd>
              </div>
            </dl>
            <aside className="availability-explainer" aria-label="Como interpretar o C170">
              <strong>C170 não é uma nota de qualidade.</strong>
              <p>
                A disponibilidade total mostra quantos documentos possuem itens. A cobertura
                elegível exclui do denominador NF-e/NFC-e de emissão própria sem C170, cuja
                ausência pode ser prevista pelo leiaute. Quando todos os documentos estão
                nessa situação, a cobertura é “não aplicável”, e não 0%. C100, C190 e E110
                continuam sustentando as análises documental e de ICMS.
              </p>
            </aside>
            <p className="quality-context">
              Uma diferença entre C100 e C190 não é classificada automaticamente como erro.
              Desde 2026, componentes ligados à reforma tributária podem afetar a conciliação
              entre os valores dos documentos e das operações registrados na EFD ICMS/IPI.
              Emissões anteriores podem ter entrada ou saída registrada na competência atual;
              o painel usa DT_E_S quando esse campo existe e não classifica a ocorrência como
              irregularidade.
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
