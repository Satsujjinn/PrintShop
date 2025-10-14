/**
 * Root layout with modern design and portfolio focus
 * Created by Leon Jordaan
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Leon Jordaan - Digital Art Studio | Portfolio",
  description: "Discover unique digital art prints by Leon Jordaan. A portfolio demonstration showcasing modern web development skills with Next.js, TypeScript, and e-commerce capabilities.",
  keywords: "digital art, portfolio, web development, Next.js, TypeScript, full-stack developer, art prints, Leon Jordaan",
  authors: [{ name: "Leon Jordaan" }],
  creator: "Leon Jordaan",
  openGraph: {
    title: "Leon Jordaan - Digital Art Studio",
    description: "Portfolio demonstration showcasing modern web development and digital art",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Leon Jordaan - Digital Art Studio",
    description: "Portfolio demonstration showcasing modern web development and digital art",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}
      >
        <Providers>
          <Header />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
