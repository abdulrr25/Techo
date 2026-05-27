import { useState, useEffect } from "react";
import { useAccount, useDisconnect, useWalletClient } from "wagmi";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useToast } from "@chakra-ui/react";
import { BrowserProvider, Contract } from "ethers";
import TEACHO_ABI from "../constants/abi";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export const useWeb3 = () => {
  const { login, logout: privyLogout, user, ready, authenticated } = usePrivy();
  // useWallets() is the authoritative Privy v3 source for wallet addresses.
  // It updates as soon as the embedded wallet is created, before wagmi syncs.
  const { wallets } = useWallets();
  const { address: wagmiAddress, isConnected: wagmiConnected } = useAccount();
  // Use wagmi address if available (MetaMask), else first Privy wallet (embedded).
  const privyWalletAddress = wallets[0]?.address;
  const account = wagmiAddress ?? privyWalletAddress;
  const { disconnect: wagmiDisconnect } = useDisconnect();
  // isConnected: true if wagmi has a wallet OR if Privy has authenticated the user.
  // This prevents pages from showing "Connect wallet" when the user is logged in
  // but the wagmi bridge hasn't synced the embedded wallet yet.
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
  // Uses wallets[0] from useWallets() — more reliable than user?.wallet which can lag.
  // Phase 2: use this to branch into the ETHx funding flow for embedded users.
  const isEmbeddedWallet = wallets[0]?.walletClientType === "privy";

  useEffect(() => {
    const initContract = async () => {
      // walletClient being present means wagmi has a live wallet (MetaMask or
      // Privy embedded). That's the only gate we need — no need to check isConnected.
      if (!walletClient) {
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
  }, [walletClient, account]);

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
    isConnected:      mounted && (wagmiConnected || authenticated),
    // isConnecting reflects Privy not-yet-ready rather than wagmi pending state
    isConnecting:     mounted && !ready,
    contract,
    connect:          connectWallet,
    disconnect:       disconnectWallet,
    isEmbeddedWallet, // Phase 2 seam — see useStream.js TODO
  };
};
