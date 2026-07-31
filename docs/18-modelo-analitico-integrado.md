# Modelo analítico integrado

## Grão das tabelas

| Entidade | Grão | Fonte |
|---|---|---|
| `analysis_file` | um arquivo recebido | ambas |
| `establishment` | um estabelecimento identificado por CNPJ completo | 0000, 0140 e C010 |
| `participant` | um participante por arquivo e código | 0150 |
| `product` | um produto por arquivo, estabelecimento e código | 0200 |
| `document_source` | um documento em uma escrituração | C100 |
| `item_source` | um item de um documento em uma escrituração | C170 |
| `document_match` | uma decisão de conciliação entre dois documentos | derivada |
| `item_match` | uma decisão de conciliação entre dois itens | derivada |
| `canonical_document` | um documento sem duplicidade na camada de BI | derivada |
| `canonical_item` | um item sem duplicidade na camada de BI | derivada |
| `tax_assessment` | uma linha de apuração declarada | M100, M200, M500 e M600 |
| `inventory` | um inventário e seus itens | H005 e H010 |

## Fontes canônicas

- movimentação documental, ICMS, IPI e inventário: EFD ICMS/IPI;
- PIS e Cofins: EFD-Contribuições;
- identidade do estabelecimento: CNPJ completo validado em cada contexto;
- documento canônico: registro da EFD ICMS/IPI enriquecido com PIS/Cofins quando houver
  correspondência;
- documento apenas na EFD-Contribuições: permanece separado e explicitamente
  classificado, sem ser somado às compras ou vendas canônicas por padrão.

## Tipos numéricos

Na implementação compatível com a Vercel, valores monetários, quantidades, bases e
alíquotas são normalizados como texto decimal canônico. Somas, diferenças, tolerâncias e
concentrações usam inteiros `BigInt` com escala fixa. A apresentação converte somente o
resultado final para rótulo monetário.

Valores ausentes permanecem nulos. O número zero só é armazenado quando foi efetivamente
informado ou calculado sobre uma população válida. Essa escolha substituiu a proposta
inicial de `DECIMAL` no DuckDB nativo, pois o processamento fiscal foi mantido no
navegador para atender simultaneamente ao limite de 8 MB e à hospedagem na Vercel.

## Estados de disponibilidade

| Estado | Significado |
|---|---|
| `OBSERVED` | fonte presente e valor mensurável |
| `NOT_AVAILABLE` | registro ou campo necessário ausente |
| `NOT_APPLICABLE` | fórmula sem população ou denominador |
| `PARTIAL` | apenas parte da população possui os campos necessários |

## Prevenção de duplicidades

Compras e vendas não são obtidas pela soma das duas escriturações. Cada documento aparece
uma única vez na camada canônica. A EFD-Contribuições enriquece o documento conciliado
com PIS/Cofins e preserva os documentos exclusivos em uma visão de conciliação.

## Limite estrutural da EFD-Contribuições

O registro C010 pode indicar escrituração por registros consolidados (`IND_ESCRI = 1`) ou por
documentos individualizados (`IND_ESCRI = 2`). Quando o arquivo usa consolidação e não
possui C100/C170 suficientes, a conciliação documental é marcada como indisponível ou
parcial. O protótipo não reconstrói notas individuais a partir de C180/C190.
