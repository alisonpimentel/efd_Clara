# Limitações e riscos

## Limitações de dados

- a EFD não contém todas as receitas e despesas da organização;
- caixa, folha, empréstimos, despesas bancárias e informações gerenciais podem estar fora
  do arquivo;
- a presença de C170 varia conforme escrituração e situação; em NF-e/NFC-e de emissão
  própria, modelos 55 e 65, a ausência pode ser esperada;
- quando o C170 não está disponível, curvas ABC, mix, quantidade e valor médio por produto
  representam somente a parcela detalhada; uma visão completa pode exigir XML ou ERP;
- cobertura elegível de 100% não significa que 100% das operações possuam itens; a
  disponibilidade total deve ser lida em conjunto;
- descrições e relacionamentos dependem da qualidade de 0150 e 0200;
- uma única competência combinada não permite análise histórica.

## Limitações analíticas

- diferença entre entradas e saídas não é lucro;
- ICMS destacado no C190 não é imposto a recolher;
- o valor de ICMS a recolher exibido vem do E110 e não é recalculado ou auditado;
- rankings mostram concentração de valor, não margem;
- curva ABC classifica o valor acumulado da competência e não comprova a regra empírica
  80/20;
- valor médio por unidade é calculado com `VL_ITEM` e `QTD`; não representa
  necessariamente preço comercial, custo contábil ou margem;
- SKUs movimentados são os itens presentes nos C170 disponíveis, não todo o catálogo do
  sistema empresarial;
- classificação interna, interestadual e exterior depende do CFOP informado;
- distribuição por dia da semana em uma competência não constitui sazonalidade histórica;
- a análise temporal usa `DT_E_S` quando disponível e `DT_DOC` como alternativa; uma data
  de emissão anterior com entrada ou saída dentro do período não é, isoladamente, erro;
- a proporção de entradas com ICMS informado não determina direito jurídico ao crédito;
- ICMS a recolher dividido pelas saídas é denominado indicador aparente, não alíquota
  efetiva;
- o ticket médio geral combina naturezas distintas; por isso, a interface prioriza
  tickets separados de entrada e saída;
- concentração dos três maiores é uma pista exploratória, não um diagnóstico de risco;
- o inventário depende da presença do Bloco H, que não aparece em todo arquivo ou período;
- o protótipo não interpreta regras estaduais ou regimes especiais.
- a elegibilidade do C170 é um critério metodológico do artefato, não conclusão sobre
  obrigação ou conformidade fiscal;
- o protótipo não realiza auditoria de combinações CFOP/CST nem emite diagnóstico fiscal.
- `não disponível` não significa que a operação não ocorreu; significa apenas que o
  recorte de registros interpretado não sustenta aquele indicador;
- valores iguais a zero só são conclusivos dentro da população e dos registros
  efetivamente analisados;
- indicadores parciais não são extrapolados para documentos sem C170, C190 ou participante
  identificado.
- a conciliação não prova que dois registros representam juridicamente a mesma operação;
  ela documenta uma correspondência técnica segundo as regras do protótipo;
- EFD-Contribuições com `IND_ESCRI = 1` pode não possuir C100/C170 individualizados; nesse
  caso, conciliação documental ou de itens pode ficar indisponível;
- documentos presentes somente na EFD-Contribuições não são acrescentados aos totais
  empresariais por padrão, para evitar dupla contagem sem confirmação;
- PIS e Cofins exibidos vêm dos registros informados e não são recalculados.

## Limitações técnicas

- máximo de 8 MB para cada um dos dois arquivos da análise integrada;
- processamento depende de navegador moderno com WebAssembly;
- arquivo muito complexo pode consumir memória perceptível;
- não há validação completa do leiaute;
- a identificação preventiva diferencia o recorte pelos campos do registro `0000`, mas
  não substitui a validação oficial do PVA;
- a rota inicial recusa EFD-Contribuições; a rota integrada a aceita no campo próprio;
  ECD, ECF e outros módulos continuam fora do escopo;
- apenas doze registros são interpretados;
- município é exibido pelo código IBGE informado; o protótipo não consulta serviços
  externos para converter o código em nome;
- dados cadastrais refletem o conteúdo da EFD e não são validados em cadastros externos;
- não há histórico nem recuperação da análise;
- PDF depende do recurso de impressão do navegador.
- o desempenho de duas entradas próximas de 8 MB foi medido com linhas sintéticas; arquivos
  densos em C100/C170 podem exigir mais memória e tempo;
- o processamento ainda ocorre na thread principal; Web Worker é evolução recomendada
  antes de ampliar o limite ou a densidade suportada.

## Limitações metodológicas

- base de avaliação fictícia;
- não houve estudo controlado com usuários;
- não houve comparação com software concorrente;
- não foram mensurados tempo, aprendizagem ou satisfação;
- o cadastro mede interesse, não impacto.

## Matriz de riscos

| Risco | Probabilidade | Impacto | Resposta |
|---|---|---|---|
| usuário interpretar diferença como lucro | média | alta | aviso permanente e rótulo “operacional” |
| arquivo real usar cenário não coberto | alta | média | avisos, delimitação e testes futuros |
| exposição por dispositivo comprometido | baixa/média | alta | não armazenar nem transmitir o SPED |
| cadastro sem governança posterior | média | média | minimização, solicitações e revisão de retenção |
| camada gratuita mudar | média | média | arquitetura portável e ausência de arquivos em nuvem |
| excesso de cadastros automatizados | média | baixa | validação, honeypot e futura proteção adicional |
| promessa acadêmica superar evidência | média | alta | separar resultado técnico de impacto |
| conciliação provável interpretada como certeza | média | alta | método, confiança e classe visíveis |
| matriz centralizada ligar filial errada | baixa/média | alta | exigir CNPJ completo no 0140/C010 |

## Trabalhos futuros

1. ampliar casos sintéticos por leiaute e situação;
2. testar arquivos reais anonimizados e autorizados;
3. avaliar compreensão com protocolo aprovado;
4. medir tempo de tarefa e erros de interpretação;
5. acrescentar comparação entre períodos somente após validar o MVP;
6. avaliar autenticação e governança antes de qualquer histórico;
7. realizar revisão jurídica e de segurança para uso comercial.
8. mover parser e cálculos para Web Worker e medir pico de memória;
9. avaliar C180/C190 consolidado sem reconstruir documentos inexistentes;
10. validar manualmente pares reais autorizados por cenário de escrituração.
