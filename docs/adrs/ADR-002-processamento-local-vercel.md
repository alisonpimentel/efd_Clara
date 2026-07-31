# ADR-002 — Processamento fiscal local em hospedagem Vercel

- **Status:** aceita
- **Data:** 31 de julho de 2026
- **Decisão:** processar as duas EFDs exclusivamente no navegador.

## Contexto

Cada arquivo pode possuir até 8 MB. A Vercel limita o corpo de uma requisição ou
resposta de Function a 4,5 MB. O envio dos dois arquivos a FastAPI ou a uma função
Node.js violaria esse limite antes mesmo do processamento.

## Alternativas consideradas

1. reduzir o limite dos arquivos;
2. enviar os arquivos ao backend;
3. armazenar partes em objeto ou banco;
4. processar localmente com Web Worker e motor relacional WebAssembly.

## Decisão

Foi escolhida a alternativa 4, porque preserva o requisito de 8 MB, não exige
armazenamento fiscal e oferece uma afirmação de privacidade verificável pela aba de rede
do navegador.

## Consequências

- FastAPI não recebe conteúdo fiscal;
- Docker não é requisito de produção;
- memória e desempenho do navegador passam a ser requisitos mensuráveis;
- a aplicação precisa testar navegadores suportados e descartar explicitamente o estado;
- a API e o PostgreSQL permanecem restritos ao cadastro e à administração.

## Fonte

[Vercel Functions Limits](https://vercel.com/docs/functions/limitations), consultado em
31 de julho de 2026.
