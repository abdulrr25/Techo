import { useState, useEffect } from "react";
import { useAccount, useDisconnect, useWalletClient } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { useToast } from "@chakra-ui/react";
import { BrowserProvider, Contract } from "ethers";
import TEACHO_ABI from "../constants/abi";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export const useWeb3 = () => {
  const { login, logout: privyLogout, user, ready, authenticated } = usePrivy();
  const { address: account, isConnected } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  // useWalletClient works for BOTH MetaMask and Privy embedded wallets —
  // the @privy-io/wagmi WagmiProvider exposes whichever wallet is active.
  const { data: walletClient } = useWalletClient();
  const toast = useToast();
  const [contract, setContract] = useState(null);
  // Prevents SSR/client hydration mismatch — wallet state is only read after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Whether the active wallet is a Privy embedded wallet (created for email/google
  // users) vs an external wallet like MetaMask.
  // Phase 2: use this to branch into the ETHx funding flow for embedded users.
  const isEmbeddedWallet = user?.wallet?.walletClientType === "privy";

  useEffect(() => {
    const initContract = async () => {
      // Use wagmi walletClient instead of window.ethereum — this works for both
      // MetaMask (external) and Privy embedded wallets.
      if (!isConnected || !walletClient) {
        setContract(null);
        return;
      }
      try {
        const provider = new BrowserProvider(walletClient.transport);
        const signer = await provider.getSigner();
        const c = new Contract(CONTRACT_ADDRESS, TEACHO_ABI, signer);
        setContract(c);
      } catch (err) {
        console.error("Contract init failed:", err);
        setContract(null);
      }
    };
    initContract();
  }, [isConnected, account, walletClient]);

  const connectWallet = () => {
    // Opens Privy's auth modal — user picks MetaMask, email, or Google.
    login();
  };

  const disconnectWallet = () => {
    privyLogout();        // Clears Privy session
    wagmiDisconnect();    // Also clears wagmi connector state
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
    isConnected:      mounted && isConnected,
    // isConnecting reflects Privy not-yet-ready rather than wagmi pending state
    isConnecting:     mounted && !ready,
    contract,
    connect:          connectWallet,
    disconnect:       disconnectWallet,
    isEmbeddedWallet, // Phase 2 seam — see useStream.js TODO
  };
};
