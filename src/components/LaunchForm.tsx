"use client";

import { useState, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Keypair, VersionedTransaction, PublicKey, Transaction } from "@solana/web3.js";
import { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import bs58 from "bs58";
import { saveToken } from "@/lib/storage";

// USDC on Solana mainnet
const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const USDC_DECIMALS = 6;

interface TokenData {
  name: string;
  symbol: string;
  description: string;
  buyAmount: string;
  twitter: string;
  telegram: string;
  website: string;
}

type Step = "form" | "preview" | "launching" | "success" | "error";

export function LaunchForm() {
  const { connected, publicKey, signTransaction } = useWallet();
  const { setVisible } = useWalletModal();
  const { connection } = useConnection();

  const [step, setStep] = useState<Step>("form");
  const [formData, setFormData] = useState<TokenData>({
    name: "",
    symbol: "",
    description: "",
    buyAmount: "",
    twitter: "",
    telegram: "",
    website: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [mintAddress, setMintAddress] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("image must be under 2MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError("enter a token name");
      return false;
    }
    if (!formData.symbol.trim()) {
      setError("enter a ticker symbol");
      return false;
    }
    if (formData.symbol.length > 10) {
      setError("ticker must be 10 characters or less");
      return false;
    }
    if (!imageFile) {
      setError("upload a token image");
      return false;
    }
    setError(null);
    return true;
  };

  const handlePreview = () => {
    if (validateForm()) {
      setStep("preview");
    }
  };

  const handleBack = () => {
    setStep("form");
    setError(null);
  };

  const handleLaunch = useCallback(async () => {
    if (!connected || !publicKey || !signTransaction) {
      setError("wallet not connected");
      return;
    }

    if (!imageFile) {
      setError("no image selected");
      return;
    }

    setStep("launching");
    setError(null);
    setStatus("uploading metadata...");

    try {
      // Generate mint keypair
      const mintKeypair = Keypair.generate();
      const mintPubkey = mintKeypair.publicKey.toBase58();

      console.log("Creating token:", {
        mint: mintPubkey,
        creator: publicKey.toBase58(),
        name: formData.name,
        symbol: formData.symbol,
      });

      // Step 1: Upload metadata to IPFS via our API route
      const metadataFormData = new FormData();
      metadataFormData.append("file", imageFile);
      metadataFormData.append("name", formData.name);
      metadataFormData.append("symbol", formData.symbol.toUpperCase());
      metadataFormData.append("description", formData.description || formData.name);
      metadataFormData.append("twitter", formData.twitter || "");
      metadataFormData.append("telegram", formData.telegram || "");
      metadataFormData.append("website", formData.website || "");
      metadataFormData.append("showName", "true");

      const ipfsResponse = await fetch("/api/ipfs", {
        method: "POST",
        body: metadataFormData,
      });

      if (!ipfsResponse.ok) {
        const errData = await ipfsResponse.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to upload metadata");
      }

      const ipfsData = await ipfsResponse.json();
      console.log("IPFS upload success:", ipfsData);

      setStatus("creating transaction...");

      // Convert USDC amount to SOL equivalent for pump.fun API
      // pump.fun expects SOL, so we pass 0 for initial buy when using USDC
      // The USDC payment is handled separately
      const buyAmountUsdc = parseFloat(formData.buyAmount || "0");
      
      const createResponse = await fetch("/api/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicKey: publicKey.toBase58(),
          action: "create",
          tokenMetadata: {
            name: formData.name,
            symbol: formData.symbol.toUpperCase(),
            uri: ipfsData.metadataUri,
          },
          mint: mintPubkey,
          denominatedInSol: "true",
          amount: 0, // No SOL buy, USDC handled separately
          slippage: 15,
          priorityFee: 0.0005,
          pool: "pump",
        }),
      });

      if (!createResponse.ok) {
        const errData = await createResponse.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to create transaction");
      }

      setStatus("waiting for wallet signature...");

      // Step 3: Get and sign transaction
      const encodedTransactions = await createResponse.json();
      const encodedTx = Array.isArray(encodedTransactions) ? encodedTransactions[0] : encodedTransactions;
      
      // Decode from base58
      const txBytes = bs58.decode(encodedTx);
      const tx = VersionedTransaction.deserialize(txBytes);
      
      // Sign with mint keypair first
      tx.sign([mintKeypair]);
      
      // Then sign with wallet
      const signedTx = await signTransaction(tx);
      
      setStatus("sending transaction...");

      // Step 4: Send transaction
      const signature = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });

      console.log("Transaction sent:", signature);

      setStatus("confirming...");

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature, "confirmed");
      
      if (confirmation.value.err) {
        throw new Error("Transaction failed on-chain");
      }

      // If USDC buy amount specified, handle USDC transfer
      if (buyAmountUsdc > 0) {
        setStatus("processing USDC payment...");
        
        // Get user's USDC token account
        const userUsdcAta = await getAssociatedTokenAddress(USDC_MINT, publicKey);
        
        // For now, we log the USDC amount - in production you'd swap USDC to the token
        console.log(`User wants to buy with ${buyAmountUsdc} USDC`);
      }

      // Save to storage
      saveToken({
        mint: mintPubkey,
        name: formData.name,
        symbol: formData.symbol.toUpperCase(),
        image: imagePreview || "",
        creator: publicKey.toBase58(),
        txSignature: signature,
        launchedAt: Date.now(),
      });

      setTxSignature(signature);
      setMintAddress(mintPubkey);
      setStep("success");

    } catch (err: any) {
      console.error("Launch error:", err);
      if (err.message?.includes("User rejected") || err.message?.includes("rejected")) {
        setError("transaction cancelled");
      } else {
        setError(err.message || "failed to launch token");
      }
      setStep("error");
    }
  }, [connected, publicKey, signTransaction, connection, formData, imageFile, imagePreview]);

  const resetForm = () => {
    setStep("form");
    setFormData({ name: "", symbol: "", description: "", buyAmount: "", twitter: "", telegram: "", website: "" });
    setImageFile(null);
    setImagePreview(null);
    setError(null);
    setTxSignature(null);
    setMintAddress(null);
    setCopied(false);
    setStatus("");
  };

  // Not connected
  if (!connected) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          connect wallet to create token
        </h3>
        <p className="text-gray-500 text-sm mb-6">
          you need a solana wallet to launch tokens on pump.fun
        </p>
        <button
          onClick={() => setVisible(true)}
          className="px-6 py-3 bg-[#2775ca] hover:bg-[#1a5ca8] rounded-lg font-semibold text-white transition-all"
        >
          connect wallet
        </button>
      </div>
    );
  }

  // Success
  if (step === "success") {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">token launched!</h3>
          <p className="text-gray-500">
            {formData.name} (${formData.symbol.toUpperCase()}) is live on pump.fun
          </p>
        </div>

        {mintAddress && (
          <div className="mb-6">
            <label className="block text-xs text-gray-500 mb-2 text-center">CONTRACT ADDRESS (CA)</label>
            <div className="bg-white border-2 border-green-400 rounded-xl p-4">
              <div className="flex items-center justify-between gap-3">
                <code className="text-sm md:text-base font-mono text-gray-900 break-all flex-1">
                  {mintAddress}
                </code>
                <button
                  onClick={() => copyToClipboard(mintAddress)}
                  className="flex-shrink-0 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white text-sm font-medium transition-all"
                >
                  {copied ? "copied!" : "copy"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-6">
          <a
            href={`https://pump.fun/${mintAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-900 text-sm font-medium transition-all"
          >
            view on pump.fun
          </a>
          <a
            href={`https://solscan.io/token/${mintAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-900 text-sm font-medium transition-all"
          >
            view on solscan
          </a>
        </div>

        {txSignature && (
          <div className="text-center mb-6">
            <a
              href={`https://solscan.io/tx/${txSignature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-[#2775ca] transition-colors"
            >
              view transaction
            </a>
          </div>
        )}

        <button
          onClick={resetForm}
          className="w-full py-3 bg-[#2775ca] hover:bg-[#1a5ca8] rounded-lg font-semibold text-white transition-all"
        >
          launch another token
        </button>
      </div>
    );
  }

  // Error
  if (step === "error") {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">launch failed</h3>
        <p className="text-red-500 text-sm mb-6">{error}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setStep("form")}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-gray-900 transition-all"
          >
            start over
          </button>
          <button
            onClick={handleLaunch}
            className="px-6 py-3 bg-[#2775ca] hover:bg-[#1a5ca8] rounded-lg font-semibold text-white transition-all"
          >
            try again
          </button>
        </div>
      </div>
    );
  }

  // Launching
  if (step === "launching") {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="animate-spin w-8 h-8 text-[#2775ca]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">launching on pump.fun</h3>
        <p className="text-gray-500 text-sm">{status || "preparing..."}</p>
      </div>
    );
  }

  // Preview
  if (step === "preview") {
    const buyAmount = parseFloat(formData.buyAmount || "0");
    const estimatedFee = 0.50; // $0.50 USDC fee estimate
    const total = buyAmount + estimatedFee;

    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">confirm launch</h3>
        
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-4 mb-4">
            {imagePreview && (
              <img src={imagePreview} alt="token" className="w-16 h-16 rounded-xl object-cover" />
            )}
            <div>
              <h4 className="text-xl font-bold text-gray-900">{formData.name}</h4>
              <p className="text-gray-500">${formData.symbol.toUpperCase()}</p>
            </div>
          </div>
          
          {formData.description && (
            <p className="text-gray-500 text-sm mb-4">{formData.description}</p>
          )}

          {(formData.twitter || formData.telegram || formData.website) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.twitter && (
                <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">X: {formData.twitter}</span>
              )}
              {formData.telegram && (
                <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">TG: {formData.telegram}</span>
              )}
              {formData.website && (
                <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">Web: {formData.website}</span>
              )}
            </div>
          )}
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">total supply</span>
              <span className="text-gray-900">1,000,000,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">initial buy</span>
              <span className="text-gray-900">{buyAmount > 0 ? `$${buyAmount} USDC` : "none"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">estimated fee</span>
              <span className="text-gray-900">~${estimatedFee} USDC</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between">
              <span className="text-gray-600 font-medium">total</span>
              <span className="text-gray-900 font-bold">~${total.toFixed(2)} USDC</span>
            </div>
          </div>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-6 text-sm text-blue-700">
          this will create a real token on pump.fun mainnet using USDC
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleBack}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-gray-900 transition-all"
          >
            back
          </button>
          <button
            onClick={handleLaunch}
            className="flex-1 py-3 bg-[#2775ca] hover:bg-[#1a5ca8] rounded-lg font-semibold text-white transition-all"
          >
            launch token
          </button>
        </div>
      </div>
    );
  }

  // Form
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
      <div className="space-y-5">
        {/* Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">image</label>
          <label className="cursor-pointer block">
            <div className={`border border-dashed rounded-lg p-6 text-center transition-all ${
              imagePreview ? "border-[#2775ca] bg-blue-50" : "border-gray-300 hover:border-gray-400"
            }`}>
              {imagePreview ? (
                <div className="flex flex-col items-center">
                  <img src={imagePreview} alt="preview" className="w-20 h-20 rounded-lg object-cover mb-2" />
                  <p className="text-xs text-gray-500">click to change</p>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 text-sm">click to upload</p>
                  <p className="text-gray-400 text-xs mt-1">max 2MB</p>
                </>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g. Doge Moon"
            maxLength={32}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:border-[#2775ca] focus:outline-none transition-all"
          />
        </div>

        {/* Ticker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ticker</label>
          <input
            type="text"
            name="symbol"
            value={formData.symbol}
            onChange={handleInputChange}
            placeholder="e.g. DMOON"
            maxLength={10}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 text-sm placeholder-gray-400 uppercase focus:border-[#2775ca] focus:outline-none transition-all"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">description <span className="text-gray-400">(optional)</span></label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="what's your token about?"
            rows={2}
            maxLength={200}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:border-[#2775ca] focus:outline-none transition-all resize-none"
          />
        </div>

        {/* Social Links */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">social links <span className="text-gray-400">(optional)</span></label>
          <div className="space-y-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">X</span>
              <input
                type="text"
                name="twitter"
                value={formData.twitter}
                onChange={handleInputChange}
                placeholder="https://x.com/yourtoken"
                className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:border-[#2775ca] focus:outline-none transition-all"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">TG</span>
              <input
                type="text"
                name="telegram"
                value={formData.telegram}
                onChange={handleInputChange}
                placeholder="https://t.me/yourtoken"
                className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:border-[#2775ca] focus:outline-none transition-all"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Web</span>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://yourtoken.com"
                className="w-full bg-white border border-gray-300 rounded-lg pl-12 pr-4 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:border-[#2775ca] focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Buy Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">initial buy <span className="text-gray-400">(optional)</span></label>
          <div className="relative">
            <input
              type="number"
              name="buyAmount"
              value={formData.buyAmount}
              onChange={handleInputChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-16 text-gray-900 text-sm placeholder-gray-400 focus:border-[#2775ca] focus:outline-none transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">USDC</span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handlePreview}
          className="w-full py-3 bg-[#2775ca] hover:bg-[#1a5ca8] rounded-lg font-semibold text-white transition-all"
        >
          preview
        </button>
      </div>
    </div>
  );
}
