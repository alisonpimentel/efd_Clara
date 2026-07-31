import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import test from "node:test";
import { matchDocuments } from "../lib/integrated/matching";
import { parseIntegratedEfd } from "../lib/integrated/parser";
import { validateEfdPair } from "../lib/integrated/pair-validation";
import { MAX_SPED_FILE_SIZE } from "../lib/sped/file-validation";

const establishment = "12345678000195";

function nearLimit(header: string) {
  const filler = "|9990|LINHA FICTICIA PARA TESTE DE DESEMPENHO LOCAL|\n";
  const available = MAX_SPED_FILE_SIZE - Buffer.byteLength(header) - 1;
  const repetitions = Math.floor(available / Buffer.byteLength(filler));
  return `${header}\n${filler.repeat(repetitions)}`;
}

test("processa duas entradas sintéticas próximas de 8 MB sem persistência", () => {
  const icmsText = nearLimit(
    `|0000|019|0|01062026|30062026|EMPRESA DESEMPENHO|${establishment}||SP|IE|3550308|||A|1|`,
  );
  const contributionsText = nearLimit(
    [
      "|0000|006|0|||01062026|30062026|MATRIZ DESEMPENHO|99999999000199|SP|3550308||00|0|",
      `|0140|EST1|EMPRESA DESEMPENHO|${establishment}|SP|IE|3550308||`,
      `|C010|${establishment}|2|`,
    ].join("\n"),
  );
  assert.ok(Buffer.byteLength(icmsText) <= MAX_SPED_FILE_SIZE);
  assert.ok(Buffer.byteLength(icmsText) > MAX_SPED_FILE_SIZE - 1024);
  assert.ok(Buffer.byteLength(contributionsText) <= MAX_SPED_FILE_SIZE);
  assert.ok(Buffer.byteLength(contributionsText) > MAX_SPED_FILE_SIZE - 1024);

  const startedAt = performance.now();
  const icms = parseIntegratedEfd(icmsText);
  const contributions = parseIntegratedEfd(contributionsText);
  const pair = validateEfdPair(icms, contributions);
  assert.equal(pair.ok, true);
  if (!pair.ok) return;
  assert.deepEqual(
    matchDocuments(icms, contributions, pair.establishmentDocument),
    [],
  );
  const elapsed = performance.now() - startedAt;
  assert.ok(
    elapsed < 10_000,
    `O processamento sintético levou ${elapsed.toFixed(0)} ms.`,
  );
});

