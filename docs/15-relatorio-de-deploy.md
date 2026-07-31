# Relatório de deploy

## Identificação

- **Repositório oficial:** `https://github.com/alisonpimentel/efd_Clara`
- **Branch:** `main`
- **Hospedagem prevista:** Vercel Hobby
- **Banco previsto:** Neon Free
- **Data da preparação:** 30/07/2026
- **Última validação pública:** 31/07/2026

## Verificações anteriores ao deploy

| Verificação | Resultado |
|---|---|
| busca por credenciais no repositório | nenhuma credencial encontrada |
| dados fiscais reais | nenhum arquivo real encontrado |
| arquivo demonstrativo | identificado como fictício |
| `npm install` | concluído |
| `npm run lint` | aprovado |
| `npm run test` | 39 testes aprovados, zero falhas |
| `npm run test:e2e` | 4 testes aprovados, zero falhas |
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
- separação entre `DT_DOC` e `DT_E_S`, usando a data de entrada/saída como referência;
- disponibilidade C170 por direção, sem apresentá-la como nota de qualidade;
- distinção entre NF-e/NFC-e própria sem C170 e outras ausências de itens.
- validação do registro `0000` antes do parser, recusando EFD-Contribuições e outros
  módulos SPED incompatíveis.
- política de verdade analítica: zero observado, `não disponível` sem fonte e `não
  aplicável` sem denominador;
- remoção de participantes ausentes dos rankings, sem retirá-los dos totais e dos
  indicadores de qualidade;
- participação de produtos calculada somente sobre os itens C170 efetivamente disponíveis.
- criação da rota paralela `/integrada` para EFD ICMS/IPI e EFD-Contribuições;
- validação exata do CNPJ do estabelecimento e da competência antes da conciliação;
- processamento dos dois arquivos integralmente no navegador, sem requisição fiscal;
- uso da EFD ICMS/IPI como fonte canônica de compras e vendas, evitando dupla contagem;
- classificação explícita de conciliações exatas, divergentes, prováveis, exclusivas e
  ambíguas;
- cálculo decimal em escala fixa, sem depender de ponto flutuante binário para valores;
- limite de 8 MB aplicado separadamente aos dois arquivos.

Uma função da Vercel não pode receber cada EFD de 8 MB porque o limite documentado de
corpo de requisição e resposta é 4,5 MB. Por esse motivo, a compatibilidade direta foi
obtida mantendo o parser, a validação e a conciliação no navegador. A Vercel entrega a
interface e executa somente o backend mínimo do cadastro, sem receber conteúdo fiscal.
Fonte: [Vercel — Functions limitations](https://vercel.com/docs/functions/limitations).

## Situação do deploy

O projeto Vercel `efd-clara` foi criado e vinculado ao repositório oficial. O Neon foi
provisionado com o identificador de plano `free_v3`, na região de São Paulo, e conectado
a produção, preview e desenvolvimento. Nenhum plano pago foi selecionado e nenhum cartão
foi cadastrado por esta execução.

## Publicação validada

- **URL de produção:** https://efd-clara.vercel.app
- **Rota integrada:** https://efd-clara.vercel.app/integrada
- **Deploy validado:** `dpl_Ecn5A7ii8BKxqkN9Gj3nZggw12kc`
- **Commit funcional:** `ba49dbb`
- **Status:** Ready
- **Testes locais completos:** 39 unitários e 4 E2E aprovados
- **Teste exploratório público:** cadastro, demonstração integrada e painel aprovados
- **Desktop:** aprovado
- **Celular 375 × 812 px:** aprovado
- **Codificação Windows-1252 e nomes extensos:** aprovados
- **CSV e nova análise:** aprovados
- **Novas abas:** curvas ABC, abrangência por CFOP, valor médio unitário, distribuição
  semanal, cancelamentos e indicadores descritivos de ICMS aprovados
- **Identificação:** entidade, competência, endereço e contabilista aprovados
- **Datas:** emissão anterior preservada e `DT_E_S` usada na competência quando disponível
- **C170:** ausência nas saídas de emissão própria explicada como limite da análise por
  produto, sem reduzir uma nota de qualidade
- **Módulo SPED:** EFD-Contribuições recusada antes da leitura dos campos e EFD ICMS/IPI
  válida processada na sequência
- **C170:** disponibilidade total preservada, cobertura elegível calculada separadamente
  e denominador zero apresentado como `não aplicável`
- **Dados ausentes:** tickets, taxas, concentrações, ICMS e conciliação sem fonte ou
  denominador aparecem como `não disponível`, inclusive no CSV
- **Inspeção de rede:** nenhum registro fiscal em corpos enviados
- **Erros de runtime na última hora:** nenhum agrupamento encontrado
- **Erros ou falhas fatais no novo deploy:** nenhum log encontrado
- **SEO técnico:** página, robots e sitemap respondendo
- **Área administrativa:** configuração protegida e relatório redirecionado para login
- **Build público integrado:** concluído em 35 segundos
- **Fontes integradas:** 5 documentos e 7 itens na EFD ICMS/IPI; 4 documentos e 6 itens
  na EFD-Contribuições da demonstração fictícia
- **Conciliação fictícia:** 4 documentos exatos, 1 somente na EFD ICMS/IPI, 6 itens
  conciliados e nenhuma correspondência provável ou ambígua
- **Indicadores integrados:** compras de R$ 15.500,00, vendas de R$ 27.000,00, ICMS em
  C190 de R$ 5.100,00, PIS a recolher de R$ 189,75 e Cofins a recolher de R$ 874,00
- **Console do navegador no teste público:** nenhum erro
- **Tráfego fiscal:** os dois TXT foram obtidos como exemplos públicos por `GET` e
  processados localmente; nenhum conteúdo `0000`, `C100` ou CNPJ extraído foi enviado
  por `POST`

As capturas e o protocolo estão em [evidências](evidencias/README.md).

## Pendência deliberada

A conta definitiva de administrador ainda não foi criada, pois o proprietário solicitou
informar pessoalmente o CPF e a senha ao final. A tela `/admin/configurar` está pronta e
protegida pela credencial temporária local. Depois da criação única, o acesso ocorrerá em
`/admin/login`.

Na rodada desta evolução, os cadastros sintéticos gerados pelas execuções locais e
públicas foram removidos. O registro adicional usado na validação do deploy integrado
também foi excluído imediatamente após o teste.
