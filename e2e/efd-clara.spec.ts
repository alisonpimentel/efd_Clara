import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

const samplePath = path.resolve("public/exemplo-efd.txt");

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

  await page.getByRole("button", { name: "Produtos e estoque" }).click();
  await expect(page.getByRole("heading", { name: "Estoque declarado no Bloco H" })).toBeVisible();
  await expect(page.getByText("R$ 22.000,00", { exact: true }).first()).toBeVisible();

  await page.getByRole("button", { name: "Fiscal e qualidade" }).click();
  await expect(page.getByRole("heading", { name: "Resumo do ICMS do período" })).toBeVisible();
  await expect(page.getByText("R$ 1.080,00", { exact: true })).toBeVisible();

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

test("interface permanece utilizável em celular", async ({ browser }, testInfo) => {
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    locale: "pt-BR",
  });
  const page = await context.newPage();

  await register(page, `mobile-${Date.now()}`);
  await page.locator("#sped-file").setInputFiles(samplePath);
  await expect(page.getByText("R$ 15.500,00", { exact: true }).first()).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);

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
