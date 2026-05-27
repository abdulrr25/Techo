/**
 * Auto-funding endpoint for new embedded wallet users.
 *
 * Called server-side when a user logs in with Google/email for the first time.
 * Sends them testnet ETH (for gas) + ETHx (for streaming) from a dispenser wallet
 * so they never need to know what a faucet, ETHx, or Base Sepolia is.
 *
 * Required Vercel env vars (set these in your Vercel project settings):
 *   DISPENSER_PRIVATE_KEY   — private key of a funded Base Sepolia wallet
 *   NEXT_PUBLIC_RPC_URL     — Base Sepolia RPC URL
 *   NEXT_PUBLIC_SUPER_TOKEN_ADDRESS — ETHx super token address
 *
 * To fund the dispenser wallet:
 *   1. Create a new wallet (MetaMask → create account, copy private key)
 *   2. Use https://www.alchemy.com/faucets/base-sepolia to get testnet ETH
 *   3. Paste the private key into DISPENSER_PRIVATE_KEY in Vercel
 *   Keep ~0.5+ ETH in the dispenser so it can fund many users.
 */

import { ethers } from "ethers";

// Minimal ABI — only the three functions the dispenser needs
const SUPER_TOKEN_ABI = [
  "function upgradeByETH() external payable",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
];

// In-memory deduplication.
// Resets on Vercel cold starts, but the balance check prevents double-funding anyway.
const funded = new Set();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { address } = req.body ?? {};
  if (!address || !ethers.isAddress(address)) {
    return res.status(400).json({ error: "Invalid address" });
  }

  const key    = address.toLowerCase();
  const privKey          = process.env.DISPENSER_PRIVATE_KEY;
  const rpcUrl           = process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.base.org";
  const superTokenAddr   = process.env.NEXT_PUBLIC_SUPER_TOKEN_ADDRESS;

  // Faucet not configured — fail gracefully, don't crash the user's session
  if (!privKey) {
    return res.status(200).json({ skipped: true, reason: "faucet-not-configured" });
  }

  // Already funded this session
  if (funded.has(key)) {
    return res.status(200).json({ alreadyFunded: true });
  }

  try {
    const provider  = new ethers.JsonRpcProvider(rpcUrl);
    const dispenser = new ethers.Wallet(privKey, provider);

    // Check if user already has ETH — if so, skip (handles server restarts)
    const userBal = await provider.getBalance(address);
    if (userBal >= ethers.parseEther("0.004")) {
      funded.add(key);
      return res.status(200).json({ alreadyFunded: true });
    }

    // Ensure dispenser can cover the funding
    const dispenserBal = await provider.getBalance(dispenser.address);
    if (dispenserBal < ethers.parseEther("0.03")) {
      console.warn("[fund-wallet] Dispenser low:", ethers.formatEther(dispenserBal), "ETH");
      return res.status(503).json({ error: "Faucet temporarily empty. Please try later." });
    }

    // ── Step 1: Send ETH for gas ─────────────────────────────────────────────
    const ethTx = await dispenser.sendTransaction({
      to: address,
      value: ethers.parseEther("0.005"),
    });
    await ethTx.wait();

    // ── Step 2: Wrap ETH → ETHx on dispenser, then send ETHx to user ────────
    if (superTokenAddr) {
      const superToken = new ethers.Contract(superTokenAddr, SUPER_TOKEN_ABI, dispenser);

      // Wrap on dispenser wallet
      const wrapTx = await superToken.upgradeByETH({ value: ethers.parseEther("0.015") });
      await wrapTx.wait();

      // Transfer ETHx to user
      const transferTx = await superToken.transfer(address, ethers.parseEther("0.015"));
      await transferTx.wait();
    }

    funded.add(key);
    return res.status(200).json({ success: true, eth: "0.005", ethx: "0.015" });

  } catch (err) {
    console.error("[fund-wallet] Error:", err.message);
    return res.status(500).json({ error: "Funding failed. Please try again." });
  }
}
