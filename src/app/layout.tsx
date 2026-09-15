import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-open-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zhou Consulting — Finance, Accounting, and Tax Partner",
  description:
    "Mitra profesional dan terpercaya untuk layanan akuntansi, perpajakan, dan konsultasi bisnis keuangan Anda.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${openSans.variable} font-sans antialiased bg-background text-text`}>
        {children}
      </body>
    </html>
  );
}
