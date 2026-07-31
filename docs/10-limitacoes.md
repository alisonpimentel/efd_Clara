# Limitações e riscos

## Limitações de dados

- a EFD não contém todas as receitas e despesas da organização;
- caixa, folha, empréstimos, despesas bancárias e informações gerenciais podem estar fora
  do arquivo;
- a presença de C170 varia conforme escrituração e situação; em NF-e/NFC-e de emissão
  própria, modelos 55 e 65, a ausência pode ser esperada;
- quando o C170 não está disponível, curvas ABC, mix, quantidade e valor médio por produto
  representam somente a parcela detalhada; uma visão completa pode exigir XML ou ERP;
- descrições e relacionamentos dependem da qualidade de 0150 e 0200;
- um único arquivo não permite análise histórica.

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
- o protótipo não realiza auditoria de combinações CFOP/CST nem emite diagnóstico fiscal.

## Limitações técnicas

- máximo de 8 MB;
- processamento depende de navegador moderno com WebAssembly;
- arquivo muito complexo pode consumir memória perceptível;
- não há validação completa do leiaute;
- a identificação preventiva diferencia o recorte pelos campos do registro `0000`, mas
  não substitui a validação oficial do PVA;
- EFD-Contribuições, ECD, ECF e outros módulos são recusados, ainda que também sejam TXT;
- apenas doze registros são interpretados;
- município é exibido pelo código IBGE informado; o protótipo não consulta serviços
  externos para converter o código em nome;
- dados cadastrais refletem o conteúdo da EFD e não são validados em cadastros externos;
- não há histórico nem recuperação da análise;
- PDF depende do recurso de impressão do navegador.

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

## Trabalhos futuros

1. ampliar casos sintéticos por leiaute e situação;
2. testar arquivos reais anonimizados e autorizados;
3. avaliar compreensão com protocolo aprovado;
4. medir tempo de tarefa e erros de interpretação;
5. acrescentar comparação entre períodos somente após validar o MVP;
6. avaliar autenticação e governança antes de qualquer histórico;
7. realizar revisão jurídica e de segurança para uso comercial.
