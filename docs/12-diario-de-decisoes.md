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
- **Alternativas:** arrays JavaScript, OPFS persistente ou banco no servidor.
- **Escolha:** SQLite WebAssembly temporário.
- **Impacto:** consultas reproduzíveis e descarte após o resumo.
- **Validação:** banco fechado no bloco `finally`.
- **Uso no TCC:** arquitetura do artefato.

## D06 - Persistir somente interessados

- **Motivo:** medir procura inicial sem armazenar informações fiscais.
- **Alternativas:** nenhum cadastro, login completo ou histórico.
- **Escolha:** nome, e-mail, perfil e consentimentos em PostgreSQL gratuito.
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

## D13 - Usar GitHub como fonte de verdade

- **Motivo:** garantir versionamento, reprodutibilidade e histórico auditável.
- **Alternativas:** manter somente cópia local ou publicar diretamente pela hospedagem.
- **Escolha:** repositório `alisonpimentel/efd_Clara`, branch principal.
- **Impacto:** cada alteração publicada pode ser relacionada a um commit.
- **Validação:** comparação do commit local com a branch remota.
- **Uso no TCC:** rastreabilidade do desenvolvimento.

## D14 - Migrar o backend mínimo para Vercel e PostgreSQL

- **Motivo:** alinhar o código à hospedagem solicitada sem criar armazenamento fiscal.
- **Alternativas:** manter a infraestrutura anterior, remover cadastro ou criar backend
  próprio.
- **Escolha:** Vercel Hobby e Neon Free, apenas para interessados e solicitações.
- **Impacto:** três variáveis do banco e duas credenciais administrativas no ambiente;
  nenhum dado fiscal adicional.
- **Validação:** testes das rotas e inspeção de rede no deploy.
- **Uso no TCC:** infraestrutura cloud e viabilidade de custo zero.

## D15 - Proteger o relatório por CPF sem armazenar o CPF

- **Motivo:** reservar a lista ao responsável sem guardar um identificador sensível em
  texto.
- **Alternativas:** senha única, OAuth externo ou CPF criptografado reversível.
- **Escolha:** HMAC do CPF, scrypt com sal para a senha e sessão assinada.
- **Impacto:** o CPF original não pode ser lido no banco; perda da senha exige processo
  controlado de recuperação.
- **Validação:** testes de CPF, senha e acesso não autenticado.
- **Uso no TCC:** segurança e privacidade desde a concepção.

## D16 - Registrar recorrência mínima

- **Motivo:** permitir relatório de uso sem criar histórico fiscal.
- **Alternativas:** analytics de terceiros ou eventos detalhados.
- **Escolha:** contagem e data do último acesso por e-mail cadastrado.
- **Impacto:** melhora a leitura exploratória de interesse e amplia o aviso de
  privacidade.
- **Validação:** novo cadastro inicia em um e acesso repetido incrementa o total.
- **Uso no TCC:** evidência exploratória de procura, sem confundir com validação.

## D17 - Preparar descoberta orgânica

- **Motivo:** tornar as páginas públicas compreensíveis para buscadores.
- **Alternativas:** anúncios, domínio pago ou ausência de indexação.
- **Escolha:** metadados, URL canônica, sitemap, robots e JSON-LD.
- **Impacto:** facilita rastreamento, mas não garante posição no Google.
- **Validação:** abrir `/robots.txt`, `/sitemap.xml` e conferir metadados.
- **Uso no TCC:** canal digital de baixo custo.

## D18 - Organizar o BI por decisões

- **Motivo:** rankings isolados não constituíam uma análise gerencial suficientemente
  consistente.
- **Alternativas:** aumentar apenas a quantidade de gráficos ou manter o painel inicial.
- **Escolha:** organizar o painel em retrato executivo, concentração, produtos/inventário
  e fiscal/qualidade.
- **Impacto:** cada seção responde a uma pergunta de negócio e liga o dado a uma ação de
  investigação.
- **Validação:** testes dos cálculos e verificação visual em desktop e celular.
- **Uso no TCC:** desenho do artefato e proposta de valor.

