# Casos de teste e protocolo de validação

## Base fictícia controlada

| Elemento | Quantidade |
|---|---:|
| empresa | 1 |
| participantes | 4 |
| produtos | 3 |
| documentos C100 | 5 |
| documentos válidos | 4 |
| documento cancelado | 1 |
| itens C170 válidos | 6 |
| resumos C190 válidos | 4 |
| apurações E110 | 1 |
| inventários H005 | 1 |
| itens de inventário H010 | 3 |
| registro de entidade 0005 | 1 |
| registro de contabilista 0100 | 1 |

## Casos automatizados

| ID | Cenário | Resultado esperado | Status em 30/07/2026 |
|---|---|---|---|
| CT01 | número `1.234,56` | converter para `1234.56` | passou |
| CT02 | data `30062026` | converter para `2026-06-30` | passou |
| CT03 | relações do arquivo fictício | 4 participantes, 3 produtos e 5 documentos | passou |
| CT04 | documento cancelado | contar 1 e retirar seus itens/resumo | passou |
| CT05 | ausência de C170/C190 | manter C100 e gerar avisos | passou |
| CT06 | totais do SQLite | entradas 15.500 e saídas 27.000 | passou |
| CT07 | diferença e ticket | 11.500 e 10.625 | passou |
| CT08 | ICMS | 5.100 | passou |
| CT09 | rankings | fornecedor, cliente, produto e CFOP esperados | passou |
| CT10 | somente cancelamento | totais e ticket iguais a zero | passou |
| CT11 | tamanho máximo | aceitar 8 MB e rejeitar 8 MB + 1 byte | passou |
| CT12 | múltiplos arquivos | rejeitar dois arquivos na seleção | passou |
| CT13 | extensão inválida | rejeitar arquivo que não seja TXT | passou |
| CT14 | cadastro válido | normalizar nome/e-mail e preservar aceite opcional | passou |
| CT15 | aceite obrigatório | impedir cadastro sem privacidade | passou |
| CT16 | cadastro inválido | rejeitar e-mail e perfil inválidos | passou |
| CT17 | exportação | CSV conter totais e rankings esperados | passou |
| CT18 | CPF | aceitar CPF válido e rejeitar repetição inválida | passou |
| CT19 | senha administrativa | hash validar a senha correta e rejeitar outra | passou |
| CT20 | evolução temporal | quatro datas e valores diários esperados | passou |
| CT21 | concentração | três maiores representam 100% na base sintética | passou |
| CT22 | apuração do ICMS | E110 reproduzir R$ 1.080,00 a recolher | passou |
| CT23 | inventário | H005/H010 reproduzir R$ 22.000,00 e três itens | passou |
| CT24 | estados opcionais | ausência de E110/H005 gerar aviso sem interromper | passou |
| CT25 | identificação inicial | fantasia, IE, endereço, competência e CRC esperados | passou |
| CT26 | privacidade do contabilista | CPF mascarado na tela e ausente no CSV | passou |
| CT27 | campos tributários do C170 | unidade, quantidade, base, alíquota e ICMS esperados | passou |
| CT28 | curva ABC de clientes | maior cliente com 66,7% e classe A | passou |
| CT29 | curva ABC de produtos | Café Torrado como item de maior valor | passou |
| CT30 | valor médio por unidade | Café Torrado nas saídas com R$ 15,00 por UN | passou |
| CT31 | abrangência por CFOP | 66,7% internas e 33,3% interestaduais | passou |
| CT32 | distribuição semanal | quinta-feira com dois documentos e média de R$ 6.750,00 | passou |
| CT33 | cancelamentos por direção | 0% nas entradas e 33,3% nas saídas | passou |
| CT34 | indicadores de ICMS | 100% das entradas C190 com ICMS informado e carga aparente de 4% | passou |
| CT35 | codificação do TXT | preservar UTF-8 e recuperar acentos de Windows-1252 | passou |
| CT36 | cobertura e competência | apontar saída sem C170 e um documento fora do período | passou |

Os cenários unitários são cobertos por dezessete funções de teste automatizado distribuídas
em seis suítes.

## Testes de ponta a ponta

| ID | Cenário | Resultado |
|---|---|---|
| E2E01 | cadastro, aceite, 8 MB, dashboard, CSV e nova análise | passou |
| E2E02 | viewport móvel de 375 × 812 px | passou sem rolagem horizontal |
| E2E03 | inspeção dos corpos enviados pela rede | nenhum registro `0000` ou `C100` transmitido |
| E2E04 | abas ABC, produtos e ICMS | gráficos novos renderizados e valores esperados visíveis |
| E2E05 | nomes longos e TXT Windows-1252 em 375 × 812 px | acentos preservados e nenhuma rolagem horizontal nas quatro áreas |

Os três testes E2E foram executados em Chrome real contra a aplicação local conectada ao
banco gratuito.

Uma EFD real fornecida pelo autor também foi usada para inspeção exploratória no navegador.
O arquivo não foi copiado para o repositório, exportado como evidência ou incluído nos
testes. Essa inspeção revelou a necessidade de suportar Windows-1252 e de acomodar nomes
empresariais e descrições extensas.

## Valores esperados da demonstração

| Indicador | Esperado |
|---|---:|
| entradas | R$ 15.500,00 |
| saídas | R$ 27.000,00 |
| diferença operacional | R$ 11.500,00 |
| documentos válidos | 4 |
| documentos cancelados | 1 |
| ICMS escriturado | R$ 5.100,00 |
| ticket médio | R$ 10.625,00 |
| ticket médio de entrada | R$ 7.750,00 |
| ticket médio de saída | R$ 13.500,00 |
| ICMS nas entradas C190 | R$ 1.860,00 |
| ICMS nas saídas C190 | R$ 3.240,00 |
| ICMS a recolher E110 | R$ 1.080,00 |
| entradas com ICMS informado | 100% |
| indicador aparente de ICMS | 4% |
| saídas internas | 66,7% |
| saídas interestaduais | 33,3% |
| cancelamento de entradas | 0% |
| cancelamento de saídas | 33,3% |
| SKUs movimentados/com saída | 3 / 3 |
| valor médio do Café Torrado nas saídas | R$ 15,00 por UN |
| inventário H005 | R$ 22.000,00 |
| maior fornecedor | Distribuidora Horizonte Ltda - R$ 10.000,00 |
| maior cliente | Mercado Novo Dia Ltda - R$ 18.000,00 |
| produto de maior valor nas saídas | Café Torrado 500g - R$ 12.000,00 |
| CFOP de maior valor | 5102 - R$ 18.000,00 |

## Testes manuais ainda recomendados

| ID | Verificação | Procedimento |
|---|---|---|
| MT01 | limite de 8 MB | confirmar mensagem visual ao selecionar TXT acima do limite |
| MT02 | formato | confirmar mensagem visual ao selecionar arquivo sem extensão TXT |
| MT03 | teclado | percorrer cadastro, upload, abas e exportações sem mouse |
| MT04 | tela estreita | testar em 320 e 375 CSS px |
| MT05 | zoom | verificar 200% e 400% |
| MT06 | impressão | salvar PDF e conferir cortes |
| MT07 | rede | confirmar ausência de requisição com conteúdo fiscal |
| MT08 | novo arquivo | gerar painel, iniciar nova análise e verificar limpeza |

## Comando reproduzível

```bash
npm run test
npm run test:e2e
```

O teste deve retornar zero falhas. Alterações nas fórmulas exigem atualização simultânea
do arquivo fictício, dos resultados esperados e deste documento.
