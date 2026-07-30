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
| `npm run test` | 17 testes aprovados, zero falhas |
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
- evolução temporal, concentração, apuração E110 e inventário H005/H010;
- gráficos responsivos fundamentados em Few, IBCS e Knaflic.
- conferência inicial pelos registros 0000, 0005 e 0100, com CPF do contabilista
  mascarado e ausente do CSV.
- detecção local de UTF-8 ou Windows-1252 para preservar descrições acentuadas;
- contenção de nomes extensos e reorganização de painéis com alturas variáveis;
- cobertura C170 por direção e documentos fora da competência na área de qualidade.

## Situação do deploy

O projeto Vercel `efd-clara` foi criado e vinculado ao repositório oficial. O Neon foi
provisionado com o identificador de plano `free_v3`, na região de São Paulo, e conectado
a produção, preview e desenvolvimento. Nenhum plano pago foi selecionado e nenhum cartão
foi cadastrado por esta execução.

## Publicação validada

- **URL de produção:** https://efd-clara.vercel.app
- **Deploy:** `dpl_HLNBBvF9f6orYRkTeSX8E9v5i6Cf`
- **Commit:** `1d60686`
- **Status:** Ready
- **Testes públicos:** 3 E2E aprovados
- **Desktop:** aprovado
- **Celular 375 × 812 px:** aprovado
- **Codificação Windows-1252 e nomes extensos:** aprovados
- **CSV e nova análise:** aprovados
- **Novas abas:** curvas ABC, abrangência por CFOP, valor médio unitário, distribuição
  semanal, cancelamentos e indicadores descritivos de ICMS aprovados
- **Identificação:** entidade, competência, endereço e contabilista aprovados
- **Inspeção de rede:** nenhum registro fiscal em corpos enviados
- **Erros de runtime na última hora:** nenhum agrupamento encontrado
- **Erros ou falhas fatais no novo deploy:** nenhum log encontrado
- **SEO técnico:** página, robots e sitemap respondendo
- **Área administrativa:** configuração protegida e relatório redirecionado para login

As capturas e o protocolo estão em [evidências](evidencias/README.md).

## Pendência deliberada

A conta definitiva de administrador ainda não foi criada, pois o proprietário solicitou
informar pessoalmente o CPF e a senha ao final. A tela `/admin/configurar` está pronta e
protegida pela credencial temporária local. Depois da criação única, o acesso ocorrerá em
`/admin/login`.

Na rodada desta evolução, os cadastros sintéticos gerados pelas execuções locais e
públicas foram removidos; a verificação final indicou zero cadastros de teste restantes.
