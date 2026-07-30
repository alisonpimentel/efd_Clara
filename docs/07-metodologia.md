# Metodologia

## Caracterização

- **Natureza:** aplicada, pois desenvolve uma solução para um problema prático.
- **Objetivos:** exploratória e descritiva, pois explora o reaproveitamento gerencial da
  EFD e descreve o comportamento do artefato.
- **Abordagem:** predominantemente qualitativa no desenho e quantitativa na verificação
  dos cálculos.
- **Procedimento técnico:** pesquisa documental, desenvolvimento de artefato e teste
  funcional controlado.

## Estratégia de desenvolvimento do artefato

A organização abaixo é inspirada na Design Science Research de Hevner et al. (2004), que
trata a construção e avaliação de artefatos como forma de ampliar capacidades humanas e
organizacionais. Não se afirma que todo o ciclo de avaliação com usuários foi concluído:

1. **identificação do problema:** baixa legibilidade gerencial do arquivo fiscal;
2. **definição dos objetivos:** traduzir registros selecionados em indicadores simples;
3. **projeto e desenvolvimento:** parser, base temporária, consultas, interface e
   exportações;
4. **demonstração:** execução com arquivo fictício;
5. **avaliação:** comparação entre valores esperados e obtidos;
6. **comunicação:** documentação do artefato, limitações e modelo de negócio.

## Etapas executadas

1. consulta ao Guia Prático da EFD ICMS/IPI;
2. seleção dos registros 0000, 0005, 0100, 0150, 0200, C100, C170, C190, E100,
   E110, H005 e H010;
3. definição das perguntas de negócio, fórmulas e referencial de visualização;
4. modelagem de requisitos e arquitetura;
5. criação de base fictícia controlada;
6. implementação incremental;
7. testes unitários do parser;
8. testes integrados do SQLite e dos indicadores;
9. verificação do build para hospedagem;
10. documentação de resultados, riscos e decisões.

## Dados

A avaliação inicial utiliza uma EFD totalmente fictícia, criada apenas para o projeto.
Nomes, CNPJs, chaves, documentos e valores não correspondem a pessoas ou empresas reais.
O uso de dados fictícios evita exposição fiscal e permite declarar antecipadamente os
resultados esperados.

## Instrumentos

- casos de teste automatizados;
- tabela de valores esperados e obtidos;
- logs do processo de build;
- arquivo fictício versionado;
- interface publicada;
- diário de decisões.

## Critérios de avaliação

- correção de leitura e normalização;
- correção dos relacionamentos;
- exclusão de cancelamentos;
- exatidão das somas e contagens;
- tratamento de ausência de C170/C190;
- tratamento de ausência de E110 e H005/H010;
- exatidão da evolução temporal e dos índices de concentração;
- reprodução dos valores declarados de apuração e inventário;
- preservação do escopo de privacidade;
- clareza das limitações na interface.

## Delimitação da validade

Os testes sustentam a correção do protótipo para os cenários cobertos. Não sustentam
generalização para todos os arquivos, unidades federativas, perfis de escrituração ou
situações fiscais. A avaliação com usuários e arquivos reais anonimizados é trabalho
futuro, sujeito a análise ética e de privacidade.
