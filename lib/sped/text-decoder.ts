export type SpedTextEncoding = "utf-8" | "windows-1252";

export type DecodedSpedText = {
  text: string;
  encoding: SpedTextEncoding;
};

/**
 * EFD files are commonly generated either as UTF-8 or Windows-1252 text.
 * Decode as strict UTF-8 first so that accented legacy files do not silently
 * acquire replacement characters. When UTF-8 is invalid, use Windows-1252.
 */
export function decodeSpedBuffer(buffer: ArrayBuffer): DecodedSpedText {
  try {
    return {
      text: new TextDecoder("utf-8", { fatal: true }).decode(buffer),
      encoding: "utf-8",
    };
  } catch {
    return {
      text: new TextDecoder("windows-1252").decode(buffer),
      encoding: "windows-1252",
    };
  }
}
