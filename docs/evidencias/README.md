# Evidências de validação

## Ambiente

- **URL:** https://efd-clara.vercel.app
- **Data:** 30/07/2026
- **Commit validado:** `7c51ba3`
- **Deploy Vercel:** `dpl_Dgj8cj88ZrGzRtYQAVr3sMcRhrjj`
- **Plano da aplicação:** Hobby
- **Plano do banco:** Neon `free_v3`

## Fluxos executados

- cadastro sintético com consentimento obrigatório;
- rejeição visual de TXT acima de 8 MB;
- confirmação de seletor sem suporte a múltiplos arquivos;
- seleção local da EFD fictícia;
- entradas de R$ 15.500,00 e saídas de R$ 27.000,00;
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

Os sete cadastros sintéticos criados pelos testes foram excluídos após a validação. Nenhum
dado de usuário real foi removido.
