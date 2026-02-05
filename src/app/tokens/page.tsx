"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components";
import Link from "next/link";
import { getTokens, LaunchedToken } from "@/lib/storage";

export default function TokensPage() {
  const [tokens, setTokens] = useState<LaunchedToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedMint, setCopiedMint] = useState<string | null>(null);

  useEffect(() => {
    const loadTokens = () => {
      const storedTokens = getTokens();
      setTokens(storedTokens);
      setLoading(false);
    };

    loadTokens();
    const interval = setInterval(loadTokens, 5000);
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = (mint: string) => {
    navigator.clipboard.writeText(mint);
    setCopiedMint(mint);
    setTimeout(() => setCopiedMint(null), 2000);
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "just now";
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">your tokens</h1>
            <p className="text-gray-500 text-sm mt-1">
              tokens you launched via usdc.fun
            </p>
          </div>
          <Link
            href="/"
            className="px-5 py-2.5 bg-[#2775ca] hover:bg-[#1a5ca8] rounded-lg font-semibold text-white text-sm transition-all w-fit"
          >
            launch token
          </Link>
        </div>

        {loading && (
          <div className="py-20 text-center">
            <svg className="animate-spin h-8 w-8 text-[#2775ca] mx-auto mb-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-gray-500">loading...</p>
          </div>
        )}

        {!loading && tokens.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">no tokens yet</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              launch your first token on pump.fun using USDC
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-[#2775ca] hover:bg-[#1a5ca8] rounded-lg font-semibold text-white transition-all"
            >
              launch token
            </Link>
          </div>
        )}

        {!loading && tokens.length > 0 && (
          <div className="space-y-4">
            {tokens.map((token) => (
              <div
                key={token.mint}
                className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-all"
              >
                <div className="flex items-start gap-4">
                  {token.image && (
                    <img
                      src={token.image}
                      alt={token.name}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{token.name}</h3>
                      <span className="text-gray-500">${token.symbol}</span>
                      <span className="text-xs text-gray-400">{formatTime(token.launchedAt)}</span>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <code className="text-sm font-mono text-gray-500 truncate">
                        {token.mint}
                      </code>
                      <button
                        onClick={() => copyToClipboard(token.mint)}
                        className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs text-gray-600 hover:text-gray-900 transition-all flex-shrink-0"
                      >
                        {copiedMint === token.mint ? "copied!" : "copy"}
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <a
                        href={`https://pump.fun/${token.mint}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#2775ca] hover:text-[#1a5ca8] transition-colors"
                      >
                        pump.fun
                      </a>
                      <a
                        href={`https://solscan.io/token/${token.mint}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        solscan
                      </a>
                      <a
                        href={`https://dexscreener.com/solana/${token.mint}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        dexscreener
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-gray-200 py-6 px-6 mt-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-gray-400">
          <span>usdc.fun</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-600 transition-colors">twitter</a>
            <a href="#" className="hover:text-gray-600 transition-colors">telegram</a>
            <a href="#" className="hover:text-gray-600 transition-colors">docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
