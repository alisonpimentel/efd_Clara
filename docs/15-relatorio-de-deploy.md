# Relatório de deploy

## Identificação

- **Repositório oficial:** `https://github.com/alisonpimentel/efd_Clara`
- **Branch:** `main`
- **Hospedagem prevista:** Vercel Hobby
- **Banco previsto:** Neon Free
- **Data da preparação:** 30/07/2026

## Verificações anteriores ao deploy

| Verificação | Resultado |
|---|---|
| busca por credenciais no repositório | nenhuma credencial encontrada |
| dados fiscais reais | nenhum arquivo real encontrado |
| arquivo demonstrativo | identificado como fictício |
| `npm install` | concluído |
| `npm run lint` | aprovado |
| `npm run test` | 14 testes aprovados, zero falhas |
| `npm run test:e2e` | 3 testes aprovados, zero falhas |
| `npm run build` | concluído |
| auditoria de dependências de produção | zero vulnerabilidades |

## Alterações para compatibilidade

- substituição do adaptador específico da hospedagem anterior pelo Next.js padrão;
- conexão do cadastro a PostgreSQL por `DATABASE_URL`;
- manutenção do SQLite WebAssembly exclusivamente no navegador;
- proteção da lista de interessados por credenciais de ambiente;
- testes adicionais para 8 MB, arquivo único, cadastro e exportação.
- autenticação administrativa com CPF em HMAC e senha em hash com sal;
- relatório de recorrência e preparação técnica de SEO.

## Situação do deploy

O projeto Vercel `efd-clara` foi criado e vinculado ao repositório oficial. O Neon foi
provisionado com o identificador de plano `free_v3`, na região de São Paulo, e conectado
a produção, preview e desenvolvimento. Nenhum plano pago foi selecionado e nenhum cartão
foi cadastrado por esta execução.

## Publicação validada

- **URL de produção:** https://efd-clara.vercel.app
- **Deploy:** `dpl_Dgj8cj88ZrGzRtYQAVr3sMcRhrjj`
- **Commit:** `7c51ba3`
- **Status:** Ready
- **Testes públicos:** 3 E2E aprovados
- **Desktop:** aprovado
- **Celular 375 × 812 px:** aprovado
- **CSV e nova análise:** aprovados
- **Inspeção de rede:** nenhum registro fiscal em corpos enviados
- **SEO técnico:** página, robots e sitemap respondendo
- **Área administrativa:** configuração protegida e relatório redirecionado para login

As capturas e o protocolo estão em [evidências](evidencias/README.md).

## Pendência deliberada

A conta definitiva de administrador ainda não foi criada, pois o proprietário solicitou
informar pessoalmente o CPF e a senha ao final. A tela `/admin/configurar` está pronta e
protegida pela credencial temporária local. Depois da criação única, o acesso ocorrerá em
`/admin/login`.

Os cadastros sintéticos dos testes foram removidos do banco após a validação.
