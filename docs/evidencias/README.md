# Evidências de validação

## Ambiente

- **URL:** https://efd-clara.vercel.app
- **Data:** 30/07/2026
- **Commit validado:** `24c015f`
- **Deploy Vercel:** `dpl_EuKCLhn66itVbyhmsAMD2q1pHQ63`
- **Plano da aplicação:** Hobby
- **Plano do banco:** Neon `free_v3`

## Fluxos executados

- cadastro sintético com consentimento obrigatório;
- rejeição visual de TXT acima de 8 MB;
- confirmação de seletor sem suporte a múltiplos arquivos;
- seleção local da EFD fictícia;
- entradas de R$ 15.500,00 e saídas de R$ 27.000,00;
- evolução temporal com quatro datas;
- concentração dos três maiores clientes e fornecedores;
- curvas ABC de clientes e produtos;
- abrangência das saídas por CFOP;
- valor médio escriturado por unidade e mix de SKUs;
- distribuição das saídas por dia da semana;
- cancelamentos separados entre entradas e saídas;
- inventário de R$ 22.000,00 no Bloco H;
- ICMS a recolher de R$ 1.080,00 reproduzido do E110;
- 100% das entradas C190 com ICMS informado e indicador aparente de 4%;
- razão social, fantasia, competência, endereço e contabilista extraídos;
- CPF do contabilista mascarado na tela e ausente do CSV;
- separação entre data de emissão e data de entrada/saída;
- emissão anterior escriturada no período apresentada como contexto, não como erro;
- disponibilidade de C170 por direção, distinguindo emissão própria eletrônica;
- mensagem explícita de que C170 não é uma nota de qualidade;
- recusa preventiva de EFD-Contribuições antes de interpretar razão social, competência
  e documentos;
- disponibilidade total e cobertura elegível do C170 exibidas separadamente;
- denominador elegível igual a zero apresentado como `não aplicável`;
- exportação CSV;
- botão de nova análise e remoção do painel anterior;
- viewport desktop;
- viewport móvel de 375 × 812 px, sem rolagem horizontal da página;
- inspeção de todos os corpos de requisições não GET.

## Resultado de rede

O teste registrou as requisições feitas durante o fluxo. Houve chamada dinâmica para o
cadastro mínimo, mas nenhum corpo de requisição continha `|0000|`, `|C100|` ou conteúdo
fiscal. O arquivo foi fornecido diretamente ao elemento local e processado no navegador.

## Proteção administrativa e SEO

| Verificação pública | Resultado |
|---|---:|
| página inicial | 200 |
| login administrativo | 200 |
| configuração sem credencial temporária | 401 |
| configuração com credencial temporária | 200 |
| relatório sem sessão | 307 para login |
| `robots.txt` | 200 |
| `sitemap.xml` | 200 |

## Capturas

- [dashboard desktop](dashboard-desktop-vercel.png)
- [dashboard móvel](dashboard-mobile-vercel.png)
- [curva ABC de clientes e abrangência por CFOP — produção](dashboard-clientes-abc-vercel.png)
- [curva ABC de produtos e valor médio por unidade — produção](dashboard-produtos-abc-vercel.png)
- [indicadores de ICMS e limites — produção](dashboard-icms-vercel.png)
- [recusa de EFD-Contribuições — produção](layout-incompativel-vercel.png)
- [recusa de EFD-Contribuições — validação local](layout-incompativel-local.png)
- [dashboard móvel com disponibilidade C170 — validação local](dashboard-mobile-local.png)
- [curva ABC de clientes e abrangência por CFOP — validação local](dashboard-clientes-abc-local.png)
- [curva ABC de produtos e valor médio por unidade — validação local](dashboard-produtos-abc-local.png)
- [indicadores de ICMS e limites — validação local](dashboard-icms-local.png)

As capturas marcadas como produção foram geradas pelo teste E2E contra
`https://efd-clara.vercel.app`. As capturas locais registram a etapa anterior e permitem
comparar o mesmo artefato antes e depois da publicação.

Todos os cadastros sintéticos encontrados nas rodadas locais e públicas foram excluídos
ao final. Nenhum
dado de usuário real foi removido, e a consulta final retornou zero cadastros de teste.
