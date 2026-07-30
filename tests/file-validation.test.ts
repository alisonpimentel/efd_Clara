import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MAX_SPED_FILE_SIZE,
  validateSpedSelection,
} from "../lib/sped/file-validation";

describe("seleção do arquivo EFD", () => {
  it("aceita somente um TXT de até 8 MB", () => {
    const result = validateSpedSelection([
      { name: "efd.txt", size: MAX_SPED_FILE_SIZE },
    ]);

    assert.equal(result.ok, true);
  });

  it("recusa arquivo acima de 8 MB", () => {
    const result = validateSpedSelection([
      { name: "efd.txt", size: MAX_SPED_FILE_SIZE + 1 },
    ]);

    assert.equal(result.ok, false);
    if (!result.ok) assert.match(result.error, /8 MB/);
  });

  it("recusa mais de um arquivo na mesma análise", () => {
    const result = validateSpedSelection([
      { name: "junho.txt", size: 100 },
      { name: "julho.txt", size: 100 },
    ]);

    assert.equal(result.ok, false);
    if (!result.ok) assert.match(result.error, /apenas um arquivo/);
  });

  it("recusa extensões diferentes de TXT", () => {
    const result = validateSpedSelection([{ name: "efd.xlsx", size: 100 }]);

    assert.equal(result.ok, false);
    if (!result.ok) assert.match(result.error, /TXT/);
  });
});
