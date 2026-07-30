# Modelo de negócio

## Proposta

O EFD Clara transforma um arquivo fiscal já existente em uma primeira leitura visual,
sem instalação e sem envio do conteúdo fiscal para servidores externos.

## Business Model Canvas

### Segmentos de clientes

- pequenos empresários do comércio;
- contadores em início de carreira;
- pequenos escritórios contábeis;
- estudantes e consultores.

O segmento prioritário do MVP é composto por pequenos empresários e contadores iniciantes
que possuem a EFD, mas não dispõem de BI dedicado.

### Proposta de valor

- linguagem gerencial em vez de registros técnicos;
- acesso pelo navegador;
- processamento local e privado;
- uso de um arquivo que a organização já possui;
- demonstração gratuita;
- exportação simples.

### Canais

- site público;
- conteúdo educacional;
- comunidades contábeis e empresariais;
- instituições de ensino;
- indicação de profissionais.

### Relacionamento

- autoatendimento guiado;
- explicações junto às métricas;
- arquivo demonstrativo;
- comunicação opcional por e-mail;
- evolução baseada em dúvidas e sinais de interesse.

### Fontes de receita futuras

O MVP permanece gratuito. Hipóteses posteriores, ainda não validadas:

- versão profissional com comparação de períodos;
- licença para pequenos escritórios;
- relatório com identidade do escritório;
- capacitação e material educacional.

Não há cobrança implementada nem previsão de receita comprovada.

### Recursos principais

- conhecimento do leiaute EFD;
- parser e regras de transformação;
- interface e infraestrutura de hospedagem;
- documentação e testes;
- governança de privacidade.

### Atividades principais

- manter compatibilidade com o leiaute;
- testar cálculos e casos;
- melhorar comunicação de dados;
- garantir privacidade e disponibilidade;
- analisar interesse pelo produto.

### Parceiros principais

- provedores de hospedagem;
- instituições e comunidades de contabilidade;
- profissionais para revisão contábil, jurídica e de segurança;
- usuários-piloto autorizados.

### Estrutura de custos

- domínio próprio, se adotado;
- hospedagem acima da camada gratuita;
- revisão técnica, contábil e jurídica;
- suporte e manutenção;
- segurança e monitoramento em etapa comercial.

## Hipóteses a validar

| Hipótese | Métrica inicial | Evidência atual |
|---|---|---|
| existe interesse no acesso | cadastros por perfil | mecanismo implementado, sem série histórica |
| usuários concluem a análise | análises iniciadas/concluídas | não coletado por privacidade no MVP |
| linguagem é compreensível | acerto em tarefas de leitura | não avaliado |
| privacidade local gera confiança | percepção em estudo | não avaliado |
| versão profissional teria valor | intenção de pagamento | não avaliado |

## Viabilidade inicial

A viabilidade técnica foi demonstrada em caso controlado. A viabilidade econômica é
apenas potencial: a arquitetura tem baixo custo e evita armazenamento fiscal, mas não
existem dados suficientes sobre aquisição, suporte, preço ou disposição a pagar.

