import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateRegistration } from "../lib/server/registration";

describe("cadastro de interessados", () => {
  it("normaliza um cadastro válido e preserva o aceite opcional", () => {
    const result = validateRegistration({
      name: "  Pessoa de Teste  ",
      email: " TESTE@EXEMPLO.COM ",
      interest: "contador",
      privacyConsent: true,
      communicationsConsent: true,
    });

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.data.name, "Pessoa de Teste");
      assert.equal(result.data.email, "teste@exemplo.com");
      assert.equal(result.data.communicationsConsent, true);
    }
  });

  it("exige consentimento de privacidade", () => {
    const result = validateRegistration({
      name: "Pessoa de Teste",
      email: "teste@exemplo.com",
      interest: "empresario",
      privacyConsent: false,
    });

    assert.equal(result.ok, false);
    if (!result.ok) assert.match(result.error, /privacidade/);
  });

  it("recusa e-mail e perfil inválidos", () => {
    const invalidEmail = validateRegistration({
      name: "Pessoa de Teste",
      email: "invalido",
      interest: "empresario",
      privacyConsent: true,
    });
    const invalidInterest = validateRegistration({
      name: "Pessoa de Teste",
      email: "teste@exemplo.com",
      interest: "perfil-inexistente",
      privacyConsent: true,
    });

    assert.equal(invalidEmail.ok, false);
    assert.equal(invalidInterest.ok, false);
  });
});
