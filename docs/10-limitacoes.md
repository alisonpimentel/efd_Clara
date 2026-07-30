# Limitações e riscos

## Limitações de dados

- a EFD não contém todas as receitas e despesas da organização;
- caixa, folha, empréstimos, despesas bancárias e informações gerenciais podem estar fora
  do arquivo;
- a presença de C170 varia conforme escrituração e situação;
- descrições e relacionamentos dependem da qualidade de 0150 e 0200;
- um único arquivo não permite análise histórica.

## Limitações analíticas

- diferença entre entradas e saídas não é lucro;
- ICMS escriturado não é imposto a recolher;
- rankings mostram concentração de valor, não margem;
- ticket médio combina documentos de naturezas distintas;
- o protótipo não interpreta regras estaduais ou regimes especiais.

## Limitações técnicas

- máximo de 8 MB;
- processamento depende de navegador moderno com WebAssembly;
- arquivo muito complexo pode consumir memória perceptível;
- não há validação completa do leiaute;
- apenas seis registros são interpretados;
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

