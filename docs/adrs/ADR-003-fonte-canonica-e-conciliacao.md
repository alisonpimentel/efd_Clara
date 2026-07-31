# ADR-003 — Fonte canônica e conciliação

- **Status:** aceita
- **Data:** 31 de julho de 2026
- **Decisão:** representar cada documento uma única vez na camada analítica.

## Contexto

Compras e vendas podem aparecer nas duas escriturações. Somar as duas fontes duplicaria
documentos e produziria indicadores empresariais falsos.

## Decisão

- EFD ICMS/IPI é a fonte operacional principal e de ICMS/IPI;
- EFD-Contribuições complementa PIS/Cofins;
- documentos e itens recebem identificadores canônicos;
- a associação registra método, confiança e classificação;
- ausência de detalhamento em uma fonte gera estado de disponibilidade, não valor zero.

## Consequências

O painel empresarial não duplica operações. Métricas tributárias informam a origem e a
cobertura. Casos ambíguos permanecem separados e visíveis, sem conciliação automática.
