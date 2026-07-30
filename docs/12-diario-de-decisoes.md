# Diário de decisões

## D01 - Escolher EFD ICMS/IPI

- **Data:** 30/07/2026
- **Motivo:** contém documentos, participantes, produtos e operações úteis a uma leitura
  de movimentação.
- **Alternativas:** EFD-Contribuições, ECD, ECF, eSocial ou múltiplos módulos.
- **Escolha:** apenas EFD ICMS/IPI.
- **Impacto:** reduz complexidade e torna os indicadores coerentes.
- **Validação:** conferir campos no Guia Prático 3.2.2.
- **Uso no TCC:** delimitação da fonte de dados.

## D02 - Não utilizar inteligência artificial

- **Motivo:** o problema é determinístico e o projeto não possui modelo de IA.
- **Alternativas:** classificador, assistente textual ou recomendação.
- **Escolha:** parser, SQL e BI.
- **Impacto:** evita promessa não demonstrável.
- **Validação:** nenhum pacote ou serviço de IA no artefato.
- **Uso no TCC:** delimitação tecnológica e honestidade metodológica.

## D03 - Limitar a um arquivo e 8 MB

- **Motivo:** controlar memória, tempo e escopo.
- **Alternativas:** múltiplos arquivos, 20 MB ou servidor.
- **Escolha:** um TXT de até 8 MB.
- **Impacto:** impede análise histórica, mas simplifica o MVP.
- **Validação:** rejeição antes da leitura.
- **Uso no TCC:** requisito não funcional.

## D04 - Processar no navegador

- **Motivo:** reduzir risco e infraestrutura.
- **Alternativas:** upload para API ou aplicação instalada.
- **Escolha:** leitura local com JavaScript.
- **Impacto:** o SPED não é persistido; exige navegador moderno.
- **Validação:** inexistência de rota de upload e inspeção de rede futura.
- **Uso no TCC:** privacidade desde a concepção.

## D05 - Usar SQLite apenas em memória

- **Motivo:** demonstrar transformação por SQL sem criar histórico fiscal.
- **Alternativas:** arrays JavaScript, OPFS persistente ou D1.
- **Escolha:** SQLite WebAssembly temporário.
- **Impacto:** consultas reproduzíveis e descarte após o resumo.
- **Validação:** banco fechado no bloco `finally`.
- **Uso no TCC:** arquitetura do artefato.

## D06 - Persistir somente interessados

- **Motivo:** medir procura inicial sem armazenar informações fiscais.
- **Alternativas:** nenhum cadastro, login completo ou histórico.
- **Escolha:** nome, e-mail, perfil e consentimentos em D1.
- **Impacto:** cria responsabilidade LGPD limitada.
- **Validação:** duas tabelas, sem endpoint público de listagem.
- **Uso no TCC:** modelagem de negócio e ética.

## D07 - Separar consentimentos

- **Motivo:** acesso e comunicação possuem finalidades diferentes.
- **Alternativas:** aceite único.
- **Escolha:** acesso obrigatório e novidades opcionais.
- **Impacto:** maior transparência e autonomia.
- **Validação:** caixa de comunicação começa desmarcada.
- **Uso no TCC:** governança de dados.

## D08 - Priorizar linguagem de negócio

- **Motivo:** público inclui usuários leigos.
- **Alternativas:** expor códigos e campos do SPED.
- **Escolha:** códigos aparecem apenas quando necessários, como CFOP.
- **Impacto:** menor carga cognitiva.
- **Validação:** perguntas e definições acompanham as métricas.
- **Uso no TCC:** proposta de valor.

## D09 - Não chamar diferença de lucro

- **Motivo:** a EFD não representa todas as receitas, despesas ou caixa.
- **Alternativas:** “resultado” ou “saldo”.
- **Escolha:** “diferença operacional” com aviso.
- **Impacto:** reduz interpretação indevida.
- **Validação:** teste de conteúdo e revisão da interface.
- **Uso no TCC:** limitação analítica.

## D10 - Usar base fictícia

- **Motivo:** reprodutibilidade e ausência de exposição.
- **Alternativas:** SPED real ou anonimizado.
- **Escolha:** arquivo sintético com valores esperados.
- **Impacto:** valida técnica, não externamente.
- **Validação:** testes automatizados.
- **Uso no TCC:** método e resultados.

## D11 - Excluir cancelados

- **Motivo:** documentos cancelados não devem inflar totais.
- **Alternativas:** incluir com marcação ou excluir totalmente.
- **Escolha:** contar como exceção e retirar de métricas/rankings.
- **Impacto:** melhora coerência dos agregados.
- **Validação:** cenário com documento de R$ 3.000 cancelado.
- **Uso no TCC:** regra de negócio.

## D12 - Publicar como artefato gratuito

- **Motivo:** facilitar demonstração e ampliar período de observação.
- **Alternativas:** execução local ou aplicativo desktop.
- **Escolha:** hospedagem web compatível com camada gratuita.
- **Impacto:** acesso simples; condições do provedor podem mudar.
- **Validação:** build e implantação pública.
- **Uso no TCC:** canal e viabilidade operacional.

