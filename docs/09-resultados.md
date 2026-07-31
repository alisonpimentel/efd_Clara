# Resultados do protótipo

## Resultado técnico

Foi implementada uma aplicação web capaz de ler localmente uma EFD ICMS/IPI, normalizar
doze tipos de registro, organizar dados em SQLite WebAssembly temporário e apresentar
indicadores em quatro áreas. O artefato também oferece arquivo fictício, CSV, impressão,
cadastro de interesse e mecanismo de solicitação de direitos de privacidade.

## Resultado da verificação

Em 30 de julho de 2026, os dezoito testes unitários foram executados sem falhas. Eles
cobrem normalização, relacionamento, cancelamento, ausência de registros opcionais,
totais, rankings, período sem movimento válido, seleção de arquivo, consentimentos,
validação cadastral, exportação, leitura de TXT em UTF-8 ou Windows-1252 e separação entre
data de emissão e data de entrada ou saída.

Três fluxos de ponta a ponta, contendo cinco verificações funcionais e visuais, também
foram aprovados. O fluxo real cobriu desktop e
celular, rejeição de arquivo acima de 8 MB, geração do painel, CSV, nova análise e
inspeção dos corpos de requisição. A execução pública percorreu ainda as abas de
concentração, produtos/inventário e fiscal/E110. Nenhum registro fiscal foi transmitido.

```text
testes unitários: 18
fluxos E2E: 3
aprovados: 21
falhas: 0
```

O lint e o build de produção também foram concluídos. O build abrange a página principal,
metodologia, privacidade, área administrativa e três rotas de API.

Durante a ampliação do teste E2E, dois seletores iniciais foram corrigidos: um procurava
texto da aba anterior e outro encontrava duas ocorrências legítimas do mesmo valor de
inventário. As correções tornaram o teste específico para o componente esperado; não foi
identificado defeito nos cálculos ou na interface.

Uma inspeção exploratória com EFD real, mantida exclusivamente no navegador do autor,
encontrou dois defeitos que a base reduzida não evidenciava: caracteres acentuados
substituídos pelo símbolo de erro e expansão horizontal provocada por nomes longos.
O carregamento passou a testar UTF-8 estrito e, quando necessário, usar Windows-1252.
As grades receberam contenção de largura, os painéis de conteúdo variável deixaram de
ser esticados e a validação móvel passou a percorrer todas as áreas com rótulos extensos.
Uma primeira implementação ainda usava `DT_DOC` como referência temporal e mostrava o
percentual de C170 dentro de uma seção intitulada qualidade. Ao analisar a tela com o
autor, verificou-se que isso podia produzir duas interpretações incorretas: considerar
uma emissão anterior como movimento fora da competência e ler a ausência de C170 como
falha da escrituração. A implementação passou a usar `DT_E_S` quando disponível, preservar
`DT_DOC` separadamente e apresentar C170 como disponibilidade para análise de produtos.
Notas eletrônicas de emissão própria sem C170 são destacadas como ausência geralmente
esperada, enquanto outras ausências permanecem como ponto de conferência.
Nenhum dado identificável dessa EFD foi salvo como evidência.

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
- 100% do valor das entradas C190 da base fictícia com ICMS informado;
- 4% no indicador aparente de ICMS a recolher sobre as saídas;
- 66,7% das saídas classificadas como internas e 33,3% como interestaduais;
- 0% de cancelamento nas entradas e 33,3% nas saídas;
- três SKUs movimentados e três com saída;
- curva ABC de clientes e produtos com participação e valor acumulado;
- R$ 15,00 por unidade como valor médio escriturado do Café Torrado nas saídas;
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

Os indicadores adicionais confirmaram que é tecnicamente possível derivar concentração,
abrangência por CFOP, valor médio por unidade, distribuição semanal e proporções de ICMS
com dados já presentes na escrituração. O resultado é uma demonstração do artefato sobre
base controlada, não evidência de impacto empresarial nem auditoria tributária.

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
