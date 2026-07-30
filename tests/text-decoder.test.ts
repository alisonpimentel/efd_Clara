import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { decodeSpedBuffer } from "../lib/sped/text-decoder";

function asArrayBuffer(bytes: number[]) {
  return Uint8Array.from(bytes).buffer;
}

describe("codificação do arquivo EFD", () => {
  it("preserva texto UTF-8", () => {
    const source = "|0200|1|CABEÇOTE E PEÇA|";
    const encoded = new TextEncoder().encode(source);
    const result = decodeSpedBuffer(encoded.buffer);

    assert.equal(result.encoding, "utf-8");
    assert.equal(result.text, source);
  });

  it("recupera acentos de arquivos Windows-1252", () => {
    const encoded = asArrayBuffer([
      0x7c, 0x30, 0x32, 0x30, 0x30, 0x7c, 0x31, 0x7c, 0x43, 0x41, 0x42, 0x45,
      0xc7, 0x4f, 0x54, 0x45, 0x20, 0x45, 0x20, 0x50, 0x45, 0xc7, 0x41, 0x7c,
    ]);
    const result = decodeSpedBuffer(encoded);

    assert.equal(result.encoding, "windows-1252");
    assert.equal(result.text, "|0200|1|CABEÇOTE E PEÇA|");
  });
});
