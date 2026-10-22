import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import Script from "next/script";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-open-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zhou Consulting - Tax and Accounting Services",
  description:
    "Mitra profesional untuk layanan akuntansi, perpajakan, dan konsultasi bisnis keuangan Anda.",
  icons: {
    icon: "/images/zhou-logo.png",
    shortcut: "/images/zhou-logo.png",
    apple: "/images/zhou-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={openSans.variable}>
      <body className={`${openSans.className} font-sans antialiased bg-background text-text`}>
        <AuthProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </AuthProvider>
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}

