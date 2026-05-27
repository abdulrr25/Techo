import { useState, useEffect, useRef, Fragment } from "react";
import { useWallets, useFundWallet } from "@privy-io/react-auth";
import { baseSepolia } from "wagmi/chains";
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

// Payment method display data
const PAYMENT_METHODS = [
  { icon: "💳", label: "Card" },
  { icon: "🏦", label: "Bank" },
  { icon: "📱", label: "UPI" },
  { icon: "G",  label: "Google Pay", mono: true },
  { icon: "🍎", label: "Apple Pay" },
];

const ADD_MONEY_STEPS = [
  { step: "1", text: "Choose amount" },
  { step: "2", text: "Pay with card / UPI" },
  { step: "3", text: "Join any class instantly" },
];

export default function WalletPage() {
  const { wallets } = useWallets();
  const { account, isConnected, connect } = useWeb3();
  const wallet     = wallets[0];
  const isEmbedded = wallet?.walletClientType === "privy";
  const toast      = useToast();

  // Balance
  const [ethBalance,  setEthBalance]  = useState(null);
  const [ethxBalance, setEthxBalance] = useState(null);
  const [balLoading,  setBalLoading]  = useState(false);

  // Wrap
  const [wrapAmount, setWrapAmount] = useState("0.005");
  const [wrapping,   setWrapping]   = useState(false);
  const [focused,    setFocused]    = useState(false);

  // UI state
  const [copied,      setCopied]      = useState(false);
  const [addingFunds, setAddingFunds] = useState(false);

  // Ref for auto-scroll to convert section after funding
  const convertRef = useRef(null);

  // ── Privy fund-wallet hook ─────────────────────────────────────────────────
  // Opens a modal letting the user pay with card / Google Pay / Apple Pay / bank.
  // Powered by Privy's on-ramp providers (MoonPay & Coinbase Pay). Card on-ramp is
  // a mainnet feature — on Base Sepolia the modal offers external-wallet transfer.
  const { fundWallet } = useFundWallet();

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

  // ── Add money via Privy on-ramp ────────────────────────────────────────────
  // v3 API: fundWallet({ address, options }) and resolves with a FundingResult
  // ({ status: "completed" | "cancelled", ... }) — it resolves (not rejects) when
  // the user closes the modal, so we branch on result.status.
  const handleAddMoney = async () => {
    if (!account) return;
    setAddingFunds(true);
    try {
      const result = await fundWallet({
        address: account,
        options: {
          chain: baseSepolia,           // switch to `base` when going to mainnet
          // asset: "native-currency",  // ETH (default)
        },
      });
      fetchBalances();
      if (result?.status === "completed") {
        toast({
          title: "Money added! 🎉",
          description: "Now convert it to streaming credits so you can join classes.",
          status: "success",
          duration: 8000,
          isClosable: true,
        });
        // Auto-scroll to the convert section to guide the next step
        setTimeout(() => {
          convertRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 600);
      }
    } catch (err) {
      console.log("Fund wallet error:", err?.message);
    } finally {
      setAddingFunds(false);
    }
  };

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
      toast({ title: "Done! ✓", description: `${amt} ETH converted to streaming credits. You can now join classes.`, status: "success", duration: 6000, isClosable: true });
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
  const hasEth  = ethBalance  != null && ethBalance  > 0n;

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

          {/* ── Header ── */}
          <motion.div variants={fadeUp}>
            <Flex justify="space-between" align="center" mb={10} gap={4} flexWrap="wrap">
              <Box>
                <Heading fontSize={{ base: "28px", md: "36px" }} fontWeight="700"
                  letterSpacing="-0.04em" color="#fafafa" mb={1}>My Account</Heading>
                <Text color="#71717a" fontSize="14px">
                  Balances · Payments · Streaming Credits
                </Text>
              </Box>
              <button className="btn-outline-pill" onClick={fetchBalances}
                disabled={balLoading} style={{ opacity: balLoading ? 0.5 : 1 }}>
                {balLoading ? "Refreshing…" : "Refresh"}
              </button>
            </Flex>
          </motion.div>

          {/* ── Demo mode banner ── */}
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
                      Your account runs on a test network and was automatically pre-loaded with
                      credits when you signed in. Nothing costs real money right now.
                      The &ldquo;Add Money&rdquo; button below shows you what the real payment
                      experience looks like — cards, UPI, Google Pay, and more.
                    </Text>
                  </Box>
                </Flex>
              </Box>
            </motion.div>
          )}

          {/* ── Balance cards ── */}
          <SimpleGrid columns={{ base: 1, sm: 2 }} gap={5} mb={6}>
            <motion.div variants={fadeUp}>
              <Box className="card" p={6} h="full">
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
              <Box className="card" p={6} h="full">
                <Text fontSize="12px" color="#52525b" mb={2} letterSpacing="0.04em" textTransform="uppercase">
                  Streaming Credits
                </Text>
                <Text fontSize="26px" fontWeight="700" letterSpacing="-0.04em"
                  color={hasEthx ? "#22c55e" : "#f87171"}
                  fontFamily="'JetBrains Mono', monospace" mb={1}>
                  {balLoading ? "…" : (ethxFmt != null ? ethxFmt : "—")}
                </Text>
                <Text fontSize="12px" color="#52525b">
                  {hasEthx ? "Ready to join classes ✓" : "Add money below to get credits"}
                </Text>
              </Box>
            </motion.div>
          </SimpleGrid>

          {/* ── Add Money ── */}
          <motion.div variants={fadeUp}>
            <Box className="card" overflow="hidden" mb={6}>
              {/* Accent line — green/blue gradient for "money in" */}
              <Box h="1px" bg="linear-gradient(to right, rgba(34,197,94,0.6), rgba(0,117,255,0.3), transparent)" />
              <Box p={6}>
                <Flex justify="space-between" align="flex-start" mb={1} gap={3} flexWrap="wrap">
                  <Heading fontSize="15px" fontWeight="600" color="#fafafa" letterSpacing="-0.02em">
                    Add Money
                  </Heading>
                  {isEmbedded && (
                    <Flex align="center" gap={1.5} px={3} py={1} borderRadius="9999px"
                      bg="rgba(34,197,94,0.1)" border="1px solid rgba(34,197,94,0.2)" flexShrink={0}>
                      <Box w="5px" h="5px" bg="#22c55e" borderRadius="full" />
                      <Text fontSize="11px" color="#22c55e" fontWeight="600">Auto-funded</Text>
                    </Flex>
                  )}
                </Flex>

                <Text fontSize="13px" color="#71717a" mb={5} lineHeight="1.6">
                  {isEmbedded
                    ? "Your demo account is pre-loaded. In production, users top up with any payment method below — no crypto knowledge needed."
                    : "Top up instantly. Money is deposited into your account and ready to use for classes within seconds."}
                </Text>

                {/* Payment method badges */}
                <Flex gap={2} mb={5} flexWrap="wrap">
                  {PAYMENT_METHODS.map(({ icon, label, mono }) => (
                    <Flex key={label} align="center" gap={2} px={3} py={1.5}
                      borderRadius="9999px"
                      bg="#0a0a0a" border="1px solid rgba(255,255,255,0.08)"
                      userSelect="none">
                      <Text
                        fontSize={mono ? "12px" : "13px"}
                        fontWeight={mono ? "800" : "400"}
                        fontFamily={mono ? "'Inter', sans-serif" : "inherit"}
                        color={mono ? "#fafafa" : "inherit"}
                        lineHeight="1"
                      >
                        {icon}
                      </Text>
                      <Text fontSize="12px" color="#71717a" fontWeight="500" lineHeight="1">{label}</Text>
                    </Flex>
                  ))}
                </Flex>

                {/* How it works — 3-step mini flow */}
                <Flex gap={0} mb={5} align="center"
                  px={4} py={3} borderRadius="10px"
                  bg="#050505" border="1px solid rgba(255,255,255,0.06)">
                  {ADD_MONEY_STEPS.map(({ step, text }, i) => (
                    <Fragment key={step}>
                      <Flex direction="column" align="center" gap={1} flex={1} minW={0}>
                        <Box w="20px" h="20px" borderRadius="full"
                          bg="rgba(0,117,255,0.15)" border="1px solid rgba(0,117,255,0.3)"
                          display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
                          <Text fontSize="10px" fontWeight="700" color="#60a5fa">{step}</Text>
                        </Box>
                        <Text fontSize="11px" color="#52525b" textAlign="center" lineHeight="1.3">{text}</Text>
                      </Flex>
                      {i < ADD_MONEY_STEPS.length - 1 && (
                        <Box flex="0 0 16px" textAlign="center">
                          <Text fontSize="11px" color="#3f3f46">→</Text>
                        </Box>
                      )}
                    </Fragment>
                  ))}
                </Flex>

                {/* CTA */}
                <button
                  className="btn-primary"
                  onClick={handleAddMoney}
                  disabled={addingFunds || !account}
                  style={{
                    height: 48, width: "100%", fontSize: 15, fontWeight: 600,
                    opacity: (!account || addingFunds) ? 0.5 : 1,
                    cursor: (!account || addingFunds) ? "not-allowed" : "pointer",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {addingFunds ? "Opening payment portal…" : "Add Money →"}
                </button>

                <Text fontSize="11px" color="#3f3f46" mt={3} textAlign="center">
                  Secured by Privy · Card payments via MoonPay &amp; Coinbase · No wallet knowledge needed
                </Text>
              </Box>
            </Box>
          </motion.div>

          {/* ── Wallet address ── */}
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
                  This is your unique account ID. Keep it private — you don&apos;t need to share it with anyone.
                </Text>
              </Box>
            </Box>
          </motion.div>

          {/* ── Convert ETH → ETHx ── */}
          <motion.div variants={fadeUp}>
            <Box ref={convertRef} className="card" overflow="hidden" mb={6}
              outline={hasEth && !hasEthx ? "1px solid rgba(0,117,255,0.4)" : "none"}
              transition="outline 0.3s">
              <Box h="1px" bg="linear-gradient(to right, rgba(0,117,255,0.4), rgba(56,189,248,0.2), transparent)" />
              <Box p={6}>
                <Flex justify="space-between" align="center" mb={2} flexWrap="wrap" gap={2}>
                  <Heading fontSize="15px" fontWeight="600" color="#fafafa" letterSpacing="-0.02em">
                    Convert to Streaming Credits
                  </Heading>
                  {hasEth && !hasEthx && (
                    <Flex align="center" gap={1.5} px={3} py={1} borderRadius="9999px"
                      bg="rgba(251,191,36,0.1)" border="1px solid rgba(251,191,36,0.25)" flexShrink={0}>
                      <Text fontSize="11px" color="#fbbf24" fontWeight="600">⚡ Action needed</Text>
                    </Flex>
                  )}
                </Flex>
                <Text fontSize="13px" color="#71717a" mb={5} lineHeight="1.6">
                  Streaming credits flow from your account to the teacher in real-time while
                  you&apos;re in a class — per second, not a lump sum. Add the amount you want
                  to convert below.
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

                {/* Quick amount chips */}
                <Flex gap={2} mb={4} flexWrap="wrap">
                  {["0.005", "0.01", "0.02", "0.05"].map(v => (
                    <button key={v} onClick={() => setWrapAmount(v)}
                      className="btn-outline-pill"
                      style={{
                        height: 28, padding: "0 12px", fontSize: 12,
                        background: wrapAmount === v ? "rgba(0,117,255,0.12)" : undefined,
                        borderColor: wrapAmount === v ? "rgba(0,117,255,0.5)" : undefined,
                        color: wrapAmount === v ? "#60a5fa" : undefined,
                      }}>
                      {v} ETH
                    </button>
                  ))}
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

          {/* ── Faucet links for MetaMask users only ── */}
          {!isEmbedded && (
            <motion.div variants={fadeUp}>
              <Box className="card" p={6}>
                <Heading fontSize="15px" fontWeight="600" color="#fafafa" mb={3} letterSpacing="-0.02em">
                  🚰 Need free test ETH?
                </Heading>
                <Text fontSize="13px" color="#71717a" mb={5} lineHeight="1.6">
                  This app runs on Base Sepolia testnet. Copy your address above and
                  get free test ETH instantly from these sources:
                </Text>
                <Flex gap={3} wrap="wrap">
                  {[
                    ["Alchemy Faucet",   "https://www.alchemy.com/faucets/base-sepolia"],
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
