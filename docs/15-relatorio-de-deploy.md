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

## Evidências pendentes

Após a aceitação e publicação, registrar:

- URL de produção;
- identificador do deploy;
- commit publicado;
- resultado do cadastro;
- teste responsivo;
- exportações;
- inspeção de rede;
- confirmação de ausência de conteúdo fiscal no backend;
- confirmação dos planos Hobby e Free.

Não considerar esta seção encerrada antes desses testes.
