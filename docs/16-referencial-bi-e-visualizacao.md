# Referencial de BI e visualização aplicado ao protótipo

## Objetivo deste fichamento

Este documento registra as fontes consultadas, as ideias aproveitadas e a forma como cada
uma influenciou o EFD Clara. Ele não substitui a leitura integral das obras e deve ser
adequado à norma bibliográfica exigida pela PUCRS.

## 1. Stephen Few — painel para monitoramento de relance

**Fonte analisada:** FEW, Stephen. *Information Dashboard Design: Displaying Data for
At-a-Glance Monitoring*. 2. ed. Analytics Press, 2013.

**Ideia útil:** um dashboard bem desenhado concentra informações críticas para que o
usuário perceba rapidamente o que está acontecendo. O valor não está em decorar a tela,
mas em explorar percepção visual, reduzir ruído e facilitar monitoramento.

**Aplicação no EFD Clara:**

- seis métricas no topo, limitadas ao retrato do período;
- exceções e pistas gerenciais apresentadas antes das tabelas detalhadas;
- ausência de gráficos tridimensionais, velocímetros e efeitos sem função;
- valores exatos mantidos junto dos gráficos e na exportação.

**Como usar no TCC:** sustentar a opção por uma visão executiva compacta e pela prioridade
de clareza sobre ornamentação.

## 2. IBCS — comunicação empresarial consistente

**Fonte analisada:** HICHERT, Rolf; FAISST, Jürgen. *International Business Communication
Standards — IBCS Version 2.0*. IBCS Association, 2026.

**Ideias úteis da fórmula SUCCESS:**

- **Say:** transmitir uma mensagem, não apenas acumular dados;
- **Unify:** representar significados iguais de forma consistente;
- **Condense:** aumentar densidade sem perder legibilidade;
- **Check:** preservar integridade visual e escalas honestas;
- **Express:** escolher o gráfico conforme a pergunta;
- **Simplify:** remover ruído e redundância;
- **Structure:** organizar a narrativa do geral para o detalhe.

O IBCS também orienta séries temporais na horizontal, comparações estruturais na vertical
e preferência por linhas, colunas e barras em vez de pizzas e medidores.

**Aplicação no EFD Clara:**

- linha horizontal para evolução diária;
- barras horizontais para clientes, fornecedores, produtos e CFOP;
- tabela com barra acumulada para a curva ABC, preservando posição, valor, participação e
  classe;
- composição circular somente para três categorias geográficas fixas, acompanhada de
  valores e percentuais exatos; trata-se de uma exceção limitada à pergunta de composição;
- colunas para comparar a distribuição semanal dentro da competência;
- cores fixas: entradas em verde e saídas em amarelo;
- eixos iniciados em zero e escala compartilhada entre as duas séries;
- títulos formulados como perguntas de negócio;
- fonte e definição apresentadas em cada painel.

**Como usar no TCC:** justificar as escolhas de gráfico e a padronização semântica.

## 3. Cole Nussbaumer Knaflic — narrativa orientada a uma mensagem

**Fonte analisada:** KNAFLIC, Cole Nussbaumer. *Storytelling with Data: A Data
Visualization Guide for Business Professionals*. Wiley, 2015.

**Ideia útil:** dados isolados não garantem comunicação. Uma narrativa clara cria começo,
meio e fim e usa atenção visual para conduzir o público ao que importa.

**Aplicação no EFD Clara:**

1. começo: retrato do período;
2. meio: tendência, concentração, produtos e inventário;
3. fim: apuração fiscal, limitações e pontos para conferência;
4. mensagens automáticas explicam por que um número merece atenção;
5. a linguagem evita termos técnicos quando eles não ajudam a decisão.

**Como usar no TCC:** sustentar a organização narrativa para empresários leigos e
contadores iniciantes.

## 4. Hevner et al. — construção e avaliação do artefato

**Fonte analisada:** HEVNER, Alan R.; MARCH, Salvatore T.; PARK, Jinsoo; RAM, Sudha.
Design science in information systems research. *MIS Quarterly*, v. 28, n. 1, p. 75-105,
2004. DOI: 10.2307/25148625.

**Ideia útil:** a Design Science amplia capacidades humanas e organizacionais pela
construção e avaliação de artefatos tecnológicos. O conhecimento produzido não é apenas o
código, mas também o problema, o projeto, a demonstração e a avaliação.

