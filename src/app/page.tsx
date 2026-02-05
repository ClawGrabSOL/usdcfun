"use client";

import { Header, LaunchForm } from "@/components";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            launch a coin on pump.fun
          </h1>
          <p className="text-gray-500 text-sm">
            pay with USDC. fair launch. bonding curve. instantly tradeable.
          </p>
        </div>

        <LaunchForm />

        <div className="mt-10 p-5 bg-gray-50 border border-gray-200 rounded-xl">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">how it works</h3>
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex gap-3">
              <span className="text-[#2775ca] font-mono text-xs">1</span>
              <span>pick a name, ticker, and upload an image</span>
            </div>
            <div className="flex gap-3">
              <span className="text-[#2775ca] font-mono text-xs">2</span>
              <span>optionally buy some tokens at launch with USDC</span>
            </div>
            <div className="flex gap-3">
              <span className="text-[#2775ca] font-mono text-xs">3</span>
              <span>confirm transaction in your wallet</span>
            </div>
            <div className="flex gap-3">
              <span className="text-[#2775ca] font-mono text-xs">4</span>
              <span>your token goes live on pump.fun instantly</span>
            </div>
          </div>
        </div>
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
