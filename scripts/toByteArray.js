const readline = require("readline");
const bs58 = require("bs58").default;
const fs = require("fs");
const os = require("os");
const path = require("path");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("🔐 Enter your Phantom private key (base58):\n", (base58Key) => {
  try {
    const bytes = bs58.decode(base58Key.trim());
    const outputPath = path.join(os.homedir(), ".config", "solana", "id.json");
    fs.writeFileSync(outputPath, JSON.stringify(Array.from(bytes)));
    console.log(`✅ Saved to ${outputPath}`);
  } catch (err) {
    console.error("❌ Failed to decode key:", err.message);
  } finally {
    rl.close();
  }
});
