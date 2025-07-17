import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



export const metadata: Metadata = {
  title: "Bunnell's Books",
  description: "Tim Bunnell's personal library",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-eb-garamond antialiased`}
      >
        <Providers>
          <div className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/30 shadow-sm">
            <Navbar />
          </div>
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
