"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useMemo } from "react";

export function Header() {
  const pathname = usePathname();
  const { publicKey, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  const base58 = useMemo(() => publicKey?.toBase58(), [publicKey]);

  return (
    <header className="border-b border-gray-200 bg-white/90 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 group">
          <span className="text-2xl font-black tracking-tighter text-gray-900">
            usdc
          </span>
          <span className="text-2xl font-black tracking-tighter text-[#2775ca]">
            .fun
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              pathname === "/"
                ? "bg-gray-100 text-gray-900"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            launch
          </Link>
          <Link
            href="/tokens"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              pathname === "/tokens"
                ? "bg-gray-100 text-gray-900"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            tokens
          </Link>
          <Link
            href="/fees"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              pathname === "/fees"
                ? "bg-gray-100 text-gray-900"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            creator fees
          </Link>
        </nav>

        {/* Wallet */}
        <div className="flex items-center gap-3">
          {connected && base58 ? (
            <>
              <Link
                href="/profile"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname === "/profile"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                profile
              </Link>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => disconnect()}
                  className="h-9 px-4 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-all"
                >
                  {base58.slice(0, 4)}...{base58.slice(-4)}
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => setVisible(true)}
              className="h-9 px-5 bg-[#2775ca] hover:bg-[#1a5ca8] rounded-lg text-sm font-semibold text-white transition-all"
            >
              connect wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
