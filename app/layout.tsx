import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  const metadataBase = new URL(host ? `${protocol}://${host}` : "https://efd-clara.local");

  return {
    metadataBase,
    title: {
      default: "EFD Clara",
      template: "%s | EFD Clara",
    },
    description:
      "Business Intelligence simples para compreender a movimentação registrada na EFD ICMS/IPI.",
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      title: "EFD Clara",
      description: "Seu SPED em linguagem de negócio.",
      type: "website",
      images: [
        {
          url: "/og.png",
          width: 1200,
          height: 630,
          alt: "EFD Clara: um arquivo TXT sendo transformado em gráficos de negócio.",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "EFD Clara",
      description: "Seu SPED em linguagem de negócio.",
      images: ["/og.png"],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
