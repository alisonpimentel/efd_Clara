# EFD Clara

Protótipo acadêmico de Business Intelligence que transforma registros selecionados da
EFD ICMS/IPI em indicadores gerenciais simples para pequenos empresários, contadores
iniciantes e estudantes.

## Entrega do MVP

- cadastro de interesse com nome, e-mail, perfil e consentimentos separados;
- um arquivo TXT por análise, com limite de 8 MB;
- leitura e processamento integral no navegador;
- SQLite WebAssembly temporário em memória;
- suporte aos registros `0000`, `0005`, `0100`, `0150`, `0200`, `C100`, `C170`,
  `C190`, `E100`, `E110`, `H005` e `H010`;
- conferência de razão social, nome fantasia, competência, endereço e contabilista;
- visão executiva com evolução temporal e leituras gerenciais;
- concentração de clientes e fornecedores, curvas ABC e abrangência das saídas por CFOP;
- valor médio escriturado por unidade, mix de SKUs, produtos e inventário;
- distribuição das saídas por dia da semana e cancelamentos separados por direção;
- apuração declarada do ICMS, entradas com ICMS informado, indicador aparente, limites
  para conciliação;
- exportação CSV e impressão/salvamento em PDF;
- arquivo demonstrativo fictício;
- testes automatizados com valores esperados;
- aviso de privacidade e canal interno para solicitações de titulares;
- área administrativa privada em `/interessados`, protegida por autenticação HTTP;
- relatório com total e último acesso de cada cadastro;
- login administrativo por CPF e senha, sem guardar o CPF ou a senha em texto;
- sitemap, robots, metadados sociais e dados estruturados para mecanismos de busca;
- documentação acadêmica e diário de decisões.

O arquivo fiscal não é enviado ao servidor e não existe histórico de SPED. O banco
persistente contém apenas os cadastros de interesse e solicitações de privacidade.

## Documentação acadêmica

O ponto de entrada é [docs/00-indice.md](docs/00-indice.md). O material reúne problema,
objetivos, escopo, requisitos, arquitetura, indicadores, metodologia, testes, resultados,
limitações, modelo de negócio, privacidade, fichamento das referências de BI e um roteiro
para o TCC.

## Instalar, executar e verificar

Requisitos: Node.js 22 ou superior.

```bash
npm install
npm run dev
npm run lint
npm run test
npm run build
```

Copie `.env.example` para `.env.local` e informe:

- `DATABASE_URL`: conexão PostgreSQL do banco gratuito;
- `ADMIN_USER` e `ADMIN_PASSWORD`: proteção temporária da criação da conta;
- `ADMIN_ID_SECRET` e `ADMIN_SESSION_SECRET`: hashes e sessões administrativas;
- `NEXT_PUBLIC_SITE_URL`: endereço canônico usado por sitemap e robots.

Essas variáveis são usadas somente pelo backend mínimo de cadastro. Nenhuma variável
fica disponível ao JavaScript do navegador.

## Publicação

O GitHub é a fonte oficial. A aplicação está preparada para deploy contínuo na Vercel
Hobby e banco Neon Free. O provedor recebe apenas os arquivos públicos da aplicação e os
dados mínimos enviados no formulário de cadastro. A EFD não passa por uma rota de upload.

Consulte `docs/13-infraestrutura-cloud.md`, `docs/14-seguranca-e-privacidade.md` e
`docs/15-relatorio-de-deploy.md` para a configuração e as evidências acadêmicas.

Na primeira implantação, acesse `/admin/configurar` usando as credenciais temporárias e
crie o CPF/senha definitivos. Depois, `/admin/login` abre o relatório de interessados.

O arquivo de demonstração está em `public/exemplo-efd.txt`. Todos os nomes, documentos e
valores nele contidos são fictícios.

## Aviso de uso

O EFD Clara é um artefato acadêmico. Não calcula lucro, fluxo de caixa ou conformidade
tributária; não substitui sistemas contábeis nem orientação profissional.
