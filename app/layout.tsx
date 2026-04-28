import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "ApuestitaX",
  description: "Calculadora de apuesta asegurada con link compartible.",
  icons: {
    icon: "/icon.png?v=2",
    apple: "/icon.png?v=2",
  },
  openGraph: {
    title: "ApuestitaX",
    description: "Calculadora de apuesta asegurada con link compartible.",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "ApuestitaX",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "ApuestitaX",
    description: "Calculadora de apuesta asegurada con link compartible.",
    images: ["/icon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
