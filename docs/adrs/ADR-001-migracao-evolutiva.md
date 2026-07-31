# ADR-001 — Migração evolutiva

- **Status:** aceita
- **Data:** 31 de julho de 2026
- **Decisão:** evoluir o EFD Clara no projeto Next.js existente, por etapas, sem
  substituir antecipadamente a versão publicada.

## Contexto

A versão atual possui interface, parser de EFD ICMS/IPI, testes, cadastro, área
administrativa, documentação e deploy funcional. Uma reescrita simultânea de frontend,
backend e motor analítico eliminaria uma base validada e aumentaria o risco do TCC.

## Alternativas consideradas

1. reescrever tudo em Vue 3 e FastAPI;
2. manter a versão atual sem integração;
3. introduzir a integração no núcleo atual e migrar componentes somente quando houver
   necessidade demonstrada.

## Consequências

A alternativa 3 foi escolhida. O histórico funcional é preservado, cada mudança pode
ser testada isoladamente e a versão atual continua sendo rollback. O custo é conviver
temporariamente com módulos antigos e novos.
