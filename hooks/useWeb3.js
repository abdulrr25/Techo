import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { useToast } from "@chakra-ui/react";
import { BrowserProvider, Contract } from "ethers";
import TEACHO_ABI from "../constants/abi";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export const useWeb3 = () => {
  const { address: account, isConnected } = useAccount();
  const { connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const toast = useToast();
  const [contract, setContract] = useState(null);
  // Prevents SSR/client hydration mismatch — wallet state is only read after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const initContract = async () => {
      if (!isConnected || typeof window === "undefined" || !window.ethereum) {
        setContract(null);
        return;
      }
      try {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const c = new Contract(CONTRACT_ADDRESS, TEACHO_ABI, signer);
        setContract(c);
      } catch (err) {
        console.error("Contract init failed:", err);
        setContract(null);
      }
    };
    initContract();
  }, [isConnected, account]);

  const connectWallet = async () => {
    try {
      await connect({ connector: injected() });
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast({
        title: "Connection Failed",
        description: error?.message || "Failed to connect wallet. Make sure MetaMask is installed.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const disconnectWallet = () => {
    disconnect();
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
    account: mounted ? account : undefined,
    isConnected: mounted && isConnected,
    isConnecting: mounted && isConnecting,
    contract,
    connect: connectWallet,
    disconnect: disconnectWallet,
  };
};
