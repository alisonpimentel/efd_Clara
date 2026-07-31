# Escopo e delimitação

## Incluído no MVP

- acesso web público;
- cadastro prévio de nome, e-mail, perfil e consentimentos;
- um arquivo TXT por análise;
- limite máximo de 8 MB;
- EFD ICMS/IPI;
- registros `0000`, `0005`, `0100`, `0150`, `0200`, `C100`, `C170`, `C190`,
  `E100`, `E110`, `H005` e `H010`;
- conferência cadastral da entidade, competência e contabilista responsável;
- documentos de entrada e saída;
- exclusão de documentos com situação cancelada (`02` e `03`) dos totais;
- base SQLite temporária em memória;
- quatro áreas: visão executiva, relações, produtos/inventário e ICMS/limites;
- evolução temporal, concentração dos três maiores e leituras gerenciais exploratórias;
- reprodução da apuração própria do ICMS e do inventário quando presentes;
- explicações de interpretação, disponibilidade e conciliação;
- exportação CSV e impressão/salvamento em PDF;
- nova análise com limpeza do estado anterior;
- armazenamento persistente apenas de interessados e solicitações de privacidade.

## Fora do MVP

- inteligência artificial ou aprendizado de máquina;
- EFD-Contribuições, ECD, ECF, eSocial e outros módulos do SPED;
- múltiplos arquivos ou comparação histórica;
- armazenamento, sincronização ou compartilhamento de arquivos fiscais;
- autenticação com senha e perfis de usuário;
- integração com ERP, contador, Receita Federal ou SEFAZ;
- validação oficial do arquivo;
- auditoria tributária, apuração, cálculo de impostos ou recomendação fiscal;
- lucro, prejuízo, fluxo de caixa, rentabilidade ou projeções;
- painel administrativo público;
- cobrança e assinatura.

## Unidade de análise

Uma execução corresponde a um único arquivo EFD ICMS/IPI e produz um resumo temporário
do período nele informado. Iniciar nova análise substitui o resumo anterior.

## Critério de sucesso do MVP

O MVP é considerado tecnicamente bem-sucedido quando:

1. aceita um arquivo válido dentro do limite;
2. rejeita formato ou tamanho incompatível;
3. interpreta os registros selecionados;
4. reproduz os valores esperados na base fictícia;
5. não envia o conteúdo do arquivo a rotas de servidor;
6. oferece leitura e exportação sem erro bloqueante.
