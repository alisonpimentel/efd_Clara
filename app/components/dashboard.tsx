"use client";

import { useState } from "react";
import { downloadCsv } from "../../lib/sped/export";
import type { DashboardData, RankingItem } from "../../lib/sped/types";

const moneyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("pt-BR");

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

function BarList({
  title,
  question,
  values,
  emptyMessage,
}: {
  title: string;
  question: string;
  values: RankingItem[];
  emptyMessage: string;
}) {
  const max = Math.max(...values.map((item) => item.value), 1);
  return (
    <section className="data-panel">
      <div className="panel-heading">
        <div>
          <h3>{title}</h3>
          <p>{question}</p>
        </div>
      </div>
      {values.length ? (
        <ol className="bar-list">
          {values.map((item, index) => (
            <li key={`${item.label}-${index}`}>
              <div className="bar-label">
                <span>{item.label}</span>
                <strong>{money(item.value)}</strong>
              </div>
              <div className="bar-track" aria-hidden="true">
                <span style={{ width: `${Math.max((item.value / max) * 100, 3)}%` }} />
              </div>
              {item.detail && (
                <small>{numberFormatter.format(Number(item.detail))} ocorrência(s)</small>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <div className="empty-chart">
          <strong>Sem dados para exibir</strong>
          <p>{emptyMessage}</p>
        </div>
      )}
    </section>
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
          ["overview", "Visão geral"],
          ["relationships", "Clientes e fornecedores"],
          ["products", "Produtos"],
          ["fiscal", "Visão fiscal"],
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
          <div className="metrics-grid">
            <Metric
              label="Entradas escrituradas"
              value={money(data.totalEntries)}
              note="Soma dos C100 de entrada válidos"
            />
            <Metric
              label="Saídas escrituradas"
              value={money(data.totalExits)}
              note="Soma dos C100 de saída válidos"
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
              note={`${data.cancelledDocuments} cancelado(s) fora dos totais`}
            />
            <Metric
              label="Ticket médio fiscal"
              value={money(data.averageTicket)}
              note="Média dos documentos válidos"
            />
            <Metric
              label="ICMS escriturado"
              value={money(data.icmsRegistered)}
              note="Soma informada nos registros fiscais"
            />
          </div>

          <div className="balance-panel">
            <div>
              <p className="eyebrow">Leitura rápida</p>
              <h2>Como as movimentações se comparam?</h2>
              <p>
                Para cada R$ 100,00 em entradas, este arquivo registra{" "}
                <strong>
                  {data.totalEntries
                    ? money((data.totalExits / data.totalEntries) * 100)
                    : "valor indisponível"}
                </strong>{" "}
                em saídas.
              </p>
            </div>
            <div className="comparison-bars" aria-label="Comparação entre entradas e saídas">
              <div>
                <span>Entradas</span>
                <div>
                  <i
                    style={{
                      width: `${
                        Math.max(data.totalEntries, data.totalExits)
                          ? (data.totalEntries /
                              Math.max(data.totalEntries, data.totalExits)) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <strong>{money(data.totalEntries)}</strong>
              </div>
              <div className="exit-bar">
                <span>Saídas</span>
                <div>
                  <i
                    style={{
                      width: `${
                        Math.max(data.totalEntries, data.totalExits)
                          ? (data.totalExits /
                              Math.max(data.totalEntries, data.totalExits)) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <strong>{money(data.totalExits)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "relationships" && (
        <div className="dashboard-grid">
          <BarList
            title="Principais fornecedores"
            question="Quem concentra o maior valor de entradas?"
            values={data.topSuppliers}
            emptyMessage="O arquivo não relacionou participantes aos documentos de entrada."
          />
          <BarList
            title="Principais clientes"
            question="Quem concentra o maior valor de saídas?"
            values={data.topCustomers}
            emptyMessage="O arquivo não relacionou participantes aos documentos de saída."
          />
        </div>
      )}

      {tab === "products" && (
        <div className="dashboard-grid">
          <BarList
            title="Produtos mais adquiridos"
            question="Quais itens representam mais valor nas entradas?"
            values={data.topPurchasedProducts}
            emptyMessage="Os registros C170 de entrada não estão disponíveis neste arquivo."
          />
          <BarList
            title="Produtos mais movimentados nas saídas"
            question="Quais itens representam mais valor nas saídas?"
            values={data.topSoldProducts}
            emptyMessage="Os registros C170 de saída não estão disponíveis neste arquivo."
          />
        </div>
      )}

      {tab === "fiscal" && (
        <div className="dashboard-grid">
          <BarList
            title="Operações por CFOP"
            question="Quais naturezas de operação concentram mais valor?"
            values={data.cfopRanking}
            emptyMessage="Os resumos C190 não estão disponíveis neste arquivo."
          />
          <section className="data-panel quality-panel">
            <div className="panel-heading">
              <div>
                <h3>Qualidade para esta análise</h3>
                <p>Pontos que podem limitar a leitura gerencial</p>
              </div>
            </div>
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
            </dl>
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
            <dt>Mecanismo</dt>
            <dd>{data.technical.engine}</dd>
          </div>
        </dl>
      </details>
    </article>
  );
}

