# Indicadores de Business Intelligence

## Princípio de desenho

O painel foi reorganizado por perguntas decisórias, e não pela quantidade de gráficos. A
visão executiva responde “o que aconteceu no período?”; clientes e fornecedores respondem
“há concentração?”; produtos e estoque respondem “quais itens concentram valor?”; e a
visão fiscal responde “o que foi informado sobre ICMS e quais são os limites dos dados?”.

Os códigos do SPED permanecem na camada técnica. A interface usa linguagem de negócio e
sempre informa fonte, período, unidade e limitação.

## Contexto da escrituração

Antes dos indicadores, o painel apresenta um bloco de conferência:

| Informação | Registro e campo | Finalidade |
|---|---|---|
| razão social | 0000 `NOME` | confirmar a entidade analisada |
| CNPJ ou CPF, UF e IE | 0000 | confirmar identificação fiscal |
| competência | 0000 `DT_INI` e `DT_FIN` | delimitar o período dos indicadores |
| perfil e atividade | 0000 | contextualizar o arquivo |
| nome fantasia e endereço | 0005 | conferir o estabelecimento |
| contabilista e CRC | 0100 | identificar o responsável informado |

O CPF do contabilista é mascarado na interface e não entra no CSV. Esses dados são
contextuais e não constituem indicadores de desempenho.

## Visão executiva

| Indicador | Cálculo | Fonte | Decisão apoiada | Limitação |
|---|---|---|---|---|
| Entradas escrituradas | soma de `VL_DOC` das entradas válidas | C100 | dimensionar aquisições registradas | não equivale a pagamento |
| Saídas escrituradas | soma de `VL_DOC` das saídas válidas | C100 | dimensionar vendas/operações registradas | não equivale a recebimento |
| Diferença operacional | saídas menos entradas | C100 | comparar magnitudes do período | não é lucro |
| Ticket médio de entrada | entradas / documentos de entrada | C100 | compreender porte médio das aquisições | não mede prazo ou pagamento |
| Ticket médio de saída | saídas / documentos de saída | C100 | compreender porte médio das saídas | não mede margem |
| Evolução temporal | soma diária de entradas e saídas | C100 | identificar datas de maior movimentação | depende de datas válidas |
| Taxa de cancelamento | cancelados / total de documentos | C100 | direcionar conferência operacional | não determina a causa |
| Cancelamento por direção | cancelados de entrada ou saída / total da respectiva direção | C100 | distinguir ocorrência recebida da emitida | não avalia a regularidade do cancelamento |
| Distribuição semanal | saídas por dia da semana / ocorrências do dia na competência | C100 | reconhecer o ritmo operacional do mês | um período não caracteriza sazonalidade |

## Clientes e fornecedores

| Indicador | Cálculo | Fonte | Decisão apoiada | Limitação |
|---|---|---|---|---|
| Clientes identificados | participantes distintos nas saídas | 0150 + C100 | dimensionar a base presente no arquivo | não equivale à carteira completa |
| Fornecedores identificados | participantes distintos nas entradas | 0150 + C100 | dimensionar a base de fornecimento | não mede criticidade de insumo |
| Concentração de clientes | valor dos três maiores / total de saídas | 0150 + C100 | observar dependência comercial | não estabelece risco isoladamente |
| Concentração de fornecedores | valor dos três maiores / total de entradas | 0150 + C100 | apoiar negociação e diversificação | não considera contratos ou substituição |
| Curva ABC de clientes | participação e percentual acumulado do valor das saídas por participante | 0150 + C100 | reconhecer dependência e priorizar análise | saídas não equivalem necessariamente a faturamento |
| Abrangência geográfica | participação dos CFOPs iniciados por 5, 6 e 7 | C190 | comparar operações internas, interestaduais e exterior | depende da classificação fiscal informada |

O protótipo sinaliza concentração a partir de 50% como uma pista para investigação. Esse
limiar é uma regra exploratória do artefato, não uma norma contábil ou diagnóstico
automático.