**Aplicação no EFD Clara:**

- artefato: aplicativo web de BI;
- problema: baixa legibilidade gerencial da EFD;
- demonstração: arquivo sintético reproduzível;
- avaliação: testes do parser, cálculos, privacidade e interface;
- comunicação: documentação, diário de decisões e relatório de deploy.

**Como usar no TCC:** fundamentar a metodologia de desenvolvimento e avaliação, sem
afirmar que houve validação externa com usuários quando ela ainda não ocorreu.

## 5. Sebrae — indicadores como apoio à pequena empresa

**Fonte analisada:** SEBRAE. *Gestão por indicadores: como as métricas podem alavancar o
seu negócio*. Atualizado em 20 jun. 2022.

**Ideia útil:** decisões empresariais devem se apoiar em dados e métricas; indicadores
ajudam a identificar falhas, traçar estratégias e acompanhar o planejamento.

**Aplicação no EFD Clara:** cada indicador foi relacionado a uma decisão possível, como
investigar concentração, negociar fornecedores, conferir cancelamentos ou compreender a
apuração declarada.

**Cuidado acadêmico:** a fonte sustenta a importância gerencial dos indicadores, mas não
prova que o EFD Clara melhora decisões. Esse efeito exigiria avaliação com usuários.

## 6. Receita Federal — semântica e limites dos registros

**Fonte analisada:** RECEITA FEDERAL DO BRASIL. *Guia Prático da EFD ICMS/IPI: versão
3.2.2*. Atualização de 11 fev. 2026.

**Aplicação no EFD Clara:**

- C100 para documentos;
- `DT_DOC` do C100 para a data de emissão e `DT_E_S` para a data de entrada ou saída;
- 0000 e 0005 para entidade, competência e endereço;
- 0100 para o contabilista responsável;
- C170 para itens;
- C190 para resumos por CST, CFOP e alíquota;
- E110 para apuração própria do ICMS;
- H005 e H010 para inventário e itens;
- primeiro dígito do CFOP no C190 para separar operações internas, interestaduais e
  exteriores;
- `VL_ITEM` e `QTD` do C170 para valor médio ponderado por item e unidade;
- `VL_ICMS` do C190 para identificar entradas com crédito informado na escrituração;
- tratamento explícito da possível diferença entre C100 e C190 em 2026.

O guia informa que, nas entradas de produtos, `DT_E_S` é obrigatório e representa a data
de entrada; nas saídas, seu preenchimento depende da disponibilidade e das regras
aplicáveis. Por isso, o protótipo preserva as duas datas, usa `DT_E_S` como referência
quando existente e recorre a `DT_DOC` somente quando necessário.

O mesmo guia reconhece situações sem C170, incluindo NF-e de emissão própria, e trata a
NFC-e de emissão própria, em regra, por C100 e C190. Essa semântica fundamenta a decisão
de chamar a métrica de **disponibilidade para análise por produto**, e não de qualidade
da escrituração. Exceções determinadas pela legislação ou por registros complementares
continuam possíveis; o protótipo não emite conclusão de regularidade.

**Cuidado acadêmico:** o Guia Prático sustenta o significado e a posição dos campos. Ele
não sustenta alegações de ganho gerencial, usabilidade ou impacto econômico.

## Síntese das decisões derivadas das fontes

| Decisão no artefato | Fundamentação principal |
|---|---|
| visão executiva compacta | Few |
| uma pergunta por seção | Few + IBCS |
| linha para tempo e barras para ranking | IBCS |
| cores e escalas consistentes | IBCS |
| narrativa do geral ao detalhe | Knaflic |
| construção e teste do protótipo | Hevner et al. |
| indicador ligado a uma decisão | Sebrae |
| fórmulas e campos oficiais | Guia Prático da EFD |
| conferência da entidade e responsável | registros 0000, 0005 e 0100 |
| referência temporal e disponibilidade de itens | C100, `DT_DOC`, `DT_E_S` e C170 |

## Limite da revisão

Foi realizada uma revisão dirigida às decisões do protótipo, e não uma revisão sistemática
da literatura. Para a versão final do TCC, recomenda-se registrar bases consultadas,
critérios de seleção, período de busca e palavras-chave caso o orientador exija revisão
bibliográfica formal.
