# Evidências de validação

## Ambiente

- **URL:** https://efd-clara.vercel.app
- **Data:** 30/07/2026
- **Commit validado:** `1885cb9`
- **Deploy Vercel:** `dpl_61MSRaeu6WyjKQ4KYLG4S3aziMJM`
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
- inventário de R$ 22.000,00 no Bloco H;
- ICMS a recolher de R$ 1.080,00 reproduzido do E110;
- razão social, fantasia, competência, endereço e contabilista extraídos;
- CPF do contabilista mascarado na tela e ausente do CSV;
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
- [curva ABC de clientes e abrangência por CFOP — validação local](dashboard-clientes-abc-local.png)
- [curva ABC de produtos e valor médio por unidade — validação local](dashboard-produtos-abc-local.png)
- [indicadores de ICMS e qualidade — validação local](dashboard-icms-local.png)

As três capturas marcadas como validação local registram o incremento de ICMS anterior à
publicação. Elas foram geradas pelo teste E2E com a base fictícia e não devem ser
confundidas com evidência do deploy enquanto o novo commit não estiver em produção.

Os seis cadastros sintéticos encontrados nesta rodada foram excluídos ao final. Nenhum
dado de usuário real foi removido, e a consulta final retornou zero cadastros de teste.
