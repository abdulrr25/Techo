import { useState, useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useToast } from "@chakra-ui/react";
import { BrowserProvider, Contract } from "ethers";
import TEACHO_ABI from "../constants/abi";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export const useWeb3 = () => {
  const { login, logout: privyLogout, ready, authenticated } = usePrivy();
  // useWallets() is the authoritative Privy v3 source — available immediately
  // after login, before wagmi bridge syncs.
  const { wallets } = useWallets();

  // Keep wagmi's useAccount for address fallback and legacy compat.
  // wagmiAddress may be undefined if bridge hasn't synced, which is fine —
  // we fall back to the Privy wallet address.
  const { address: wagmiAddress, isConnected: wagmiConnected } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();

  const privyWalletAddress = wallets[0]?.address;
  const account = wagmiAddress ?? privyWalletAddress;

  const toast = useToast();
  const [contract, setContract] = useState(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const isEmbeddedWallet = wallets[0]?.walletClientType === "privy";

  // ── Contract initialisation ────────────────────────────────────────────────
  // Uses Privy's direct EIP-1193 provider (wallet.getEthereumProvider()) instead
  // of wagmi's walletClient. This bypasses the wagmi bridge entirely so the
  // contract is ready as soon as the user logs in — no bridge timing issues.
  // Works for MetaMask (injected) AND Privy embedded wallets.
  useEffect(() => {
    const initContract = async () => {
      const wallet = wallets[0];
      if (!wallet) {
        setContract(null);
        return;
      }
      try {
        const ethProvider = await wallet.getEthereumProvider();
        const provider = new BrowserProvider(ethProvider);
        const signer = await provider.getSigner();
        const c = new Contract(CONTRACT_ADDRESS, TEACHO_ABI, signer);
        setContract(c);
      } catch (err) {
        console.error("Contract init failed:", err);
        setContract(null);
      }
    };
    initContract();
  }, [wallets[0]?.address]); // Re-run whenever the active wallet changes

  const connectWallet = () => { login(); };

  const disconnectWallet = async () => {
    try { await privyLogout(); } catch { /* ignore logout errors */ }
    wagmiDisconnect();
    setContract(null);
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  return {
    account:          mounted ? account : undefined,
    isConnected:      mounted && (wagmiConnected || authenticated),
    isConnecting:     mounted && !ready,
    contract,
    connect:          connectWallet,
    disconnect:       disconnectWallet,
    isEmbeddedWallet,
  };
};
