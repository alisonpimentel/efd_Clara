# Infraestrutura em nuvem

## Objetivo

Disponibilizar o artefato por longo período com custo inicial zero, mantendo o arquivo
fiscal fora da infraestrutura de nuvem.

## Componentes

| Camada | Serviço | Plano adotado | Finalidade |
|---|---|---|---|
| código | GitHub | gratuito | fonte oficial e histórico |
| aplicação | Vercel | Hobby | HTML, JavaScript, funções mínimas e deploy |
| cadastro | Neon | Free | interessados e solicitações de privacidade |
| análise fiscal | navegador | local | parser, SQLite temporário e dashboard |

## Separação dos fluxos

O navegador baixa o código público pela Vercel. O formulário de interesse envia apenas
nome, e-mail, perfil e consentimentos para a rota de cadastro. O seletor de EFD não usa
formulário de upload: `File.text()` lê o conteúdo na própria página e o encaminha
diretamente ao parser local.

## Variáveis de ambiente

- `DATABASE_URL`: conexão do banco de cadastro;
- `ADMIN_USER`: usuário da área administrativa;
- `ADMIN_PASSWORD`: senha temporária da configuração inicial;
- `ADMIN_ID_SECRET`: chave usada no HMAC do CPF;
- `ADMIN_SESSION_SECRET`: assinatura das sessões;
- `NEXT_PUBLIC_SITE_URL`: URL canônica pública.

Nenhuma variável possui prefixo `NEXT_PUBLIC_`; portanto, não é incorporada ao código
entregue ao navegador.

## Controles de custo

- Vercel no plano Hobby;
- Neon no plano Free;
- sem domínio pago;
- sem Vercel Blob ou armazenamento de arquivos;
- sem serviços de IA;
- sem cartão cadastrado pelo projeto;
- sem upgrade automático planejado.

Os termos comerciais podem mudar. A manutenção acadêmica deve revisar os limites dos
provedores e suspender o cadastro antes de contratar qualquer plano.

## Relação com o TCC

Esta arquitetura demonstra viabilidade operacional com baixo custo, mas não comprova
capacidade comercial em grande escala. O desenho favorece privacidade e reprodutibilidade
no escopo do protótipo.
