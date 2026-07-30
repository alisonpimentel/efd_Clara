# Arquitetura e privacidade

## Visão lógica

```text
Site público
├── Interface HTML/CSS/React
├── Leitor local do TXT
├── Parser EFD ICMS/IPI
├── SQLite WebAssembly em memória
├── Consultas de indicadores
└── Exportação CSV / impressão

API mínima
├── Cadastro de interessados
└── Solicitações de privacidade

Banco persistente D1
├── interested_people
└── privacy_requests
```

## Fluxo do arquivo fiscal

```text
Usuário seleciona o TXT
        ↓
Navegador verifica tipo e limite de 8 MB
        ↓
File.text() lê o conteúdo localmente
        ↓
Parser retém apenas os registros do escopo
        ↓
SQLite em memória recebe os dados normalizados
        ↓
Consultas SQL produzem valores agregados
        ↓
SQLite é fechado e o texto bruto sai do fluxo
        ↓
Interface mantém somente o resumo agregado
```

Não existe chamada de rede contendo o arquivo ou seus registros. As únicas rotas de
servidor recebem os dados do cadastro ou uma solicitação de privacidade.

## Componentes

| Componente | Responsabilidade |
|---|---|
| `parser.ts` | Ler linhas, normalizar campos e relacionar registros |
| `sqlite-analytics.ts` | Criar banco temporário, inserir dados e consultar métricas |
| `export.ts` | Produzir CSV e iniciar o download |
| componentes de interface | Cadastro, upload, estados e painel |
| `/api/interested` | Validar e registrar interessado |
| `/api/privacy-request` | Registrar exercício de direito do titular |
| `/interessados` | Exibir ao proprietário autenticado a lista e os totais |
| `/api/admin/interested` | Exportar CSV somente após a mesma verificação de proprietário |
| D1 | Persistir somente dados pessoais mínimos |

## Escolha do SQLite temporário

O SQLite WebAssembly permite utilizar SQL no navegador sem criar um banco fiscal no
servidor. Neste MVP, o banco não usa persistência local (OPFS): ele é criado em memória,
consultado e encerrado dentro da própria análise. Essa decisão reduz risco de retenção
involuntária e mantém o projeto compatível com a promessa de “um arquivo por vez, sem
histórico”.

## Controles implementados

- limite de arquivo verificado antes da leitura;
- nenhuma rota de upload de SPED;
- descarte de itens e resumos ligados a documentos cancelados;
- SQLite encerrado em bloco `finally`, inclusive em erro;
- consentimento de comunicação separado;
- campos de armadilha contra submissões automatizadas simples;
- cadastros não possuem endpoint público de listagem;
- solicitações de titulares ficam em tabela separada.

## Riscos residuais

O navegador mantém valores agregados enquanto a página de resultado estiver aberta. Um
dispositivo comprometido, extensão maliciosa ou captura de tela pode expor dados. A
aplicação também depende da segurança da hospedagem para servir código íntegro. Uma
evolução comercial exigiria política de segurança, monitoração, análise jurídica e testes
especializados.
