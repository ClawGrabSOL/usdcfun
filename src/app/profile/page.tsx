"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export default function ProfilePage() {
  const { publicKey, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBalance() {
      if (publicKey) {
        try {
          const bal = await connection.getBalance(publicKey);
          setBalance(bal / LAMPORTS_PER_SOL);
        } catch (err) {
          console.error("Failed to fetch balance:", err);
        }
      }
      setLoading(false);
    }
    fetchBalance();
  }, [publicKey, connection]);

  if (!connected || !publicKey) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-2xl mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            connect your wallet
          </h1>
          <p className="text-gray-500 mb-8">
            view your profile, holdings, and rewards
          </p>
          <button
            onClick={() => setVisible(true)}
            className="px-6 py-3 bg-[#2775ca] hover:bg-[#1a5ca8] rounded-lg font-semibold text-white transition-all"
          >
            connect wallet
          </button>
        </main>
      </div>
    );
  }

  const address = publicKey.toBase58();

  // Mock data for demo
  const mockHoldings = [
    { name: "DMOON", balance: "1,234,567", value: "$42.50", pnl: "+156%" },
    { name: "PEPE", balance: "500,000", value: "$18.20", pnl: "+45%" },
    { name: "SHARK", balance: "2,100,000", value: "$89.10", pnl: "-12%" },
  ];

  const mockActivity = [
    { type: "buy", token: "DMOON", amount: "$5.00 USDC", time: "2 hours ago" },
    { type: "sell", token: "PEPE", amount: "$2.00 USDC", time: "5 hours ago" },
    { type: "create", token: "MYTOKEN", amount: "$0.50 USDC", time: "1 day ago" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Profile Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">profile</h1>
            <div className="flex items-center gap-3">
              <code className="text-gray-500 text-sm bg-gray-100 px-3 py-1.5 rounded-lg">
                {address.slice(0, 8)}...{address.slice(-8)}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(address)}
                className="text-gray-400 hover:text-gray-900 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
          <button
            onClick={() => disconnect()}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-all"
          >
            disconnect
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="text-sm text-gray-500 mb-1">SOL balance</div>
            <div className="text-2xl font-bold text-gray-900">
              {loading ? "..." : balance?.toFixed(4)} SOL
            </div>
          </div>
          <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="text-sm text-gray-500 mb-1">tokens held</div>
            <div className="text-2xl font-bold text-gray-900">3</div>
          </div>
          <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="text-sm text-gray-500 mb-1">tokens created</div>
            <div className="text-2xl font-bold text-gray-900">1</div>
          </div>
          <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="text-sm text-gray-500 mb-1">rewards earned</div>
            <div className="text-2xl font-bold text-[#2775ca]">$24.00 USDC</div>
          </div>
        </div>

        {/* Unclaimed Rewards */}
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl mb-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">unclaimed rewards</div>
              <div className="text-3xl font-bold text-gray-900">$8.20 USDC</div>
              <div className="text-sm text-gray-500 mt-1">from 3 tokens you hold</div>
            </div>
            <button className="px-6 py-3 bg-[#2775ca] hover:bg-[#1a5ca8] rounded-lg font-semibold text-white transition-all">
              claim all
            </button>
          </div>
        </div>

        {/* Holdings */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">holdings</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-4 text-sm font-medium text-gray-500">token</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-500">balance</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-500">value</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-500">pnl</th>
                </tr>
              </thead>
              <tbody>
                {mockHoldings.map((holding, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-100/50 transition-colors">
                    <td className="p-4">
                      <span className="font-medium text-gray-900">{holding.name}</span>
                    </td>
                    <td className="p-4 text-right text-gray-600">{holding.balance}</td>
                    <td className="p-4 text-right text-gray-600">{holding.value}</td>
                    <td className={`p-4 text-right font-medium ${
                      holding.pnl.startsWith("+") ? "text-green-500" : "text-red-500"
                    }`}>
                      {holding.pnl}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">recent activity</h2>
          <div className="space-y-3">
            {mockActivity.map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    activity.type === "buy" ? "bg-green-100 text-green-500" :
                    activity.type === "sell" ? "bg-red-100 text-red-500" :
                    "bg-blue-100 text-[#2775ca]"
                  }`}>
                    {activity.type === "buy" && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    )}
                    {activity.type === "sell" && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    )}
                    {activity.type === "create" && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="text-gray-900 font-medium">
                      {activity.type} {activity.token}
                    </div>
                    <div className="text-gray-500 text-sm">{activity.time}</div>
                  </div>
                </div>
                <div className="text-gray-700 font-medium">{activity.amount}</div>
              </div>
            ))}
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
