import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import type { WalletContextState } from "@solana/wallet-adapter-react";

const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

export interface ReadingProofData {
  book: string;
  durationMinutes: number;
  pagesRead: number;
  sessionType: "solo" | "group";
}

export async function recordReadingProof(
  connection: Connection,
  wallet: WalletContextState,
  data: ReadingProofData
): Promise<string> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error("Wallet not connected");
  }

  const memo = JSON.stringify({
    protocol: "sumteo",
    version: 1,
    type: "proof_of_reading",
    book: data.book,
    duration_minutes: data.durationMinutes,
    pages_read: data.pagesRead,
    session_type: data.sessionType,
    timestamp: Math.floor(Date.now() / 1000),
  });

  const instruction = new TransactionInstruction({
    keys: [
      { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
    ],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(memo),
  });

  const tx = new Transaction().add(instruction);
  const { blockhash } = await connection.getLatestBlockhash("confirmed");
  tx.recentBlockhash = blockhash;
  tx.feePayer = wallet.publicKey;

  const signed = await wallet.signTransaction(tx);
  const signature = await connection.sendRawTransaction(signed.serialize());
  await connection.confirmTransaction(signature, "confirmed");

  return signature;
}
