import type { Metadata } from "next";
import { EfdClaraApp } from "./components/efd-clara-app";

export const metadata: Metadata = {
  title: "EFD Clara | Seu SPED em linguagem de negócio",
  description:
    "Protótipo acadêmico gratuito que transforma a EFD ICMS/IPI em uma visão gerencial simples, com processamento local e privado.",
};

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "EFD Clara",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Navegador web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "BRL",
    },
    description:
      "Aplicativo acadêmico gratuito que transforma registros da EFD ICMS/IPI em indicadores gerenciais, com processamento local.",
    featureList: [
      "Processamento local da EFD ICMS/IPI",
      "Dashboard de entradas e saídas",
      "Rankings de clientes, fornecedores e produtos",
      "Exportação CSV e PDF",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <EfdClaraApp />
    </>
  );
}
