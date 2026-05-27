import { useState, useEffect } from "react";
import { useWallets } from "@privy-io/react-auth";
import { BrowserProvider, Contract, JsonRpcProvider, formatEther, parseEther } from "ethers";
import { useWeb3 } from "../hooks/useWeb3";
import Navbar from "../components/Navbar";
import {
  Box, Container, Flex, Heading, Text, SimpleGrid, useToast,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { SUPER_TOKEN_ABI } from "../constants/superfluidAbi";

const SUPER_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_SUPER_TOKEN_ADDRESS;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://sepolia.base.org";

const ease = [0.22, 1, 0.36, 1];
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

export default function WalletPage() {
  const { wallets } = useWallets();
  const { account, isConnected, connect } = useWeb3();
  const wallet    = wallets[0];
  const isEmbedded = wallet?.walletClientType === "privy";
  const toast = useToast();

  const [ethBalance,  setEthBalance]  = useState(null);
  const [ethxBalance, setEthxBalance] = useState(null);
  const [balLoading,  setBalLoading]  = useState(false);
  const [wrapAmount,  setWrapAmount]  = useState("0.005");
  const [wrapping,    setWrapping]    = useState(false);
  const [copied,      setCopied]      = useState(false);
  const [focused,     setFocused]     = useState(false);

  // ── Fetch balances ─────────────────────────────────────────────────────────
  const fetchBalances = async () => {
    if (!account) return;
    setBalLoading(true);
    try {
      const readProvider = new JsonRpcProvider(RPC_URL);
      const ethBal = await readProvider.getBalance(account);
      setEthBalance(ethBal);
      if (SUPER_TOKEN_ADDRESS) {
        const superToken = new Contract(SUPER_TOKEN_ADDRESS, SUPER_TOKEN_ABI, readProvider);
        setEthxBalance(await superToken.balanceOf(account));
      }
    } catch (err) {
      console.error("Balance fetch failed:", err);
    } finally {
      setBalLoading(false);
    }
  };

  useEffect(() => { if (account) fetchBalances(); }, [account]);

  // ── Wrap ETH → ETHx ────────────────────────────────────────────────────────
  const handleWrap = async () => {
    if (!wallet) return;
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
      toast({ title: "Converting…", description: "This takes about 10 seconds.", status: "info", duration: 10000, isClosable: true });
      await tx.wait();
      toast({ title: "Done!", description: `${amt} ETH converted to streaming credits.`, status: "success", duration: 5000, isClosable: true });
      fetchBalances();
    } catch (err) {
      toast({ title: "Conversion failed", description: err?.reason || err?.message, status: "error", duration: 6000, isClosable: true });
    } finally { setWrapping(false); }
  };

  const copyAddress = () => {
    if (!account) return;
    navigator.clipboard.writeText(account).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const ethFmt  = ethBalance  != null ? parseFloat(formatEther(ethBalance)).toFixed(5)  : null;
  const ethxFmt = ethxBalance != null ? parseFloat(formatEther(ethxBalance)).toFixed(5) : null;
  const hasEthx = ethxBalance != null && ethxBalance > 0n;

  // ── Not connected ──────────────────────────────────────────────────────────
  if (!isConnected) {
    return (
      <Box bg="#000000" minH="100vh" fontFamily="'Inter', sans-serif" pt="72px">
        <Navbar />
        <Container maxW="900px" px={{ base: 5, md: 8 }} py={12}>
          <Box textAlign="center" py={28}>
            <Text fontSize="40px" mb={6}>👛</Text>
            <Heading fontSize="24px" fontWeight="700" letterSpacing="-0.03em" color="#fafafa" mb={3}>
              Sign in to view your account
            </Heading>
            <Text color="#71717a" fontSize="15px" mb={8} maxW="400px" mx="auto" lineHeight="1.6">
              Sign in with Google or email to get started. No crypto knowledge needed.
            </Text>
            <button className="btn-primary" onClick={connect} style={{ height: 44, padding: "0 28px" }}>
              Sign In
            </button>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg="#000000" minH="100vh" fontFamily="'Inter', sans-serif" pt="72px">
      <Navbar />

      <Container maxW="860px" px={{ base: 5, md: 8 }} py={12}>
        <motion.div initial="hidden" animate="show" variants={stagger}>

          {/* Header */}
          <motion.div variants={fadeUp}>
            <Flex justify="space-between" align="center" mb={10} gap={4} flexWrap="wrap">
              <Box>
                <Heading fontSize={{ base: "28px", md: "36px" }} fontWeight="700"
                  letterSpacing="-0.04em" color="#fafafa" mb={1}>My Account</Heading>
                <Text color="#71717a" fontSize="14px">
                  Balances and payment settings · Demo mode (free)
                </Text>
              </Box>
              <button className="btn-outline-pill" onClick={fetchBalances}
                disabled={balLoading} style={{ opacity: balLoading ? 0.5 : 1 }}>
                {balLoading ? "Refreshing…" : "Refresh"}
              </button>
            </Flex>
          </motion.div>

          {/* Demo mode banner — shown to embedded wallet users */}
          {isEmbedded && (
            <motion.div variants={fadeUp}>
              <Box mb={6} px={5} py={4} borderRadius="12px"
                bg="rgba(0,117,255,0.06)" border="1px solid rgba(0,117,255,0.15)">
                <Flex align="flex-start" gap={3}>
                  <Text fontSize="18px" flexShrink={0}>🎓</Text>
                  <Box>
                    <Text fontWeight="600" fontSize="14px" color="#60a5fa" mb={1}>
                      Demo mode — no real money involved
                    </Text>
                    <Text fontSize="13px" color="#71717a" lineHeight="1.6">
                      Your account runs on a test network. When you signed in, we automatically loaded
                      your account with test credits so you can join classes right away.
                      Nothing costs real money — this is purely for demo purposes.
                    </Text>
                  </Box>
                </Flex>
              </Box>
            </motion.div>
          )}

          {/* Balances */}
          <SimpleGrid columns={{ base: 1, sm: 2 }} gap={5} mb={6}>
            <motion.div variants={fadeUp}>
              <Box className="card" p={6}>
                <Text fontSize="12px" color="#52525b" mb={2} letterSpacing="0.04em" textTransform="uppercase">
                  Gas Balance
                </Text>
                <Text fontSize="26px" fontWeight="700" letterSpacing="-0.04em"
                  color="#fafafa" fontFamily="'JetBrains Mono', monospace" mb={1}>
                  {balLoading ? "…" : (ethFmt != null ? `${ethFmt} ETH` : "—")}
                </Text>
                <Text fontSize="12px" color="#52525b">Used to process transactions</Text>
              </Box>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Box className="card" p={6}>
                <Text fontSize="12px" color="#52525b" mb={2} letterSpacing="0.04em" textTransform="uppercase">
                  Streaming Credits (ETHx)
                </Text>
                <Text fontSize="26px" fontWeight="700" letterSpacing="-0.04em"
                  color={hasEthx ? "#22c55e" : "#f87171"}
                  fontFamily="'JetBrains Mono', monospace" mb={1}>
                  {balLoading ? "…" : (ethxFmt != null ? ethxFmt : "—")}
                </Text>
                <Text fontSize="12px" color="#52525b">
                  {hasEthx ? "Ready to join classes ✓" : "Convert ETH below to get credits"}
                </Text>
              </Box>
            </motion.div>
          </SimpleGrid>

          {/* Wallet address */}
          <motion.div variants={fadeUp}>
            <Box className="card" overflow="hidden" mb={6}>
              <Box h="1px" bg="linear-gradient(to right, rgba(0,117,255,0.5), transparent)" />
              <Box p={6}>
                <Text fontSize="13px" fontWeight="500" color="#a1a1aa" mb={3}>
                  Your account address
                </Text>
                <Flex align="center" gap={3} flexWrap="wrap">
                  <Text fontSize={{ base: "12px", md: "13px" }}
                    fontFamily="'JetBrains Mono', monospace"
                    color="#71717a" flex={1} wordBreak="break-all">
                    {account}
                  </Text>
                  <button className="btn-outline-pill" onClick={copyAddress}
                    style={{ height: 32, padding: "0 14px", fontSize: 13, flexShrink: 0 }}>
                    {copied ? "✓ Copied" : "Copy"}
                  </button>
                </Flex>
                <Text fontSize="12px" color="#3f3f46" mt={3}>
                  This is your unique identifier on the test network. You don&apos;t need to share it with anyone.
                </Text>
              </Box>
            </Box>
          </motion.div>

          {/* Convert ETH → ETHx (shown only if user has ETH but might need ETHx) */}
          <motion.div variants={fadeUp}>
            <Box className="card" overflow="hidden" mb={6}>
              <Box h="1px" bg="linear-gradient(to right, rgba(0,117,255,0.4), rgba(56,189,248,0.2), transparent)" />
              <Box p={6}>
                <Heading fontSize="15px" fontWeight="600" color="#fafafa" mb={2} letterSpacing="-0.02em">
                  Convert to Streaming Credits
                </Heading>
                <Text fontSize="13px" color="#71717a" mb={5} lineHeight="1.6">
                  Streaming credits (ETHx) are what flow from your account to the teacher
                  per second while you&apos;re in a class. If your credits run low, convert
                  more ETH here before joining.
                </Text>

                <Flex gap={0} mb={3}>
                  <input
                    type="number"
                    value={wrapAmount}
                    onChange={e => setWrapAmount(e.target.value)}
                    min={0} step={0.001}
                    style={{
                      width: "100%",
                      background: "#0a0a0a",
                      border: `1px solid ${focused ? "rgba(0,117,255,0.7)" : "rgba(255,255,255,0.08)"}`,
                      boxShadow: focused ? "0 0 0 1px rgba(0,117,255,0.3)" : "none",
                      borderRadius: "12px 0 0 12px",
                      color: "#fafafa",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 14,
                      padding: "11px 14px",
                      outline: "none",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder="0.005"
                  />
                  <Box px={4} display="flex" alignItems="center"
                    bg="#0a0a0a" border="1px solid rgba(255,255,255,0.08)"
                    borderLeft="none" borderRadius="0 12px 12px 0"
                    fontSize="13px" fontWeight="600" color="#71717a" whiteSpace="nowrap">
                    ETH
                  </Box>
                </Flex>

                <button className="btn-primary" onClick={handleWrap}
                  disabled={wrapping || !wallet}
                  style={{
                    height: 44, width: "100%", fontSize: 14,
                    opacity: (wrapping || !wallet) ? 0.5 : 1,
                    cursor: (wrapping || !wallet) ? "not-allowed" : "pointer",
                  }}>
                  {wrapping ? "Converting…" : "Convert to Streaming Credits"}
                </button>
              </Box>
            </Box>
          </motion.div>

          {/* For MetaMask users: show faucet links */}
          {!isEmbedded && (
            <motion.div variants={fadeUp}>
              <Box className="card" p={6}>
                <Heading fontSize="15px" fontWeight="600" color="#fafafa" mb={3} letterSpacing="-0.02em">
                  🚰 Need test ETH?
                </Heading>
                <Text fontSize="13px" color="#71717a" mb={5} lineHeight="1.6">
                  This app runs on Base Sepolia testnet (free). Copy your address above
                  and get free test ETH from one of these sources:
                </Text>
                <Flex gap={3} wrap="wrap">
                  {[
                    ["Alchemy Faucet", "https://www.alchemy.com/faucets/base-sepolia"],
                    ["QuickNode Faucet", "https://faucet.quicknode.com/base/sepolia"],
                    ["Superfluid App",   "https://app.superfluid.finance"],
                  ].map(([label, href]) => (
                    <a key={href} href={href} target="_blank" rel="noreferrer"
                      className="btn-outline-pill"
                      style={{ height: 36, padding: "0 16px", fontSize: 13, textDecoration: "none" }}>
                      {label} ↗
                    </a>
                  ))}
                </Flex>
              </Box>
            </motion.div>
          )}

        </motion.div>
      </Container>
    </Box>
  );
}
