import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "USDC.fun - Launch Tokens with USDC on pump.fun",
  description:
    "Launch your token on pump.fun using USDC. Connect your Phantom wallet and create your meme coin in minutes.",
  keywords: ["pump.fun", "solana", "usdc", "token", "launch", "meme coin", "crypto"],
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-gray-900 antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
