# Resultados do protótipo

## Resultado técnico

Foi implementada uma aplicação web capaz de ler localmente uma EFD ICMS/IPI, normalizar
doze tipos de registro, organizar dados em SQLite WebAssembly temporário e apresentar
indicadores em quatro áreas. O artefato também oferece arquivo fictício, CSV, impressão,
cadastro de interesse e mecanismo de solicitação de direitos de privacidade.

## Resultado da verificação

Em 30 de julho de 2026, os quatorze testes unitários foram executados sem falhas. Eles
cobrem normalização, relacionamento, cancelamento, ausência de registros opcionais,
totais, rankings, período sem movimento válido, seleção de arquivo, consentimentos,
validação cadastral e exportação.

Três testes de ponta a ponta também foram aprovados. O fluxo real cobriu desktop e
celular, rejeição de arquivo acima de 8 MB, geração do painel, CSV, nova análise e
inspeção dos corpos de requisição. A execução pública percorreu ainda as abas de
concentração, produtos/inventário e fiscal/E110. Nenhum registro fiscal foi transmitido.

```text
testes unitários: 14
testes E2E: 3
aprovados: 17
falhas: 0
```

O lint e o build de produção também foram concluídos. O build abrange a página principal,
metodologia, privacidade, área administrativa e três rotas de API.

Durante a ampliação do teste E2E, dois seletores iniciais foram corrigidos: um procurava
texto da aba anterior e outro encontrava duas ocorrências legítimas do mesmo valor de
inventário. As correções tornaram o teste específico para o componente esperado; não foi
identificado defeito nos cálculos ou na interface.

## Evidência quantitativa

Na base fictícia, o artefato reproduziu:

- R$ 15.500,00 em entradas;
- R$ 27.000,00 em saídas;
- R$ 11.500,00 de diferença operacional;
- quatro documentos válidos;
- um documento cancelado;
- R$ 5.100,00 de ICMS escriturado;
- R$ 10.625,00 de ticket médio geral;
- R$ 7.750,00 de ticket médio de entrada;
- R$ 13.500,00 de ticket médio de saída;
- R$ 1.080,00 de ICMS a recolher informado no E110;
- R$ 22.000,00 de inventário informado no H005;
- razão social, fantasia, endereço, competência e contabilista da escrituração;
- quatro pontos na evolução temporal;
- 100% de concentração nos três maiores clientes e fornecedores da base sintética.

## Resultado acadêmico defensável

> O protótipo demonstrou, nos casos controlados, a viabilidade de reorganizar registros
> selecionados da EFD ICMS/IPI em indicadores gerenciais acessíveis. Os valores calculados
> corresponderam aos resultados esperados da base fictícia e documentos cancelados foram
> excluídos das análises. O protótipo também reproduziu a apuração declarada no E110 e o
> inventário do Bloco H, sem recalcular obrigações. O processamento ocorreu no navegador e
> o banco fiscal temporário foi encerrado após a geração do resumo.

## O que o resultado não demonstra

- compreensão efetiva por usuários leigos;
- redução de tempo em ambiente real;
- melhoria de decisões empresariais;
- precisão para qualquer EFD;
- segurança certificada;
- demanda comercial;
- ganho financeiro.

O número de interessados, quando houver tempo de exposição suficiente, poderá indicar
procura inicial. Ele não equivale a intenção de compra nem validação do problema.
