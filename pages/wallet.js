import { useState, useEffect } from "react";
import { useWallets } from "@privy-io/react-auth";
import { BrowserProvider, Contract, JsonRpcProvider, formatEther, parseEther } from "ethers";
import { useWeb3 } from "../hooks/useWeb3";
import Navbar from "../components/Navbar";
import {
  Box, Container, Flex, Heading, Text, SimpleGrid, useToast, HStack,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { SUPER_TOKEN_ABI } from "../constants/superfluidAbi";

const SUPER_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_SUPER_TOKEN_ADDRESS;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.base.org";

const ease = [0.22, 1, 0.36, 1];
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } };
const stagger = { show: { transition: { staggerChildren: 0.07 } } };

const inputStyle = {
  width: "100%",
  background: "#0a0a0a",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
  color: "#fafafa",
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 14,
  padding: "11px 14px",
  outline: "none",
  transition: "border-color 0.2s",
};

function StatCard({ label, value, sub, accent }) {
  return (
    <motion.div variants={fadeUp}>
      <Box className="card" p={6}>
        <Text fontSize="12px" color="#52525b" mb={2} letterSpacing="0.04em" textTransform="uppercase">
          {label}
        </Text>
        <Text
          fontSize="26px" fontWeight="700" letterSpacing="-0.04em"
          color={accent || "#fafafa"} fontFamily="'JetBrains Mono', monospace" mb={1}
        >
          {value ?? "—"}
        </Text>
        {sub && <Text fontSize="12px" color="#52525b">{sub}</Text>}
      </Box>
    </motion.div>
  );
}

