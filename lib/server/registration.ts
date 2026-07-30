const ALLOWED_INTERESTS = new Set([
  "empresario",
  "contador",
  "estudante",
  "consultor",
  "outro",
]);

type RegistrationInput = {
  name?: string;
  email?: string;
  interest?: string;
  privacyConsent?: boolean;
  communicationsConsent?: boolean;
};

type RegistrationResult =
  | {
      ok: true;
      data: {
        name: string;
        email: string;
        interest: string;
        communicationsConsent: boolean;
      };
    }
  | { ok: false; error: string };

export function validateRegistration(payload: RegistrationInput): RegistrationResult {
  const name = payload.name?.trim().slice(0, 100) ?? "";
  const email = payload.email?.trim().toLowerCase().slice(0, 254) ?? "";
  const interest = payload.interest?.trim() ?? "";

  if (name.length < 2) return { ok: false, error: "Informe seu nome." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Informe um e-mail válido." };
  }
  if (!ALLOWED_INTERESTS.has(interest)) {
    return { ok: false, error: "Selecione o seu perfil." };
  }
  if (!payload.privacyConsent) {
    return {
      ok: false,
      error: "O aceite de privacidade é necessário para o cadastro.",
    };
  }

  return {
    ok: true,
    data: {
      name,
      email,
      interest,
      communicationsConsent: Boolean(payload.communicationsConsent),
    },
  };
}
