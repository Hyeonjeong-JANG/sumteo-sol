import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import {
  mplBubblegum,
  createTree,
  mintV1,
} from "@metaplex-foundation/mpl-bubblegum";
import {
  generateSigner,
  none,
  publicKey as toPublicKey,
  type Umi,
} from "@metaplex-foundation/umi";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import type { WalletContextState } from "@solana/wallet-adapter-react";

const TREE_STORAGE_KEY = "sumteo_merkle_tree";

export function getUmi(endpoint: string, wallet: WalletContextState): Umi {
  return createUmi(endpoint)
    .use(walletAdapterIdentity(wallet))
    .use(irysUploader())
    .use(mplBubblegum());
}

export function getStoredTreeAddress(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TREE_STORAGE_KEY);
}

export async function createReadingGarden(umi: Umi): Promise<string> {
  const merkleTree = generateSigner(umi);

  const builder = await createTree(umi, {
    merkleTree,
    maxDepth: 3,
    maxBufferSize: 8,
    public: true,
  });
  await builder.sendAndConfirm(umi, { confirm: { commitment: "confirmed" } });

  const treeAddress = merkleTree.publicKey.toString();
  localStorage.setItem(TREE_STORAGE_KEY, treeAddress);
  return treeAddress;
}

async function uploadMetadata(
  umi: Umi,
  bookTitle: string,
  readingMinutes: number
): Promise<string> {
  const metadata = {
    name: `${bookTitle}`.slice(0, 28) + " Tree",
    symbol: "SUMTEO",
    description: `Proof of Reading: "${bookTitle}" — ${readingMinutes} minutes on Sumteo`,
    image: "",
    attributes: [
      { trait_type: "Book", value: bookTitle },
      { trait_type: "Reading Minutes", value: readingMinutes },
      { trait_type: "Platform", value: "Sumteo" },
    ],
  };

  const uri = await umi.uploader.uploadJson(metadata);
  return uri;
}

export async function mintReadingTree(
  umi: Umi,
  treeAddress: string,
  bookTitle: string,
  readingMinutes: number
): Promise<{ signature: string }> {
  const merkleTree = toPublicKey(treeAddress);

  const metadataUri = await uploadMetadata(umi, bookTitle, readingMinutes);

  const result = await mintV1(umi, {
    leafOwner: umi.identity.publicKey,
    merkleTree,
    metadata: {
      name: `${bookTitle}`.slice(0, 28) + " Tree",
      symbol: "SUMTEO",
      uri: metadataUri,
      sellerFeeBasisPoints: 0,
      collection: none(),
      creators: [
        {
          address: umi.identity.publicKey,
          verified: false,
          share: 100,
        },
      ],
    },
  }).sendAndConfirm(umi, { confirm: { commitment: "confirmed" } });

  // Convert Uint8Array signature to base58
  const sigBytes = result.signature as Uint8Array;
  const signature = uint8ArrayToBase58(sigBytes);
  return { signature };
}

function uint8ArrayToBase58(bytes: Uint8Array): string {
  const ALPHABET =
    "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const digits = [0];
  for (let i = 0; i < bytes.length; i++) {
    let carry = bytes[i];
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  let output = "";
  for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
    output += "1";
  }
  for (let i = digits.length - 1; i >= 0; i--) {
    output += ALPHABET[digits[i]];
  }
  return output;
}