export default function WalletPage() {
  const { wallets } = useWallets();
  const { account, isConnected, connect } = useWeb3();
  const wallet = wallets[0];
  const toast = useToast();

  const [ethBalance, setEthBalance]   = useState(null);
  const [ethxBalance, setEthxBalance] = useState(null);
  const [balLoading, setBalLoading]   = useState(false);
  const [wrapAmount, setWrapAmount]   = useState("0.01");
  const [wrapping, setWrapping]       = useState(false);
  const [copied, setCopied]           = useState(false);
  const [focused, setFocused]         = useState(false);

  // ── Fetch balances ─────────────────────────────────────────────────────────
  const fetchBalances = async () => {
    if (!account) return;
    setBalLoading(true);
    try {
      // Use a plain JSON-RPC provider for read calls — no wallet needed
      const readProvider = new JsonRpcProvider(RPC_URL);
      const ethBal  = await readProvider.getBalance(account);
      setEthBalance(ethBal);

      if (SUPER_TOKEN_ADDRESS) {
        const superToken = new Contract(SUPER_TOKEN_ADDRESS, SUPER_TOKEN_ABI, readProvider);
        const ethxBal = await superToken.balanceOf(account);
        setEthxBalance(ethxBal);
      }
    } catch (err) {
      console.error("Balance fetch failed:", err);
    } finally {
      setBalLoading(false);
    }
  };

  useEffect(() => {
    if (account) fetchBalances();
  }, [account]);

  // ── Wrap ETH → ETHx ────────────────────────────────────────────────────────
  const handleWrap = async () => {
    if (!wallet) { toast({ title: "No wallet", status: "error", duration: 4000 }); return; }
    const amt = parseFloat(wrapAmount);
    if (isNaN(amt) || amt <= 0) {
      toast({ title: "Enter a valid amount", status: "warning", duration: 4000 }); return;
    }
    setWrapping(true);
    try {
      const ethProvider = await wallet.getEthereumProvider();
      const provider    = new BrowserProvider(ethProvider);
      const signer      = await provider.getSigner();
      const superToken  = new Contract(SUPER_TOKEN_ADDRESS, SUPER_TOKEN_ABI, signer);
      const tx = await superToken.upgradeByETH({ value: parseEther(String(amt)) });
      toast({ title: "Wrapping ETH…", description: "Confirm in your wallet and wait for confirmation.", status: "info", duration: 10000, isClosable: true });
      await tx.wait();
      toast({ title: "Wrap successful!", description: `${amt} ETH → ETHx`, status: "success", duration: 6000, isClosable: true });
      fetchBalances();
    } catch (err) {
      toast({ title: "Wrap failed", description: err?.reason || err?.message, status: "error", duration: 6000, isClosable: true });
    } finally {
      setWrapping(false); }
  };

  // ── Copy address ───────────────────────────────────────────────────────────
  const copyAddress = () => {
    if (!account) return;
    navigator.clipboard.writeText(account).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const ethFmt  = ethBalance  != null ? parseFloat(formatEther(ethBalance)).toFixed(6)  : null;
  const ethxFmt = ethxBalance != null ? parseFloat(formatEther(ethxBalance)).toFixed(6) : null;
  const hasEth  = ethBalance  != null && ethBalance  > 0n;
  const hasEthx = ethxBalance != null && ethxBalance > 0n;

  // ── Not connected ──────────────────────────────────────────────────────────
  if (!isConnected) {
    return (
      <Box bg="#000000" minH="100vh" fontFamily="'Inter', sans-serif" pt="72px">
        <Navbar />
        <Container maxW="1280px" px={{ base: 5, md: 8 }} py={12}>
          <Box textAlign="center" py={28}>
            <Text fontSize="40px" mb={6}>👛</Text>
            <Heading fontSize="24px" fontWeight="700" letterSpacing="-0.03em" color="#fafafa" mb={3}>
              Connect your wallet
            </Heading>
            <Text color="#71717a" fontSize="15px" mb={8} maxW="400px" mx="auto" lineHeight="1.6">
              Connect to view your wallet address, balances, and fund your account.
            </Text>
            <button className="btn-primary" onClick={connect} style={{ height: 44, padding: "0 28px" }}>
              Connect Wallet
            </button>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg="#000000" minH="100vh" fontFamily="'Inter', sans-serif" pt="72px">
      <Navbar />

      <Container maxW="900px" px={{ base: 5, md: 8 }} py={12}>
        <motion.div initial="hidden" animate="show" variants={stagger}>

          {/* Header */}
          <motion.div variants={fadeUp}>
            <Flex justify="space-between" align="center" mb={10} gap={4} flexWrap="wrap">
              <Box>
                <Heading fontSize={{ base: "28px", md: "36px" }} fontWeight="700"
                  letterSpacing="-0.04em" color="#fafafa" mb={1}>Wallet</Heading>
                <Text color="#71717a" fontSize="14px">
                  {wallet?.walletClientType === "privy" ? "Privy embedded wallet" : "Connected wallet"} · Base Sepolia
                </Text>
              </Box>
              <button className="btn-outline-pill" onClick={fetchBalances}
                disabled={balLoading} style={{ opacity: balLoading ? 0.5 : 1 }}>
                {balLoading ? "Refreshing…" : "Refresh"}
              </button>
            </Flex>
          </motion.div>

          {/* Address card */}
          <motion.div variants={fadeUp}>
            <Box className="card" overflow="hidden" mb={5}>
              <Box h="1px" bg="linear-gradient(to right, rgba(0,117,255,0.6), transparent)" />
              <Box p={6}>
                <Text fontSize="12px" color="#52525b" mb={3} letterSpacing="0.04em" textTransform="uppercase">
                  Wallet Address
                </Text>
                <Flex align="center" gap={3} flexWrap="wrap">
                  <Text
                    fontSize={{ base: "13px", md: "15px" }}
                    fontFamily="'JetBrains Mono', monospace"
                    color="#fafafa"
                    flex={1}
                    wordBreak="break-all"
                  >
                    {account}
                  </Text>
                  <button
                    className="btn-outline-pill"
                    onClick={copyAddress}
                    style={{ height: 32, padding: "0 14px", fontSize: 13, flexShrink: 0 }}
                  >
                    {copied ? "✓ Copied" : "Copy"}
                  </button>
                </Flex>

                {wallet?.walletClientType === "privy" && (
                  <Box mt={4} px={4} py={3} borderRadius="10px" bg="rgba(234,179,8,0.05)" border="1px solid rgba(234,179,8,0.12)">
                    <Text fontSize="13px" color="#fbbf24" lineHeight="1.6">
                      ⚠️ This is a Privy embedded wallet. Save your address above.
                      To fund it, copy the address and use a{" "}
                      <a href="https://www.alchemy.com/faucets/base-sepolia" target="_blank" rel="noreferrer"
                        style={{ color: "#60a5fa", textDecoration: "underline" }}>
                        Base Sepolia faucet
                      </a>
                      {" "}to send testnet ETH.
                    </Text>
                  </Box>
                )}
              </Box>
            </Box>
          </motion.div>

          {/* Balances */}
          <SimpleGrid columns={{ base: 1, sm: 2 }} gap={5} mb={5}>
            <StatCard
              label="ETH Balance"
              value={balLoading ? "…" : (ethFmt != null ? `${ethFmt} ETH` : "—")}
              sub="Available for wrapping and gas"
              accent={hasEth ? "#fafafa" : "#52525b"}
            />
            <StatCard
              label="ETHx Balance"
              value={balLoading ? "…" : (ethxFmt != null ? `${ethxFmt} ETHx` : "—")}
              sub="Required to stream payments in class"
              accent={hasEthx ? "#22c55e" : "#f87171"}
            />
          </SimpleGrid>

          {/* Wrap card */}
          <motion.div variants={fadeUp}>
            <Box className="card" overflow="hidden" mb={5}>
              <Box h="1px" bg="linear-gradient(to right, rgba(0,117,255,0.5), rgba(56,189,248,0.3), transparent)" />
              <Box p={6}>
                <Heading fontSize="16px" fontWeight="600" color="#fafafa" mb={1} letterSpacing="-0.02em">
                  Wrap ETH → ETHx
                </Heading>
                <Text fontSize="13px" color="#71717a" mb={5} lineHeight="1.6">
                  ETHx is Super ETH — required to stream micro-payments per second during a class.
                  Wrap some ETH to get ETHx before joining a class.
                </Text>

                <Flex gap={0} mb={3}>
                  <input
                    type="number"
                    value={wrapAmount}
                    onChange={e => setWrapAmount(e.target.value)}
                    min={0} step={0.001}
                    style={{
                      ...inputStyle,
                      borderRadius: "12px 0 0 12px",
                      borderColor: focused ? "rgba(0,117,255,0.7)" : "rgba(255,255,255,0.08)",
                      boxShadow: focused ? "0 0 0 1px rgba(0,117,255,0.3)" : "none",
                    }}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder="0.01"
                  />
                  <Box
                    px={4} display="flex" alignItems="center"
                    bg="#0a0a0a" border="1px solid rgba(255,255,255,0.08)"
                    borderLeft="none" borderRadius="0 12px 12px 0"
                    fontSize="13px" fontWeight="600" color="#71717a" whiteSpace="nowrap"
                  >
                    ETH
                  </Box>
                </Flex>

                {wrapAmount && parseFloat(wrapAmount) > 0 && (
                  <Text fontSize="12px" color="#52525b" mb={4}>
                    You will receive ≈ {parseFloat(wrapAmount).toFixed(6)} ETHx
                  </Text>
                )}

                <button
                  className="btn-primary"
                  onClick={handleWrap}
                  disabled={wrapping || !wallet}
                  style={{
                    height: 44, width: "100%", fontSize: 15,
                    opacity: (wrapping || !wallet) ? 0.5 : 1,
                    cursor: (wrapping || !wallet) ? "not-allowed" : "pointer",
                  }}
                >
                  {wrapping ? "Wrapping…" : "Wrap ETH → ETHx"}
                </button>
              </Box>
            </Box>
          </motion.div>

          {/* Faucet card */}
          <motion.div variants={fadeUp}>
            <Box className="card" p={6}>
              <Heading fontSize="15px" fontWeight="600" color="#fafafa" mb={3} letterSpacing="-0.02em">
                🚰 Get Testnet ETH
              </Heading>
              <Text fontSize="13px" color="#71717a" mb={5} lineHeight="1.6">
                This app runs on Base Sepolia testnet. You need testnet ETH to pay for classes and gas.
                Copy your wallet address above and use one of the faucets below.
              </Text>
              <Flex gap={3} wrap="wrap">
                {[
                  ["Alchemy Faucet", "https://www.alchemy.com/faucets/base-sepolia"],
                  ["QuickNode Faucet", "https://faucet.quicknode.com/base/sepolia"],
                  ["Superfluid Dashboard", "https://app.superfluid.finance"],
                ].map(([label, href]) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-outline-pill"
                    style={{ height: 36, padding: "0 16px", fontSize: 13, textDecoration: "none" }}
                  >
                    {label} ↗
                  </a>
                ))}
              </Flex>
            </Box>
          </motion.div>

        </motion.div>
      </Container>
    </Box>
  );
}
