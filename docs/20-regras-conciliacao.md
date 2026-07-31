# Regras de conciliação

## Validações anteriores ao cruzamento

1. os dois arquivos devem ser reconhecidos pelos respectivos registros 0000;
2. as competências devem ser iguais;
3. o CNPJ completo da EFD ICMS/IPI deve existir no 0140 da EFD-Contribuições;
4. o mesmo CNPJ deve aparecer em um contexto C010 para conciliação documental;
5. igualdade apenas da raiz do CNPJ não autoriza o cruzamento.

## Documentos

### Prioridade 1 — chave

```text
establishment_cnpj + document_key
```

Requer chave válida e única nas duas fontes.

### Prioridade 2 — chave composta

```text
establishment_cnpj
+ operation
+ model
+ series
+ document_number
+ issue_date
+ participant_document
```

O valor total valida a correspondência, mas não participa sozinho da identidade.

### Classificações

| Classe | Regra resumida |
|---|---|
| `CONCILIADO_EXATO` | chave válida e valores dentro da tolerância, ou chave composta completa e única |
| `CONCILIADO_COM_DIVERGENCIA` | identidade exata, mas campos financeiros ou cadastrais divergem |
| `CONCILIADO_PROVAVEL` | chave composta parcial única, confiança acima do limite e sem conflito |
| `SOMENTE_ICMS_IPI` | documento sem candidato na EFD-Contribuições |
| `SOMENTE_CONTRIBUICOES` | documento sem candidato na EFD ICMS/IPI |
| `AMBIGUO` | mais de um candidato plausível ou conflito de identidade |

## Itens

| Prioridade | Método | Confiança máxima |
|---:|---|---:|
| 1 | documento conciliado + número do item | 1,00 |
| 2 | documento conciliado + código de produto | 0,95 |
| 3 | documento + NCM + quantidade + unidade + valor | 0,85 |
| 4 | descrição normalizada | sugestão, nunca conciliação automática |

Uma correspondência só pode ser automática quando for única nos dois sentidos. Empates
ou múltiplos candidatos geram `AMBIGUO`.

## Pontuação inicial

| Evidência | Pontos |
|---|---:|
| chave de NF-e válida e igual | 100 |
| estabelecimento completo igual | obrigatório |
| modelo igual | 15 |
| série igual | 10 |
| número igual | 20 |
| operação igual | 10 |
| data igual | 15 |
| participante igual | 15 |
| valor dentro da tolerância | 15 |
| número de item igual | 40 |
| código de produto igual | 30 |
| NCM, quantidade, unidade e valor iguais | 25 |

O valor final é limitado a 100 e armazenado com o método. A primeira versão usa:

- 100 por chave válida ou chave composta completa e única: exato;
- 80 a 99: provável, desde que candidato único;
- abaixo de 80: não conciliado automaticamente;
- qualquer empate: ambíguo.

Os limites são decisões do artefato e devem ser avaliados nos testes; não são regras
fiscais oficiais.

Para uma correspondência pontuada, estabelecimento completo, direção, modelo e número
iguais são pré-condições. Essa barreira impede que dois documentos de números diferentes
sejam ligados apenas porque possuem data, participante e valor semelhantes.

## Cobertura

```text
taxa_documental = documentos conciliados / documentos canônicos analisáveis
cobertura_financeira = valor dos documentos conciliados / valor dos documentos analisáveis
taxa_itens = itens conciliados / itens dos documentos conciliados com detalhamento nas duas fontes
```

Denominador zero gera `NOT_APPLICABLE`. Ausência de C100/C170 individualizado em uma das
fontes gera `NOT_AVAILABLE` ou `PARTIAL`, nunca zero.