## D19 - Adotar Few, IBCS e Knaflic como referencial visual

- **Motivo:** justificar academicamente as escolhas de visualização.
- **Alternativas:** decisões apenas estéticas ou uso de um tema pronto sem fundamentação.
- **Escolha:** visão de relance, séries temporais horizontais, comparações em barras,
  escalas honestas, cores consistentes e narrativa do geral ao detalhe.
- **Impacto:** remoção de elementos decorativos sem função e inclusão de fonte, pergunta e
  valores exatos em cada visualização.
- **Validação:** revisão contra o fichamento de fontes e inspeção de acessibilidade.
- **Uso no TCC:** referencial teórico de BI e visualização.

## D20 - Incluir E110 e Bloco H como visões opcionais

- **Motivo:** entregar ao contador uma leitura mais relevante que os totais de documentos.
- **Alternativas:** estimar imposto pelo C190 ou inferir estoque pelas entradas e saídas.
- **Escolha:** reproduzir somente os valores oficialmente declarados no E110, H005 e H010.
- **Impacto:** o painel apresenta apuração própria do ICMS e inventário quando disponíveis,
  sem inventar dados quando os registros faltam.
- **Validação:** base fictícia com valores conhecidos e estados de ausência.
- **Uso no TCC:** escopo técnico, indicadores e limitações.

## D21 - Conferir os registros iniciais antes do BI

- **Motivo:** evitar que o usuário analise uma competência ou estabelecimento diferente
  do pretendido.
- **Alternativas:** manter somente a razão social no título ou exibir todos os campos sem
  hierarquia.
- **Escolha:** bloco compacto com 0000, 0005 e 0100 antes dos indicadores.
- **Impacto:** razão social, fantasia, período, endereço, perfil e contabilista podem ser
  conferidos antes da leitura gerencial.
- **Privacidade:** CPF do contabilista mascarado e excluído do CSV; nenhum campo é enviado
  ao servidor.
- **Validação:** base fictícia, testes do parser, CSV, desktop e celular.
- **Uso no TCC:** contexto do artefato, rastreabilidade e privacidade desde a concepção.

## D22 - Concentrar o recorte tributário em ICMS

- **Motivo:** o projeto utiliza a EFD ICMS/IPI e já interpreta C100, C170, C190 e E110;
  incluir PIS/Cofins aumentaria o escopo e não sustentaria uma análise completa desses
  tributos.
- **Alternativas:** combinar ICMS, PIS e Cofins; analisar somente gestão comercial; criar
  auditoria tributária automática.
- **Escolha:** manter análises comerciais derivadas da movimentação fiscal e concentrar a
  leitura tributária no ICMS informado.
- **Impacto:** inclusão de curva ABC, abrangência por CFOP, valor médio unitário,
  cancelamento por direção, entradas com ICMS informado e indicador aparente de ICMS.
- **Limite:** nenhum indicador determina direito ao crédito, alíquota efetiva, erro fiscal
  ou valor devido recalculado pelo protótipo.
- **Validação:** fórmulas reproduzidas na base fictícia, testes unitários, fluxo E2E,
  inspeção visual em desktop e celular e exportação CSV.
- **Uso no TCC:** delimitação temática, construção do artefato, resultados e limitações.

## D23 - Usar classes ABC sem afirmar o princípio 80/20

- **Motivo:** a concentração acumulada é útil para priorização, mas a proporção 80/20 não
  pode ser presumida.
- **Alternativas:** mostrar somente os cinco maiores ou afirmar Pareto como resultado.
- **Escolha:** calcular participação e percentual acumulado, com classe A até 80%, B até
  95% e C no restante.
- **Impacto:** o usuário visualiza concentração de clientes e produtos com valores exatos.
- **Validação:** maior cliente com 66,7% na base sintética e Café Torrado como produto de
  maior valor nas saídas.
- **Uso no TCC:** indicador gerencial, fórmula e cuidado interpretativo.

## D24 - Compatibilizar codificação e conteúdo real variável

- **Motivo:** a inspeção de uma EFD real revelou acentos corrompidos e nomes capazes de
  ampliar as grades além da largura do celular.
