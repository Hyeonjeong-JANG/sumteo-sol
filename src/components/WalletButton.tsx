"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function WalletButton() {
  return (
    <WalletMultiButton className="!bg-emerald-500 hover:!bg-emerald-600 !rounded-lg !text-sm !font-semibold" />
  );
}
