import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Crimson_Pro } from "next/font/google";

const crimsonPro = Crimson_Pro({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-crimson-pro" });
import "./globals.css";

export const metadata: Metadata = {
  title: "ALMANAC",
  description: "Curated + Discounted Archive Fashion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="awin-verification" content="Awin" />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} ${crimsonPro.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
