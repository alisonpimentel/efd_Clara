# Dicionário de dados integrado

## Campos normalizados principais

| Campo | Tipo lógico | Regra |
|---|---|---|
| `source` | texto controlado | `ICMS_IPI` ou `CONTRIBUTIONS` |
| `establishment_cnpj` | texto de 14 dígitos | remover pontuação e validar dígitos |
| `document_key` | texto de 44 dígitos ou nulo | remover espaços e validar estrutura |
| `operation` | texto controlado | `ENTRY` para IND_OPER 0; `EXIT` para IND_OPER 1 |
| `model` | texto | preservar zeros e letras do código |
| `series` | texto | aparar espaços; não converter em número |
| `document_number` | texto | preservar representação informada |
| `issue_date` | data ou nulo | `DDMMAAAA` para ISO 8601 |
| `movement_date` | data ou nulo | `DDMMAAAA` para ISO 8601 |
| `participant_document` | texto ou nulo | CNPJ/CPF sem pontuação e com tamanho válido |
| `product_code` | texto | aparar e normalizar caixa sem remover zeros |
| `ncm` | texto de 8 dígitos ou nulo | remover pontuação; não completar dados ausentes |
| `cfop` | texto de 4 dígitos ou nulo | remover espaços; validar comprimento |
| `cst` | texto ou nulo | preservar zeros à esquerda |
| `unit` | texto ou nulo | aparar, caixa alta e preservar unidade informada |
| `quantity` | DECIMAL ou nulo | vírgula decimal para ponto; nunca usar float |
| `amount` | DECIMAL ou nulo | mesma regra; ausência permanece nula |
| `tax_base` | DECIMAL ou nulo | mesma regra |
| `tax_rate` | DECIMAL ou nulo | mesma regra |

## Registros da EFD ICMS/IPI

| Registro | Uso no protótipo |
|---|---|
| 0000 | entidade, competência e validação do leiaute |
| 0150 | participantes |
| 0200 | produtos |
| C100 | documentos |
| C170 | itens |
| C190 | consolidação por CST, CFOP e alíquota |
| H005 | inventário |
| H010 | itens do inventário |

## Registros da EFD-Contribuições

| Registro | Uso no protótipo |
|---|---|
| 0000 | matriz, competência e validação do leiaute |
| 0110 | regime e método de incidência |
| 0140 | estabelecimentos da pessoa jurídica |
| 0150 | participantes |
| 0200 | produtos |
| C010 | contexto do estabelecimento e IND_ESCRI |
| C100 | documentos individualizados, quando disponíveis |
| C170 | itens e PIS/Cofins dos documentos individualizados |
| M100 | créditos de PIS declarados |
| M200 | contribuição de PIS declarada |
| M500 | créditos de Cofins declarados |
| M600 | Cofins declarada |

## Campos proibidos em logs

CNPJ, CPF, nome de pessoa ou empresa, chave de NF-e, nome original de arquivo, código ou
descrição de produto, conteúdo de linha, número de documento e valores individualizados.
