import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacidade",
  description:
    "Como o EFD Clara trata o cadastro mínimo e mantém a EFD ICMS/IPI no navegador.",
  alternates: { canonical: "/privacidade" },
};

export default function PrivacyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
