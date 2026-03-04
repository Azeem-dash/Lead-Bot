import { Navbar } from "@/components/Navbar";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "myleadbots — Show, Don't Tell. AI Website Demos That Close Deals.",
  description: "Generate live website demos for your prospects and reach them on Email, Instagram, and Facebook automatically.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0F172A] text-[#F8FAFC] antialiased`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
