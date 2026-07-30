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

Os dez cenários são cobertos por cinco funções de teste automatizado.

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
| maior fornecedor | Distribuidora Horizonte Ltda - R$ 10.000,00 |
| maior cliente | Mercado Novo Dia Ltda - R$ 18.000,00 |
| produto de maior valor nas saídas | Café Torrado 500g - R$ 12.000,00 |
| CFOP de maior valor | 5102 - R$ 18.000,00 |

## Testes manuais ainda recomendados

| ID | Verificação | Procedimento |
|---|---|---|
| MT01 | limite de 8 MB | selecionar TXT acima do limite |
| MT02 | formato | selecionar arquivo sem extensão TXT |
| MT03 | teclado | percorrer cadastro, upload, abas e exportações sem mouse |
| MT04 | tela estreita | testar em 320 e 375 CSS px |
| MT05 | zoom | verificar 200% e 400% |
| MT06 | impressão | salvar PDF e conferir cortes |
| MT07 | rede | confirmar ausência de requisição com conteúdo fiscal |
| MT08 | novo arquivo | gerar painel, iniciar nova análise e verificar limpeza |

## Comando reproduzível

```bash
npm test
```

O teste deve retornar zero falhas. Alterações nas fórmulas exigem atualização simultânea
do arquivo fictício, dos resultados esperados e deste documento.

