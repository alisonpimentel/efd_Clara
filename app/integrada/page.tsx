import type { Metadata } from "next";
import { IntegratedEfdApp } from "../components/integrated-efd-app";

export const metadata: Metadata = {
  title: "Análise integrada de EFD ICMS/IPI e EFD-Contribuições",
  description:
    "Prova de conceito acadêmica que concilia localmente EFD ICMS/IPI e EFD-Contribuições para gerar indicadores empresariais, tributários e de qualidade.",
  alternates: { canonical: "/integrada" },
};

export default function IntegratedAnalysisPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "EFD Clara — análise integrada",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Navegador web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
    description:
      "Prova de conceito acadêmica para conciliar EFD ICMS/IPI e EFD-Contribuições sem transmitir os arquivos fiscais.",
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <IntegratedEfdApp />
    </>
  );
}

