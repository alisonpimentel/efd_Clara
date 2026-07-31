import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const samplePath = path.resolve("public/exemplo-efd.txt");
const contributionsSamplePath = path.resolve(
  "public/exemplo-efd-contribuicoes.txt",
);
const integratedEstablishment = "12345678000195";

async function register(page: Page, suffix: string) {
  await page.goto("/");
  await page.getByLabel("Seu nome").fill("Teste Acadêmico EFD Clara");
  await page
    .getByLabel("Seu melhor e-mail")
    .fill(`teste.efd.clara.${suffix}@example.com`);
  await page.getByLabel("Qual é o seu perfil?").selectOption("contador");

  await page.getByRole("button", { name: "Acessar o painel gratuito" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "aceite de privacidade" }),
  ).toBeVisible();

  await page.getByRole("checkbox", { name: /Concordo com o uso de nome/ }).check();
  await page.getByRole("button", { name: "Acessar o painel gratuito" }).click();
  await expect(
    page.getByRole("heading", { name: "Vamos traduzir a sua EFD?" }),
  ).toBeVisible();
}

test("fluxo completo, limites, exportação e ausência de upload fiscal", async ({
  page,
}, testInfo) => {
  const requests: Array<{ url: string; method: string; body: string }> = [];
  page.on("request", (request) => {
    requests.push({
      url: request.url(),
      method: request.method(),
      body: request.postData() ?? "",
    });
  });

  await register(page, `desktop-${Date.now()}`);

  const overLimit = Buffer.alloc(8 * 1024 * 1024 + 1, "A");
  await page.locator("#sped-file").setInputFiles({
    name: "acima-do-limite.txt",
    mimeType: "text/plain",
    buffer: overLimit,
  });
  await expect(
    page.getByRole("alert").filter({ hasText: "limite de 8 MB" }),
  ).toBeVisible();

  await expect(page.locator("#sped-file")).not.toHaveAttribute("multiple", "");

  const contributionsSample = Buffer.from(
    [
      "|0000|006|0|||01042024|30042024|AGROBRASIL FRIGORIFICO LTDA|44865458000189|RS|4312401||02|0|",
      "|C100|1|0||55|00|1|1||05042024|05042024|100,00|",
    ].join("\n"),
    "utf8",
  );
  await page.locator("#sped-file").setInputFiles({
    name: "efd-contribuicoes.txt",
    mimeType: "text/plain",
    buffer: contributionsSample,
  });
  await expect(
    page.getByRole("alert").filter({ hasText: "EFD-Contribuições" }),
  ).toContainText("Selecione o TXT do SPED Fiscal");
  await page.screenshot({
    path: testInfo.outputPath("layout-incompativel.png"),
    fullPage: true,
  });

  await page.locator("#sped-file").setInputFiles(samplePath);
  await expect(page.getByText("R$ 15.500,00", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("R$ 27.000,00", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Identificação da escrituração" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "EFD CLARA MERCADO" })).toBeVisible();
  await expect(page.getByText("junho de 2026", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "MARCIA CONTADORA DEMONSTRACAO" }),
  ).toBeVisible();
  await expect(page.getByText("1SP000000/O-0", { exact: true })).toBeVisible();
  await expect(page.getByText("***.000.001-**", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Entradas e saídas ao longo do tempo" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Clientes e fornecedores" }).click();
  await expect(
    page.locator(".metric").filter({ hasText: "3 maiores clientes" }),
  ).toContainText("100%");
  await expect(
    page.getByRole("heading", { name: "Concentração das saídas por cliente" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Internas, interestaduais e exterior" }),
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("dashboard-clientes-abc.png"),
    fullPage: true,
  });

  await page.getByRole("button", { name: "Produtos e estoque" }).click();
  await expect(page.getByRole("heading", { name: "Estoque declarado no Bloco H" })).toBeVisible();
  await expect(page.getByText("R$ 22.000,00", { exact: true }).first()).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Valor escriturado por unidade" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Concentração das saídas por produto" }),
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("dashboard-produtos-abc.png"),
    fullPage: true,
  });

  await page.getByRole("button", { name: "ICMS e limites" }).click();
  await expect(page.getByRole("heading", { name: "Resumo do ICMS do período" })).toBeVisible();
  await expect(page.getByText("R$ 1.080,00", { exact: true })).toBeVisible();
  await expect(page.getByText("100%", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("4%", { exact: true })).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("dashboard-icms.png"),
    fullPage: true,
  });

  await page.getByRole("button", { name: "Visão executiva" }).click();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar CSV" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^efd-clara-.*\.csv$/);

  await page.screenshot({
    path: testInfo.outputPath("dashboard-desktop.png"),
    fullPage: true,
  });

  await page.getByRole("button", { name: "Nova análise" }).click();
  await expect(
    page.getByRole("heading", { name: "Vamos traduzir a sua EFD?" }),
  ).toBeVisible();
  await expect(page.getByText("R$ 15.500,00", { exact: true })).toHaveCount(0);

  const networkPayload = requests
    .filter((request) => request.method !== "GET")
    .map((request) => request.body)
    .join("\n");
  expect(networkPayload).not.toContain("|0000|");
  expect(networkPayload).not.toContain("|C100|");
  expect(requests.some((request) => request.url.includes("/api/interested"))).toBe(
    true,
  );
});

