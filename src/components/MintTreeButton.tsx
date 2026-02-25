"use client";

import { useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import {
  getUmi,
  getStoredTreeAddress,
  createReadingGarden,
  mintReadingTree,
} from "@/lib/solana/cnft";
import { recordReadingProof } from "@/lib/solana/proof";

type MintStatus =
  | "idle"
  | "recording_proof"
  | "creating_tree"
  | "minting"
  | "success"
  | "error";

interface MintResult {
  proofSignature: string;
  mintSignature?: string;
  treeAddress?: string;
}

interface MintTreeButtonProps {
  bookTitle: string;
  readingMinutes: number;
  onMinted?: (result: MintResult) => void;
}

export function MintTreeButton({
  bookTitle,
  readingMinutes,
  onMinted,
}: MintTreeButtonProps) {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [status, setStatus] = useState<MintStatus>("idle");
  const [result, setResult] = useState<MintResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMint = useCallback(async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      setError("Please connect your wallet first");
      setStatus("error");
      return;
    }

    try {
      setError(null);

      // Step 1: Record Proof of Reading on-chain (Memo)
      setStatus("recording_proof");
      const proofSig = await recordReadingProof(connection, wallet, {
        book: bookTitle,
        durationMinutes: readingMinutes,
        pagesRead: 0,
        sessionType: "solo",
      });

      // Step 2: Create Merkle tree if needed
      const endpoint =
        process.env.NEXT_PUBLIC_SOLANA_RPC ||
        `https://api.devnet.solana.com`;
      const umi = getUmi(endpoint, wallet);

      let treeAddress = getStoredTreeAddress();
      if (!treeAddress) {
        setStatus("creating_tree");
        treeAddress = await createReadingGarden(umi);
      }

      // Step 3: Mint cNFT
      setStatus("minting");
      const { signature: mintSig } = await mintReadingTree(
        umi,
        treeAddress,
        bookTitle,
        readingMinutes
      );

      const mintResult: MintResult = {
        proofSignature: proofSig,
        mintSignature: mintSig,
        treeAddress,
      };
      setResult(mintResult);
      setStatus("success");
      onMinted?.(mintResult);
    } catch (err) {
      console.error("Mint error:", err);
      setError(err instanceof Error ? err.message : "Transaction failed");
      setStatus("error");
    }
  }, [wallet, connection, bookTitle, readingMinutes, onMinted]);

  if (!wallet.connected) {
    return (
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 text-center">
        <p className="text-gray-400 text-sm">
          Connect your wallet to mint your reading tree
        </p>
      </div>
    );
  }

  if (status === "success" && result) {
    return (
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 space-y-4">
        <div className="text-center">
          <div className="text-4xl mb-2">🌳</div>
          <h3 className="text-lg font-bold text-emerald-400">
            Tree Minted on Solana!
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Your reading proof is recorded on-chain
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2">
            <span className="text-gray-400">Proof of Reading</span>
            <a
              href={`https://explorer.solana.com/tx/${result.proofSignature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-mono truncate max-w-[140px]"
            >
              {result.proofSignature.slice(0, 8)}...
            </a>
          </div>

          {result.mintSignature && (
            <div className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2">
              <span className="text-gray-400">cNFT Mint</span>
              <a
                href={`https://explorer.solana.com/tx/${result.mintSignature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 font-mono truncate max-w-[140px]"
              >
                {result.mintSignature.slice(0, 8)}...
              </a>
            </div>
          )}

          {result.treeAddress && (
            <div className="flex items-center justify-between bg-gray-800/50 rounded-lg px-3 py-2">
              <span className="text-gray-400">Reading Garden</span>
              <a
                href={`https://explorer.solana.com/address/${result.treeAddress}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:text-emerald-300 font-mono truncate max-w-[140px]"
              >
                {result.treeAddress.slice(0, 8)}...
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 text-center space-y-4">
      <div>
        <h3 className="font-semibold text-lg">Mint Your Reading Tree</h3>
        <p className="text-gray-400 text-sm mt-1">
          Record your proof of reading &amp; mint a cNFT on Solana
        </p>
      </div>

      {status !== "idle" && status !== "error" && (
        <div className="flex items-center justify-center gap-2 text-sm text-emerald-400">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          {status === "recording_proof" && "Recording Proof of Reading..."}
          {status === "creating_tree" && "Creating your Reading Garden..."}
          {status === "minting" && "Minting cNFT tree..."}
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      <button
        onClick={handleMint}
        disabled={status !== "idle" && status !== "error"}
        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:text-gray-500 rounded-xl font-semibold transition-colors"
      >
        {status === "idle" || status === "error"
          ? "Mint & Record On-chain"
          : "Processing..."}
      </button>

      <p className="text-gray-500 text-xs">
        Costs &lt; $0.001 on Solana Devnet
      </p>
    </div>
  );
}