Na curva ABC, a classe A alcança até 80% do valor acumulado, a B vai até 95% e a C contém
o restante. A classificação é descritiva. O protótipo não afirma que 20% dos clientes
necessariamente geram 80% das saídas; essa proporção deve ser observada nos próprios dados.

## Produtos e inventário

| Indicador | Cálculo | Fonte | Decisão apoiada | Limitação |
|---|---|---|---|---|
| Produtos de maior valor nas entradas | soma de `VL_ITEM` por produto | 0200 + C170 | identificar itens relevantes nas compras | não mede custo médio |
| Produtos de maior valor nas saídas | soma de `VL_ITEM` por produto | 0200 + C170 | identificar itens relevantes nas saídas | não mede margem ou rentabilidade |
| Curva ABC de produtos | participação e percentual acumulado de `VL_ITEM` nas saídas | 0200 + C170 | localizar itens que concentram valor | não mede margem |
| Valor médio por unidade | soma de `VL_ITEM` / soma de `QTD`, por item, unidade e direção | C170 | acompanhar valores médios escriturados | não mistura unidades nem equivale necessariamente ao preço comercial |
| SKUs movimentados | itens distintos com entrada ou saída | C170 | dimensionar variedade presente na competência | não equivale ao catálogo completo do ERP |
| SKUs com saída | itens distintos com saída / itens distintos movimentados | C170 | observar amplitude do mix no período | o denominador não é o cadastro total do 0200 |
| Inventário declarado | `VL_INV` | H005 | visualizar valor informado do estoque | o Bloco H não aparece em todo período |
| Itens de maior valor no inventário | soma de `VL_ITEM` por item | H010 | direcionar conferência e gestão | depende do detalhamento entregue |
| Composição de propriedade | valor por `IND_PROP` | H010 | separar bens próprios e de terceiros | não substitui conciliação física |

## Fiscal-contábil

| Indicador | Fonte | Utilidade | Cuidado interpretativo |
|---|---|---|---|
| total de débitos | E110 | resumir débitos da apuração própria | valor declarado, não recalculado |
| total de créditos | E110 | resumir créditos da apuração própria | valor declarado, não auditado |
| saldo credor anterior | E110 | visualizar crédito trazido | depende da consistência da escrituração |
| saldo devedor apurado | E110 | observar saldo antes de deduções | não substitui obrigação acessória |
| deduções | E110 | compreender a passagem ao valor final | detalhes podem estar em registros filhos |
| ICMS a recolher | E110 | mostrar valor informado para o período | não é uma guia gerada pelo protótipo |
| crédito a transportar | E110 | mostrar saldo levado ao período seguinte | exige conferência profissional |
| ICMS nas entradas e saídas | C190 | comparar destaque por direção | não substitui o E110 |
| entradas com ICMS informado | valor de entradas em C190 com `VL_ICMS > 0` / valor total das entradas C190 | indicar quanto da base de entradas possui crédito escriturado | não determina juridicamente o direito ao crédito |
| carga aparente de ICMS | ICMS a recolher no E110 / saídas válidas do C100 | oferecer uma proporção simples para conferência | não é alíquota efetiva e combina bases com naturezas diferentes |
| operações por CFOP | C190 | observar naturezas de operação relevantes | CFOP exige contexto fiscal |

O projeto permanece restrito ao ICMS. PIS e Cofins não são agregados aos indicadores,
pois uma análise mais adequada desses tributos exigiria outro recorte e, em especial,
dados da EFD-Contribuições.

## Disponibilidade, consistência e conciliação

O painel separa três conceitos que não devem ser confundidos:

1. **consistência mínima**, como participante, produto e data identificáveis;
2. **disponibilidade analítica**, como a presença de C170 para análises por item;
3. **conciliação**, como a comparação entre totais de C100 e C190.

Para a competência, o protótipo usa `DT_E_S` — data de entrada ou saída — quando esse
campo está preenchido. `DT_DOC`, a data de emissão, é preservada separadamente e usada
somente como alternativa quando `DT_E_S` não está disponível. Com isso, uma nota emitida
antes e recebida dentro da competência não é classificada indevidamente como movimento
fora do período.

