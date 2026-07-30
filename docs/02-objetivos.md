# Objetivos

## Objetivo geral

Desenvolver e avaliar um protótipo web de Business Intelligence capaz de transformar
registros selecionados da EFD ICMS/IPI em indicadores gerenciais simples, com
processamento local e sem armazenamento do arquivo fiscal.

## Objetivos específicos

1. identificar os registros necessários para a análise proposta;
2. implementar a leitura de arquivos TXT da EFD ICMS/IPI com limite de 8 MB;
3. relacionar empresa, participantes, produtos, documentos, itens e resumos fiscais;
4. estruturar temporariamente os dados em SQLite WebAssembly na memória do navegador;
5. calcular indicadores de entradas, saídas, documentos, participantes, produtos, CFOP e
   ICMS;
6. apresentar resultados em interface responsiva, acessível e instrutiva;
7. permitir a exportação do resumo em CSV e a impressão ou salvamento em PDF;
8. verificar os cálculos com uma base fictícia e valores previamente definidos;
9. registrar interessados no projeto sem armazenar seu arquivo fiscal;
10. documentar decisões, limitações e evidências para uso no TCC.

## Resultado esperado

Espera-se demonstrar a viabilidade técnica do reaproveitamento gerencial de dados
selecionados da EFD ICMS/IPI em uma aplicação de baixo custo operacional. Não se pretende
demonstrar aumento de lucro, redução de custos ou aceitação de mercado nesta etapa.