test("análise integrada preserva privacidade, fontes e estados verdadeiros", async ({
  page,
}) => {
  const requests: Array<{ url: string; method: string; body: string }> = [];
  page.on("request", (request) => {
    requests.push({
      url: request.url(),
      method: request.method(),
      body: request.postData() ?? "",
    });
  });

  await register(page, `integrada-${Date.now()}`);
  await page.goto("/integrada");
  await expect(
    page.getByRole("heading", {
      name: "Duas escriturações, uma visão coerente.",
    }),
  ).toBeVisible();

  const inputs = page.locator(".integrated-file-slot input[type=file]");
  await expect(inputs).toHaveCount(2);
  await inputs.nth(0).setInputFiles(samplePath);
  await inputs.nth(1).setInputFiles(contributionsSamplePath);
  await page
    .getByRole("button", { name: "Validar e cruzar os arquivos" })
    .click();

  await expect(
    page.getByRole("heading", { name: "COMERCIO DEMONSTRACAO LTDA" }),
  ).toBeVisible();
  await expect(page.getByText("R$ 15.500,00", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("R$ 27.000,00", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("R$ 5.100,00", { exact: true })).toBeVisible();
  await expect(page.getByText("R$ 189,75", { exact: true })).toBeVisible();
  await expect(page.getByText("R$ 874,00", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("region", {
      name: "Quanto das duas fontes pôde ser ligado?",
    }),
  ).toContainText("80%");
  await expect(
    page.getByRole("region", {
      name: "O que exige atenção antes de interpretar?",
    }),
  ).toContainText("Chaves eletrônicas informadas e inválidas");

  const fiscalPosts = requests.filter(
    (request) =>
      request.method === "POST" &&
      (request.body.includes("|0000|") ||
        request.body.includes("|C100|") ||
        request.body.includes(integratedEstablishment)),
  );
  expect(fiscalPosts).toEqual([]);
});

test("interface permanece utilizável em celular", async ({ browser }, testInfo) => {
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    locale: "pt-BR",
  });
  const page = await context.newPage();

  await register(page, `mobile-${Date.now()}`);
  const mobileSource = (await readFile(samplePath, "utf8"))
    .replace(
      "MERCADO NOVO DIA LTDA",
      "CLIENTE COM NOME EMPRESARIAL EXTENSO PARA VALIDAR A ORGANIZAÇÃO RESPONSIVA LTDA",
    )
    .replace("CAFE TORRADO 500G", "CABEÇOTE E PEÇA INDUSTRIAL DE ALTO VALOR")
    .replace("|05062026|05062026|10000,00|", "|28052026|05062026|10000,00|");
  let currentOperation = "";
  const mobileSample = mobileSource
    .split(/\r?\n/)
    .filter((line) => {
      const fields = line.split("|");
      if (fields[1] === "C100") currentOperation = fields[2] ?? "";
      return !(fields[1] === "C170" && currentOperation === "1");
    })
    .join("\n");
  await page.locator("#sped-file").setInputFiles({
    name: "efd-windows-1252.txt",
    mimeType: "text/plain",
    buffer: Buffer.from(mobileSample, "latin1"),
  });
  await expect(page.getByText("R$ 15.500,00", { exact: true }).first()).toBeVisible();

  const metricColumns = await page.locator(".metrics-grid").first().evaluate((element) =>
    getComputedStyle(element).gridTemplateColumns.split(" ").length,
  );
  expect(metricColumns).toBe(2);

  for (const tab of ["Clientes e fornecedores", "Produtos e estoque", "ICMS e limites"]) {
    await page.getByRole("button", { name: tab }).click();
    if (tab === "Produtos e estoque") {
      await expect(
        page.getByText("CABEÇOTE E PEÇA INDUSTRIAL DE ALTO VALOR").first(),
      ).toBeVisible();
    }
    if (tab === "ICMS e limites") {
      await expect(
        page.getByRole("heading", { name: "Disponibilidade dos dados da análise" }),
      ).toBeVisible();
      await expect(
        page.locator(".quality-panel dl > div").filter({
          hasText: "Emissões anteriores escrituradas no período",
        }),
      ).toContainText("1");
      await expect(
        page.locator(".quality-panel dl > div").filter({
          hasText: "Itens C170 disponíveis nas saídas",
        }),
      ).toContainText("0 de 2 com itens");
      await expect(
        page.locator(".quality-panel dl > div").filter({
          hasText: "Itens C170 disponíveis nas entradas",
        }),
      ).toContainText("100% entre documentos elegíveis");
      await expect(
        page.locator(".quality-panel dl > div").filter({
          hasText: "Itens C170 disponíveis nas saídas",
        }),
      ).toContainText("não aplicável");
      await expect(page.getByText(/2 NF-e\/NFC-e de emissão própria/)).toBeVisible();
      await expect(page.getByText("C170 não é uma nota de qualidade.")).toBeVisible();
    }
    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
  }

  await page.screenshot({
    path: testInfo.outputPath("dashboard-mobile.png"),
    fullPage: true,
  });
  await context.close();
});

test("o arquivo fictício permanece identificado e reproduzível", async () => {
  const sample = await readFile(samplePath, "utf8");
  expect(sample).toContain("|0000|");
  expect(sample).toContain("COMERCIO DEMONSTRACAO LTDA");
});
