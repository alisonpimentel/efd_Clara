# Resultados do protótipo

## Resultado técnico

Foi implementada uma aplicação web capaz de ler localmente uma EFD ICMS/IPI, normalizar
seis tipos de registro, organizar dados em SQLite WebAssembly temporário e apresentar
indicadores em quatro áreas. O artefato também oferece arquivo fictício, CSV, impressão,
cadastro de interesse e mecanismo de solicitação de direitos de privacidade.

## Resultado da verificação

Em 30 de julho de 2026, os cinco testes automatizados foram executados sem falhas. Eles
cobrem dez cenários documentados, incluindo normalização, relacionamento, cancelamento,
ausência de registros opcionais, totais, rankings e período sem movimento válido.

```text
testes: 5
aprovados: 5
falhas: 0
```

O build de produção também foi concluído, abrangendo a página principal, metodologia,
privacidade e duas rotas de API.

## Evidência quantitativa

Na base fictícia, o artefato reproduziu:

- R$ 15.500,00 em entradas;
- R$ 27.000,00 em saídas;
- R$ 11.500,00 de diferença operacional;
- quatro documentos válidos;
- um documento cancelado;
- R$ 5.100,00 de ICMS escriturado;
- R$ 10.625,00 de ticket médio.

## Resultado acadêmico defensável

> O protótipo demonstrou, nos casos controlados, a viabilidade de reorganizar registros
> selecionados da EFD ICMS/IPI em indicadores gerenciais acessíveis. Os valores calculados
> corresponderam aos resultados esperados da base fictícia e documentos cancelados foram
> excluídos das análises. O processamento ocorreu no navegador e o banco fiscal temporário
> foi encerrado após a geração do resumo.

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

