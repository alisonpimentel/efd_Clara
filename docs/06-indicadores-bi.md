# Indicadores de Business Intelligence

## Princípio de desenho

Cada visualização responde a uma pergunta de negócio. Os códigos do SPED permanecem na
camada técnica; a interface prioriza termos como entradas, saídas, clientes, fornecedores,
produtos e operação fiscal.

## Indicadores principais

| Indicador | Cálculo | Fonte | Decisão apoiada | Limitação |
|---|---|---|---|---|
| Entradas escrituradas | soma de `VL_DOC` das entradas válidas | C100 | dimensionar aquisições registradas | não equivale a pagamento |
| Saídas escrituradas | soma de `VL_DOC` das saídas válidas | C100 | dimensionar vendas/operações registradas | não equivale a recebimento |
| Diferença operacional | saídas menos entradas | C100 | comparar magnitudes do período | não é lucro |
| Documentos válidos | contagem sem cancelados | C100 | entender volume documental | não mede itens |
| Documentos cancelados | contagem das situações 02/03 | C100 | observar exceções | recorte do protótipo |
| Ticket médio fiscal | entradas + saídas / documentos válidos | C100 | comparar valor médio documental | combina naturezas distintas |
| ICMS escriturado | soma de `VL_ICMS` | C190 ou C100 | visualizar valor registrado | não calcula imposto a pagar |

## Rankings

| Ranking | Agrupamento | Medida | Dependência |
|---|---|---|---|
| fornecedores | participante de documentos de entrada | soma de `VL_DOC` | 0150 + C100 |
| clientes | participante de documentos de saída | soma de `VL_DOC` | 0150 + C100 |
| produtos adquiridos | item em documentos de entrada | soma de `VL_ITEM` | 0200 + C170 |
| produtos nas saídas | item em documentos de saída | soma de `VL_ITEM` | 0200 + C170 |
| CFOP | código de operação | soma de `VL_OPR` | C190 |

## Qualidade de dados

O painel apresenta:

- documentos válidos sem participante identificado;
- itens sem código de produto;
- documentos sem data válida;
- ausência de C170 ou C190.

Esses itens não são “erros fiscais” declarados. São limitações para a leitura gerencial
proposta.

## Exemplo interpretativo da base fictícia

- entradas: R$ 15.500,00;
- saídas: R$ 27.000,00;
- diferença operacional: R$ 11.500,00;
- documentos válidos: 4;
- documentos cancelados: 1;
- ticket médio fiscal: R$ 10.625,00;
- ICMS escriturado: R$ 5.100,00.

Texto admissível:

> Na base fictícia, as saídas escrituradas superaram as entradas em R$ 11,5 mil. O
> indicador descreve a diferença entre documentos fiscais e não permite concluir que houve
> lucro ou geração de caixa.

Texto que não deve ser usado:

> A empresa obteve lucro de R$ 11,5 mil.