- **Alternativas:** exigir somente UTF-8; alterar manualmente o arquivo; truncar todos os
  textos; enviar o TXT a um servidor para conversão.
- **Escolha:** tentar UTF-8 estrito no navegador e usar Windows-1252 quando os bytes não
  formarem UTF-8 válido. As grades e seus filhos recebem largura mínima zero, quebra
  segura e organização vertical quando os conteúdos possuem alturas muito diferentes.
- **Impacto:** textos fiscais legados preservam acentos, as quatro áreas permanecem na
  largura da tela e os painéis não criam grandes vazios artificiais.
- **Privacidade:** a EFD real permaneceu na sessão do navegador e não foi copiada para
  testes, repositório ou documentação.
- **Validação:** duas codificações em teste unitário e fluxo móvel com nome empresarial
  longo, descrição acentuada e inspeção das quatro abas.
- **Uso no TCC:** avaliação do artefato, evolução orientada por teste e limitação dos dados
  sintéticos.

## D25 - Expor cobertura do C170 e datas fora da competência

- **Motivo:** totais documentais podem existir sem itens detalhados, e documentos
  escriturados no período podem trazer data de emissão anterior.
- **Alternativas:** ocultar rankings vazios; inferir produtos pelo C190; excluir datas fora
  do período; classificar automaticamente as ocorrências como erro.
- **Escolha:** informar a cobertura de documentos com C170 separada por entrada e saída e
  contar documentos ativos fora da competência declarada.
- **Impacto:** o usuário entende por que uma análise de produtos pode estar indisponível e
  identifica a necessidade de contextualizar escriturações extemporâneas.
- **Limite:** os indicadores não concluem que há irregularidade nem determinam a causa da
  ausência de itens ou da data externa ao período.
- **Validação:** caso automatizado com cobertura de saída igual a zero e um documento fora
  da competência.
- **Uso no TCC:** qualidade de dados, transparência metodológica e limitações do artefato.

## D26 - Corrigir a semântica temporal e tratar C170 como disponibilidade

- **Problema observado:** ao carregar uma EFD real, a interface mostrou 21 documentos fora
  da competência e 0% de C170 nas saídas. A apresentação permitia interpretar os dois
  números como defeitos do arquivo.
- **Causa:** a primeira versão usava `DT_DOC` como data única da análise e apresentava a
  presença de C170 dentro de uma seção intitulada qualidade. Para entradas, a emissão pode
  anteceder legitimamente a entrada escriturada; para NF-e/NFC-e de emissão própria, a
  ausência de C170 pode ser esperada.
- **Alternativas consideradas:** manter uma única data; excluir documentos emitidos antes
  do período; tratar todo C170 ausente como falha; inferir itens pelo C190; exigir XML ou
  integração com ERP.
- **Escolha:** preservar `DT_DOC` e `DT_E_S`; usar `DT_E_S` como data de referência e
  `DT_DOC` apenas como alternativa; contar emissões anteriores separadamente; renomear a
  métrica para disponibilidade de itens; separar documentos eletrônicos de emissão
  própria sem C170 das demais ausências.
- **Impacto no artefato:** a série temporal, a distribuição semanal e a conferência de
  competência passam a representar o movimento escriturado. A interface deixa explícito
  que C170 limita somente as análises por produto e não constitui nota de qualidade.
- **Limite:** o protótipo não conclui regularidade fiscal, não reconstrói itens ausentes e
  não substitui conciliação com XML, ERP ou profissional habilitado.
- **Validação:** testes unitários com emissão anterior e movimento no período; cenário com
  movimento realmente externo; fluxo móvel sem C170 nas saídas; inspeção do texto e da
  organização visual.
- **Evidência preservada:** somente quantidades e comportamento do protótipo. Nenhuma linha,
  identificação ou conteúdo da EFD real foi gravado no repositório.
- **Uso no TCC:** ciclo de avaliação e refinamento do artefato, qualidade semântica dos
  indicadores, transparência metodológica e limitações da fonte de dados.
