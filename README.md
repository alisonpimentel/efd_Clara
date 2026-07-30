# EFD Clara

Protótipo acadêmico de Business Intelligence que transforma registros selecionados da
EFD ICMS/IPI em indicadores gerenciais simples para pequenos empresários, contadores
iniciantes e estudantes.

## Entrega do MVP

- cadastro de interesse com nome, e-mail, perfil e consentimentos separados;
- um arquivo TXT por análise, com limite de 8 MB;
- leitura e processamento integral no navegador;
- SQLite WebAssembly temporário em memória;
- suporte aos registros `0000`, `0150`, `0200`, `C100`, `C170` e `C190`;
- visão geral, clientes e fornecedores, produtos e visão fiscal;
- exportação CSV e impressão/salvamento em PDF;
- arquivo demonstrativo fictício;
- testes automatizados com valores esperados;
- aviso de privacidade e canal interno para solicitações de titulares;
- área administrativa privada em `/interessados`, com resumo e exportação da lista;
- documentação acadêmica e diário de decisões.

O arquivo fiscal não é enviado ao servidor e não existe histórico de SPED. O banco
persistente contém apenas os cadastros de interesse e solicitações de privacidade.

## Documentação acadêmica

O ponto de entrada é [docs/00-indice.md](docs/00-indice.md). O material reúne problema,
objetivos, escopo, requisitos, arquitetura, indicadores, metodologia, testes, resultados,
limitações, modelo de negócio, privacidade, referências e um roteiro para o TCC.

## Executar e verificar

Requisitos: Node.js 22 ou superior.

```bash
npm install
npm run dev
npm test
npm run build
```

O arquivo de demonstração está em `public/exemplo-efd.txt`. Todos os nomes, documentos e
valores nele contidos são fictícios.

## Aviso de uso

O EFD Clara é um artefato acadêmico. Não calcula lucro, fluxo de caixa ou conformidade
tributária; não substitui sistemas contábeis nem orientação profissional.
