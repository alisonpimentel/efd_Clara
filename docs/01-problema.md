# Problema e justificativa

## Contexto

A EFD ICMS/IPI é uma escrituração digital composta por registros padronizados. O arquivo
concentra dados de identificação, participantes, itens, documentos e consolidações fiscais.
Apesar do potencial informacional, seu formato textual e sua nomenclatura foram concebidos
para escrituração e validação fiscal, não para comunicação gerencial com usuários leigos.

Pequenos empresários, estudantes e profissionais contábeis em início de carreira podem
possuir o arquivo, mas não as ferramentas ou o conhecimento necessários para transformar
os registros em uma visão simples das movimentações informadas.

## Problema de pesquisa

> Como um aplicativo web simples pode transformar registros selecionados da EFD ICMS/IPI
> em indicadores gerenciais compreensíveis, preservando o processamento local do arquivo?

## Dor observada

A dor não é a inexistência de dados. Os dados já foram produzidos pela organização. A
dificuldade está em reaproveitá-los de maneira compreensível e de baixo custo. Sem uma
camada de tradução, perguntas básicas podem exigir planilhas, sistemas especializados ou
conhecimento detalhado do leiaute:

- qual foi o valor total de entradas e saídas escrituradas?
- quais clientes e fornecedores concentram mais valor?
- quais produtos aparecem com maior movimentação?
- quais CFOPs concentram as operações?
- quantos documentos foram cancelados ou apresentam dados incompletos?

## Justificativa acadêmica

O projeto aproxima três temas do MBA: transformação baseada em dados, Business
Intelligence e produto digital. O artefato converte dados estruturados de uma obrigação
existente em informação visual, inclui critérios de qualidade e adota privacidade desde a
concepção.

O recorte é adequado a um trabalho curto porque:

1. possui fonte de dados e leiaute documentados;
2. gera um artefato demonstrável;
3. permite avaliação quantitativa por casos de teste;
4. dispensa IA, treinamento de modelos e integração com sistemas externos;
5. explicita limites para não confundir escrituração fiscal com resultado financeiro.

## Hipótese de projeto

Se registros selecionados da EFD ICMS/IPI forem reorganizados em indicadores visuais e
acompanhados de explicações em linguagem de negócio, então usuários não especialistas
poderão obter uma primeira leitura das movimentações fiscais com menor barreira técnica.

Essa hipótese é avaliada inicialmente pela capacidade funcional do protótipo. Avaliações de
compreensão, usabilidade e impacto demandam estudo posterior com participantes.

