const readline = require("readline");
const bs58 = require("bs58").default;
const fs = require("fs");
const os = require("os");
const path = require("path");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const defaultPath = path.join(os.homedir(), ".config", "solana", "id.json");

rl.question(`📂 Enter path to Solana keypair (default: ${defaultPath}):\n`, (inputPath) => {
  const filePath = inputPath.trim() || defaultPath;
  try {
    const keypair = JSON.parse(fs.readFileSync(filePath));
    const secretKey = Uint8Array.from(keypair.slice(0, 32)); // only first 32 bytes
    const base58Key = bs58.encode(secretKey);
    console.log("\n🔑 Phantom-compatible private key:\n" + base58Key + "\n");
  } catch (err) {
    console.error("❌ Failed to process keypair:", err.message);
  } finally {
    rl.close();
  }
});
