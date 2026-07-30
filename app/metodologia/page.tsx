import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Metodologia do projeto",
  description: "Delimitação e método de avaliação do protótipo acadêmico EFD Clara.",
  alternates: { canonical: "/metodologia" },
};

export default function MethodologyPage() {
  return (
    <main className="document-page">
      <Link className="back-link" href="/">
        ← Voltar ao EFD Clara
      </Link>
      <p className="eyebrow">Transparência acadêmica</p>
      <h1>O que este protótipo demonstra — e o que ele não pretende provar.</h1>
      <p className="document-lead">
        O EFD Clara é um artefato tecnológico de pesquisa aplicada, criado para avaliar
        se dados fiscais estruturados podem ser reorganizados em uma leitura gerencial
        mais acessível.
      </p>

      <section>
        <h2>Problema investigado</h2>
        <p>
          A EFD ICMS/IPI reúne dados sobre documentos, participantes, produtos e
          operações, mas seu leiaute técnico dificulta o uso direto por pequenos
          empresários e profissionais em início de carreira.
        </p>
      </section>
      <section>
        <h2>Questão de projeto</h2>
        <blockquote>
          Como um aplicativo web simples pode transformar registros selecionados da EFD
          ICMS/IPI em indicadores gerenciais compreensíveis, preservando o processamento
          local do arquivo?
        </blockquote>
      </section>
      <section>
        <h2>Escopo avaliado</h2>
        <ul>
          <li>um arquivo TXT por análise, limitado a 8 MB;</li>
          <li>
            registros 0000, 0150, 0200, C100, C170, C190, E100, E110, H005 e H010;
          </li>
          <li>
            totais, evolução temporal, concentração, produtos, inventário, CFOP e
            apuração declarada do ICMS;
          </li>
          <li>conferência com uma base fictícia e resultados esperados;</li>
          <li>processamento no navegador e ausência de armazenamento fiscal.</li>
        </ul>
      </section>
      <section>
        <h2>Limitações</h2>
        <p>
          O painel não calcula lucro, fluxo de caixa, rentabilidade ou saúde financeira.
          Ele não valida a conformidade tributária, não substitui o contador, não corrige
          a escrituração e não utiliza inteligência artificial. A qualidade dos
          indicadores depende dos registros presentes no arquivo.
        </p>
      </section>
      <section>
        <h2>Avaliação</h2>
        <p>
          A avaliação técnica compara somas e contagens calculadas pelo protótipo com
          valores previamente definidos em arquivos fictícios. O cadastro de interesse
          mede procura pelo experimento, mas não representa validação comercial nem
          comprovação de impacto econômico.
        </p>
      </section>
      <section>
        <h2>Referência do leiaute</h2>
        <p>
          A implementação toma como referência o Guia Prático da EFD ICMS/IPI, versão
          3.2.2, atualizado em 11 de fevereiro de 2026. A documentação acadêmica completa,
          os testes e o diário de decisões acompanham o código-fonte do projeto.
        </p>
      </section>
    </main>
  );
}
