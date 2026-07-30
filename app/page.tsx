import type { Metadata } from "next";
import { EfdClaraApp } from "./components/efd-clara-app";

export const metadata: Metadata = {
  title: "EFD Clara | Seu SPED em linguagem de negócio",
  description:
    "Protótipo acadêmico gratuito que transforma a EFD ICMS/IPI em uma visão gerencial simples, com processamento local e privado.",
};

export default function Home() {
  return <EfdClaraApp />;
}

