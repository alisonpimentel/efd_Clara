import { detectEfdKind } from "./parser";
import type { EfdKind } from "./types";

export type IntegratedTextSource = {
  text: string;
  fileName: string;
};

export type IntegratedTextPair = {
  icms: IntegratedTextSource;
  contributions: IntegratedTextSource;
};

export function efdKindLabel(kind: EfdKind): string {
  return kind === "efd-icms-ipi"
    ? "EFD ICMS/IPI"
    : "EFD-Contribuições";
}

export function orderIntegratedTextSources(
  first: IntegratedTextSource,
  second: IntegratedTextSource,
): IntegratedTextPair {
  const firstKind = detectEfdKind(first.text);
  const secondKind = detectEfdKind(second.text);

  if (firstKind === secondKind) {
    throw new Error(
      `Os dois arquivos foram reconhecidos como ${efdKindLabel(firstKind)}. Selecione uma EFD ICMS/IPI e uma EFD-Contribuições.`,
    );
  }

  return firstKind === "efd-icms-ipi"
    ? { icms: first, contributions: second }
    : { icms: second, contributions: first };
}
