# Requisitos do artefato

## Requisitos funcionais

| ID | Requisito | Critério de aceite |
|---|---|---|
| RF01 | Cadastrar interessado | Nome, e-mail, perfil e aceite obrigatório são validados e gravados |
| RF02 | Separar comunicação opcional | A autorização de novidades não é pré-marcada |
| RF03 | Selecionar arquivo | O usuário escolhe ou arrasta um TXT |
| RF04 | Limitar arquivo | Arquivos acima de 8 MB são recusados antes da leitura |
| RF05 | Processar uma EFD | Registros do escopo são interpretados no navegador |
| RF06 | Excluir cancelamentos | Situações `02` e `03` não compõem totais e rankings |
| RF07 | Gerar BI | O sistema calcula as métricas documentadas |
| RF08 | Explicar métricas | A tela mostra definição e limitação de interpretação |
| RF09 | Exportar CSV | O resumo e rankings são baixados em formato tabular |
| RF10 | Exportar PDF | A visualização possui estilo de impressão |
| RF11 | Reiniciar | Nova análise elimina o resumo anterior da interface |
| RF12 | Demonstrar | Uma EFD totalmente fictícia pode ser carregada no próprio site |
| RF13 | Registrar direito do titular | Solicitações de acesso, correção, exclusão e revogação são gravadas |
| RF14 | Consultar interessados | Somente o proprietário autenticado acessa resumo, lista e CSV |
| RF15 | Conferir identificação | Razão social, competência, endereço e contabilista aparecem antes dos indicadores |
| RF16 | Validar o módulo SPED | Somente o leiaute da EFD ICMS/IPI segue para o parser; EFD-Contribuições e outros módulos são recusados com orientação |

## Requisitos não funcionais

| ID | Requisito | Evidência |
|---|---|---|
| RNF01 | Privacidade local | O conteúdo fiscal não é enviado à API |
| RNF02 | Efemeridade | O SQLite é encerrado após calcular o resumo |
| RNF03 | Responsividade | Interface reorganiza conteúdo em telas estreitas |
| RNF04 | Acessibilidade | HTML semântico, labels, foco visível, teclado e contraste |
| RNF05 | Clareza | Termos de negócio aparecem antes dos códigos técnicos |
| RNF06 | Compatibilidade | Navegadores modernos com WebAssembly |
| RNF07 | Baixo custo | Hospedagem compatível com camada gratuita |
| RNF08 | Manutenibilidade | Parser, análise, UI e persistência estão separados |
| RNF09 | Reprodutibilidade | Testes automatizados usam arquivo fictício versionado |
| RNF10 | Desempenho controlado | Limite de 8 MB e uma análise por vez |

## Regras de negócio

- `IND_OPER = 0` representa entrada; os demais valores válidos do recorte representam
  saída.
- totais de entrada e saída usam `VL_DOC` do `C100`.
- identificação principal usa `0000`; endereço e fantasia usam `0005`;
- o contabilista usa `0100`, com CPF mascarado e sem CPF na exportação;
- situação `02` ou `03` representa cancelamento no recorte do protótipo.
- ranking de produtos depende de `C170`.
- ranking de CFOP e ICMS usa `C190` quando disponível.
- apuração própria do ICMS reproduz o `E110`, sem recalcular o tributo;
- inventário reproduz `H005` e `H010`, quando disponíveis;
- ausência de `C170`, `C190`, `E110` ou `H005` gera aviso, não falha total;
- evolução temporal usa datas válidas do `C100`;
- concentração considera a participação dos três maiores clientes ou fornecedores;
- diferença entre totais `C100` e `C190` é apresentada para conciliação, não como erro
  automático.
- diferença operacional é `saídas - entradas` e nunca recebe o rótulo de lucro.
- o registro `0000` é validado antes da interpretação: na EFD ICMS/IPI, `DT_INI` e
  `DT_FIN` ocupam os campos 4 e 5; leiautes incompatíveis não geram dashboard.
