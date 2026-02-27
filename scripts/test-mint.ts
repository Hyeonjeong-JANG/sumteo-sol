import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  keypairIdentity,
  generateSigner,
  sol,
  none,
} from "@metaplex-foundation/umi";
import {
  mplBubblegum,
  createTree,
  mintV1,
  findTreeConfigPda,
} from "@metaplex-foundation/mpl-bubblegum";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

const DEVNET_URL = "https://api.devnet.solana.com";
const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

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

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("=== Sumteo Devnet Minting Test ===\n");

  // 1. Setup UMI + keypair (load from file or generate)
  const umi = createUmi(DEVNET_URL).use(mplBubblegum());
  const connection = new Connection(DEVNET_URL, "confirmed");

  let web3Keypair: Keypair;
  const fs = await import("fs");
  const keyfilePath = "/tmp/sumteo-test-wallet.json";

  if (fs.existsSync(keyfilePath)) {
    const keyData = JSON.parse(fs.readFileSync(keyfilePath, "utf-8"));
    web3Keypair = Keypair.fromSecretKey(new Uint8Array(keyData));
    console.log("Loaded keypair from", keyfilePath);
  } else {
    web3Keypair = Keypair.generate();
    console.log("Generated new keypair");
  }

  const umiKeypair = umi.eddsa.createKeypairFromSecretKey(
    web3Keypair.secretKey
  );
  umi.use(keypairIdentity(umiKeypair));

  console.log("Wallet:", web3Keypair.publicKey.toBase58());

  // 2. Check balance / Airdrop SOL
  let balance = await connection.getBalance(web3Keypair.publicKey);
  console.log(`\n[1/4] Current balance: ${balance / 1e9} SOL`);

  if (balance < 0.1 * 1e9) {
    console.log("  Requesting devnet SOL airdrop...");
    try {
      const airdropSig = await connection.requestAirdrop(
        web3Keypair.publicKey,
        2 * 1_000_000_000
      );
      await connection.confirmTransaction(airdropSig, "confirmed");
      balance = await connection.getBalance(web3Keypair.publicKey);
      console.log(`  New balance: ${balance / 1e9} SOL`);
    } catch {
      console.error(
        "  Airdrop failed (rate limited). Please fund this wallet manually:"
      );
      console.error(
        `  Go to https://faucet.solana.com → Connect GitHub → Enter: ${web3Keypair.publicKey.toBase58()}`
      );
      console.error("  Then re-run this script.");
      process.exit(1);
    }
  } else {
    console.log("  Sufficient balance, skipping airdrop.");
  }

  // 3. Record Proof of Reading (Memo)
  console.log("\n[2/4] Recording Proof of Reading on-chain...");
  const memo = JSON.stringify({
    protocol: "sumteo",
    version: 1,
    type: "proof_of_reading",
    book: "Atomic Habits",
    duration_minutes: 30,
    pages_read: 42,
    session_type: "solo",
    timestamp: Math.floor(Date.now() / 1000),
  });

  const memoIx = new TransactionInstruction({
    keys: [
      { pubkey: web3Keypair.publicKey, isSigner: true, isWritable: false },
    ],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(memo),
  });

  const memoTx = new Transaction().add(memoIx);
  const memoSig = await sendAndConfirmTransaction(connection, memoTx, [
    web3Keypair,
  ]);
  console.log(`  Proof of Reading TX: ${memoSig}`);
  console.log(
    `  Explorer: https://explorer.solana.com/tx/${memoSig}?cluster=devnet`
  );

  // 4. Create Merkle Tree (Reading Garden)
  console.log("\n[3/4] Creating Reading Garden (Merkle tree)...");
  const merkleTree = generateSigner(umi);
  const treeBuilder = await createTree(umi, {
    merkleTree,
    maxDepth: 3,
    maxBufferSize: 8,
    public: true,
  });
  const treeResult = await treeBuilder.sendAndConfirm(umi, {
    confirm: { commitment: "finalized" },
  });
  const treeSig = uint8ArrayToBase58(treeResult.signature as Uint8Array);
  const treeAddress = merkleTree.publicKey.toString();
  console.log(`  Tree address: ${treeAddress}`);
  console.log(`  Tree TX: ${treeSig}`);
  console.log(
    `  Explorer: https://explorer.solana.com/address/${treeAddress}?cluster=devnet`
  );

  // Verify tree config PDA exists
  const treeConfigPda = findTreeConfigPda(umi, {
    merkleTree: merkleTree.publicKey,
  });
  console.log(`  Tree config PDA: ${treeConfigPda}`);
  const treeConfigAccount = await umi.rpc.getAccount(treeConfigPda[0]);
  if (treeConfigAccount.exists) {
    console.log(
      `  Tree config verified (${treeConfigAccount.data.length} bytes)`
    );
  } else {
    console.error("  ERROR: Tree config PDA does not exist after createTree!");
    console.error("  The createTree transaction may have failed silently.");
    process.exit(1);
  }

  // 5. Mint cNFT
  console.log("\n[4/4] Minting Reading Tree cNFT...");
  const mintResult = await mintV1(umi, {
    leafOwner: umi.identity.publicKey,
    merkleTree: merkleTree.publicKey,
    metadata: {
      name: "Atomic Habits Tree",
      symbol: "SUMTEO",
      uri: "https://sumteo.xyz/api/nft/atomic-habits.json",
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

  const mintSig = uint8ArrayToBase58(mintResult.signature as Uint8Array);
  console.log(`  Mint TX: ${mintSig}`);
  console.log(
    `  Explorer: https://explorer.solana.com/tx/${mintSig}?cluster=devnet`
  );

  // Final balance
  const finalBalance = await connection.getBalance(web3Keypair.publicKey);
  console.log(`\n=== Test Complete ===`);
  console.log(`Remaining balance: ${(finalBalance / 1e9).toFixed(4)} SOL`);
  console.log(
    `Total cost: ${((balance - finalBalance) / 1e9).toFixed(4)} SOL`
  );

  console.log(`\n--- Links for Demo ---`);
  console.log(
    `Proof of Reading: https://explorer.solana.com/tx/${memoSig}?cluster=devnet`
  );
  console.log(
    `Reading Garden:   https://explorer.solana.com/address/${treeAddress}?cluster=devnet`
  );
  console.log(
    `cNFT Mint:        https://explorer.solana.com/tx/${mintSig}?cluster=devnet`
  );
}

main().catch(console.error);
