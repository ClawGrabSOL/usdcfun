"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useCallback, useMemo } from "react";

export function WalletButton() {
  const { publicKey, wallet, disconnect, connecting, connected } = useWallet();
  const { setVisible } = useWalletModal();

  const base58 = useMemo(() => publicKey?.toBase58(), [publicKey]);

  const handleClick = useCallback(() => {
    if (connected) {
      disconnect();
    } else {
      setVisible(true);
    }
  }, [connected, disconnect, setVisible]);

  return (
    <button
      onClick={handleClick}
      disabled={connecting}
      className="h-9 px-5 bg-red-600 hover:bg-red-500 disabled:bg-neutral-700 rounded-lg text-sm font-semibold text-white transition-all flex items-center gap-2"
    >
      {connecting ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          connecting...
        </>
      ) : connected && base58 ? (
        `${base58.slice(0, 4)}...${base58.slice(-4)}`
      ) : (
        "connect wallet"
      )}
    </button>
  );
}
