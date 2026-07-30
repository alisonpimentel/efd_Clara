import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createPasswordDigest,
  isValidCpf,
  normalizeCpf,
  verifyPassword,
} from "../lib/server/admin-auth";

describe("credencial administrativa", () => {
  it("normaliza e valida CPF sem armazenar a máscara", () => {
    assert.equal(normalizeCpf("529.982.247-25"), "52998224725");
    assert.equal(isValidCpf("529.982.247-25"), true);
    assert.equal(isValidCpf("111.111.111-11"), false);
  });

  it("protege a senha com sal e rejeita valor incorreto", async () => {
    const password = "Senha acadêmica segura 2026!";
    const stored = await createPasswordDigest(password);

    assert.notEqual(stored.digest, password);
    assert.equal(await verifyPassword(password, stored.salt, stored.digest), true);
    assert.equal(
      await verifyPassword("senha incorreta", stored.salt, stored.digest),
      false,
    );
  });
});
