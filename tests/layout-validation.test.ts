import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import { validateSpedLayout } from "../lib/sped/layout-validation";
import { parseSped } from "../lib/sped/parser";

const contributionsOpening =
  "|0000|006|0|||01042024|30042024|AGROBRASIL FRIGORIFICO LTDA|44865458000189|RS|4312401||02|0|";

describe("identificação do leiaute SPED", () => {
  it("aceita a EFD ICMS/IPI antes de interpretar os campos", async () => {
    const text = await readFile(new URL("../public/exemplo-efd.txt", import.meta.url), "utf8");

    assert.deepEqual(validateSpedLayout(text), {
      ok: true,
      kind: "efd-icms-ipi",
    });
  });

  it("identifica EFD-Contribuições e impede campos deslocados", () => {
    const validation = validateSpedLayout(contributionsOpening);

    assert.equal(validation.ok, false);
    if (!validation.ok) {
      assert.equal(validation.kind, "efd-contribuicoes");
      assert.match(validation.error, /PIS\/Cofins/);
      assert.match(validation.error, /SPED Fiscal/);
    }
    assert.throws(() => parseSped(contributionsOpening), /EFD-Contribuições/);
  });

  it("recusa outros leiautes SPED sem tentar montar o dashboard", () => {
    const ecdOpening =
      "|0000|LECD|01042024|30042024|EMPRESA CONTABIL LTDA|44865458000189|RS|1490052167|4322004|";
    const validation = validateSpedLayout(ecdOpening);

    assert.equal(validation.ok, false);
    if (!validation.ok) {
      assert.equal(validation.kind, "other-sped");
      assert.match(validation.error, /ECD, ECF e EFD-Contribuições/);
    }
  });
});
