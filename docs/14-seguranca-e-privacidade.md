# Segurança e privacidade

## Inventário de dados

O backend pode receber somente:

- nome;
- e-mail;
- perfil de interesse;
- aceite obrigatório de privacidade;
- aceite opcional de comunicação;
- data gerada pelo banco;
- quantidade e data do último acesso ao experimento;
- e-mail e tipo de solicitação de direito, em fluxo separado.

O backend não recebe EFD, CNPJ extraído, notas, produtos, participantes, valores ou
resultados do painel.

## Controles implementados

- seleção restrita a um arquivo TXT por campo;
- limite de 8 MB para cada arquivo antes da leitura;
- decodificação UTF-8/Windows-1252 executada localmente;
- módulo SPED validado localmente antes de interpretar os campos;
- parser executado no componente cliente;
- SQLite WebAssembly criado em memória e encerrado em `finally`;
- nenhuma rota de upload fiscal;
- validação local de competência e estabelecimento completo antes do cruzamento;
- nenhuma raiz de CNPJ usada como identidade suficiente;
- cálculo decimal integrado com texto canônico e `BigInt`, sem enviar valores;
- resultado mantido somente no estado da página;
- reinício remove o resumo anterior do estado;
- cadastro validado no servidor e protegido por campo-armadilha;
- listagem privada protegida por autenticação HTTP e variáveis de ambiente;
- CPF administrativo guardado apenas como HMAC;
- senha administrativa protegida por scrypt com sal;
- sessão administrativa em cookie seguro e inacessível ao JavaScript;
- respostas administrativas com cache desabilitado;
- segredos ignorados pelo Git e documentados apenas como nomes em `.env.example`.

## Protocolo de inspeção de rede

No deploy público, o teste deve:

1. limpar a aba Network;
2. selecionar o par fictício de EFDs;
3. gerar todas as áreas do painel;
4. exportar CSV e acionar impressão;
5. confirmar que não existe requisição contendo linhas iniciadas por `|0000|`, `|C100|`
   ou outros registros fiscais;
6. confirmar que as únicas requisições dinâmicas são do cadastro ou de privacidade;
7. registrar data, navegador, URL e resultado.

## Limitações

Processamento local reduz transferência, mas não protege um dispositivo comprometido,
extensões maliciosas ou capturas de tela. O protótipo não possui auditoria independente,
teste de intrusão ou certificação. A operação comercial exigiria avaliação jurídica e de
segurança adicional.

## Relação com o TCC

Os controles materializam privacidade desde a concepção. A afirmação acadêmica segura é
que, nos testes realizados, o fluxo não transmitiu o conteúdo fiscal; não se deve afirmar
segurança absoluta.