O painel apresenta:

- documentos válidos sem participante identificado;
- itens sem código de produto;
- documentos sem data de referência válida;
- movimentos cuja data de entrada/saída, ou subsidiariamente a emissão, está fora da
  competência declarada;
- documentos emitidos antes da competência e escriturados dentro dela, como informação
  contextual, sem classificá-los como erro;
- disponibilidade de C170 separada entre entradas e saídas;
- ausência dos registros opcionais C190, E110 ou H005;
- diferença absoluta entre a soma de `VL_DOC` no C100 e `VL_OPR` no C190.

### Como interpretar o C170

O percentual de documentos com C170 não é uma nota de qualidade da EFD. O protótipo
separa dois indicadores:

| Indicador | Fórmula | Interpretação |
|---|---|---|
| disponibilidade total | documentos com C170 / documentos ativos | parcela de toda a movimentação que pode alimentar análise por produto |
| cobertura elegível | documentos com C170 / documentos elegíveis | presença de itens após retirar do denominador NF-e/NFC-e própria sem C170 |

Quando não existe nenhum documento elegível, a cobertura é apresentada como **não
aplicável**. Mostrar 0% nesse caso sugeriria uma falha inexistente.

Para NF-e ou NFC-e de emissão própria, modelos 55 e 65, a ausência de C170 pode ser
esperada conforme as regras de escrituração do C100. O protótipo, por isso, mostra
separadamente:

- documentos com itens C170 disponíveis;
- documentos eletrônicos de emissão própria sem C170, cuja ausência é geralmente
  esperada;
- outros documentos sem itens, que merecem conferência antes de uma análise por produto.

O critério de elegibilidade é uma regra transparente do protótipo, não uma validação
fiscal. Regras estaduais e situações específicas podem exigir análise profissional.
Mesmo quando a cobertura elegível é 100%, a disponibilidade total pode ser baixa; isso
significa que todos os documentos do denominador esperado possuem C170, mas não que todos
os documentos da empresa possuem detalhamento por item.

Mesmo sem C170, permanecem disponíveis as análises documentais e fiscais sustentadas por
C100, C190 e E110. O sistema não inventa produtos nem tenta reconstruir itens a partir de
registros agregados.

A diferença entre C100 e C190 não é rotulada automaticamente como erro. A documentação
oficial alerta que, a partir de 2026, componentes relacionados à CBS, IBS e IS podem fazer
com que o valor total do documento no C100 não corresponda ao valor das operações do C190.
A função do indicador é provocar conciliação, não emitir diagnóstico fiscal.

## Evidência quantitativa da base fictícia

- entradas: R$ 15.500,00;
- saídas: R$ 27.000,00;
- diferença operacional: R$ 11.500,00;
- ticket médio de entrada: R$ 7.750,00;
- ticket médio de saída: R$ 13.500,00;
- ICMS nos C190 de entrada: R$ 1.860,00;
- ICMS nos C190 de saída: R$ 3.240,00;
- ICMS a recolher no E110: R$ 1.080,00;
- entradas C190 com ICMS informado: 100% na base sintética;
- ICMS a recolher dividido pelas saídas escrituradas: 4%, apresentado como indicador
  aparente;
- saídas internas: 66,7%; interestaduais: 33,3%;
- cancelamentos: 0% nas entradas e 33,3% nas saídas;
- três SKUs movimentados e três com saída;
- inventário declarado no H005: R$ 22.000,00.

Texto admissível:

> Na base fictícia, as saídas escrituradas superaram as entradas em R$ 11,5 mil e o E110
> informou R$ 1.080,00 de ICMS a recolher. O primeiro indicador descreve movimentações
> documentais; o segundo reproduz a apuração declarada. Nenhum deles, isoladamente,
> demonstra lucro ou fluxo de caixa.

Texto que não deve ser usado:

> A empresa obteve lucro de R$ 11,5 mil e deve pagar imposto calculado pelo aplicativo.
