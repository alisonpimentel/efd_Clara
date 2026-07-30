export const MAX_SPED_FILE_SIZE = 8 * 1024 * 1024;

type FileDescriptor = {
  name: string;
  size: number;
};

type SelectionResult =
  | { ok: true; file: FileDescriptor }
  | { ok: false; error: string };

export function validateSpedSelection(
  files: ArrayLike<FileDescriptor>,
): SelectionResult {
  if (files.length !== 1) {
    return {
      ok: false,
      error: "Selecione apenas um arquivo por análise.",
    };
  }

  const file = files[0];
  if (file.size > MAX_SPED_FILE_SIZE) {
    return {
      ok: false,
      error: "O arquivo ultrapassa o limite de 8 MB.",
    };
  }
  if (!file.name.toLowerCase().endsWith(".txt")) {
    return {
      ok: false,
      error: "Selecione um arquivo TXT da EFD ICMS/IPI.",
    };
  }

  return { ok: true, file };
}
