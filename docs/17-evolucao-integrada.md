# Evolução para análise integrada

## Objetivo

A versão 2 do EFD Clara será uma prova de conceito acadêmica para demonstrar que dados
da EFD ICMS/IPI e da EFD-Contribuições podem ser normalizados, conciliados e
reorganizados em informações empresariais antes da transmissão ao Fisco.

O objetivo não é validar oficialmente as escriturações, calcular tributos ou emitir
parecer. O resultado deve mostrar:

- o que foi encontrado em cada arquivo;
- o que pôde ser conciliado com evidência suficiente;
- o que divergiu;
- o que está disponível apenas em uma fonte;
- qual parcela financeira e documental foi efetivamente coberta.

## Estado atual confirmado

| Aspecto | Versão atual |
|---|---|
| frontend | Next.js 16, React 19 e TypeScript |
| processamento fiscal | navegador |
| motor analítico | SQLite WebAssembly em memória |
| entrada | uma EFD ICMS/IPI de até 8 MB |
| persistência fiscal | nenhuma |
| persistência não fiscal | PostgreSQL para interessados, privacidade e administrador |
| testes | 22 testes automatizados e três fluxos Playwright |
| produção | Vercel |

## Restrição determinante da hospedagem

A aplicação deve funcionar integralmente no plano gratuito da Vercel. Em 31 de julho de
2026, a documentação oficial estabelece limite de 4,5 MB para o corpo de entrada ou
saída de uma Vercel Function. O requisito acadêmico permite dois arquivos de até 8 MB
cada. Assim, transmitir os arquivos a FastAPI, a uma função Node.js ou a um contêiner
publicado na Vercel não atende o requisito.

Essa restrição invalida o fluxo inicialmente proposto de envio `multipart` ao backend.
Fracionar arquivos entre funções também foi descartado, pois exigiria persistência
temporária externa ou afinidade de instância, aumentando o risco e a complexidade sem
valor acadêmico proporcional.

Fonte oficial: [Vercel Functions Limits](https://vercel.com/docs/functions/limitations).

## Arquitetura-alvo compatível com a Vercel

```text
Vercel
  ├── entrega estática do Next.js
  ├── API mínima de cadastro e administração
  └── PostgreSQL somente para dados não fiscais
         │
         ▼
Navegador do usuário
  ├── seleção de duas EFDs, até 8 MB cada
  ├── validação dos registros 0000
  ├── parser hierárquico linha a linha em Web Worker
  ├── normalização decimal determinística
  ├── conciliação de estabelecimento, documentos e itens
  ├── DuckDB WebAssembly ou motor relacional equivalente em memória
  ├── dashboard e exportação agregada
  └── descarte da sessão
```

## Decisões de tecnologia

| Proposta inicial | Escolha adotada | Justificativa |
|---|---|---|
| Vue 3 | preservar Next.js/React | evita reescrita sem ganho acadêmico e mantém o deploy já validado |
| FastAPI para receber os SPEDs | não participar do caminho fiscal | o limite de 4,5 MB é inferior ao requisito de 8 MB por arquivo |
| DuckDB nativo no servidor | DuckDB-WASM ou motor relacional em memória no navegador | mantém análise local e compatibilidade com a Vercel |
| Docker e `tmpfs` em produção | Docker apenas como apoio local opcional | a produção não depende de contêiner nem de disco temporário |
| diretórios temporários | nenhum arquivo fiscal temporário | os arquivos permanecem como objetos locais e dados normalizados em memória |

FastAPI pode ser mantido apenas como experimento técnico isolado ou serviço sem conteúdo
fiscal. Ele não será requisito operacional da versão publicada.

## Fronteira de privacidade

Os dois arquivos permanecem no navegador. A aplicação publicada recebe somente os
arquivos estáticos do produto e os dados expressamente informados no cadastro. Nenhuma
linha fiscal, CNPJ extraído, chave de documento, produto, participante ou valor da
análise é transmitido à Vercel, ao PostgreSQL, a analytics ou a logs.

Texto de interface:

> Os arquivos fiscais são processados exclusivamente neste navegador. O conteúdo não é
> enviado nem armazenado nos servidores da aplicação e é descartado ao iniciar uma nova
> análise, recarregar ou encerrar a página.

## Estratégia de migração

1. preservar a aplicação publicada e os testes atuais;
2. introduzir contratos e bases sintéticas para as duas escriturações;
3. extrair o parser atual para um núcleo versionado e independente da interface;
4. adicionar o parser hierárquico da EFD-Contribuições;
5. validar competência, empresa e estabelecimento exato;
6. implementar conciliação documental e de itens com estados explícitos;
7. ampliar o dashboard sem exibir métricas indisponíveis como zero;
8. executar testes locais e em preview da Vercel;
9. trocar a produção somente após os critérios objetivos de aceite.

## Critérios de saída

A versão 2 só poderá substituir a atual quando:

- os dois leiautes forem reconhecidos corretamente;
- empresa, competência e estabelecimento forem validados;
- nenhuma raiz de CNPJ for usada como identidade suficiente;
- documentos e itens possuírem classificação e método de correspondência;
- ausência de dados não for convertida em zero;
- nenhum conteúdo fiscal aparecer em requisições, banco, analytics ou logs;
- os testes de descarte e de dois arquivos de 8 MB forem aprovados;
- a aba de rede do navegador confirmar a ausência de transmissão fiscal;
- a versão atual permanecer disponível como rollback.
