import { useState, useEffect } from "react";
import { formatEther } from "ethers";
import { useRouter } from "next/router";
import { useWeb3 } from "../hooks/useWeb3";
import Navbar from "../components/Navbar";
import { Box, Container, Flex, Grid, Heading, Text, useToast, Stack } from "@chakra-ui/react";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1];
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } };
const stagger = { show: { transition: { staggerChildren: 0.07 } } };

function GigCard({ gig, onBuy, isBuying }) {
  const advance  = gig.stringFlowRate ? (BigInt(gig.stringFlowRate.toString()) * 10n) / 100n : 0n;
  const totalEth = gig.stringFlowRate  ? parseFloat(formatEther(gig.stringFlowRate.toString())).toFixed(6)  : "0";
  const advEth   = advance > 0n        ? parseFloat(formatEther(advance.toString())).toFixed(6)             : "0";
  const short    = gig.host ? `${gig.host.slice(0, 6)}…${gig.host.slice(-4)}` : "Unknown";
  const full     = Number(gig.attendees) >= 10;

  return (
    <motion.div variants={fadeUp}>
      <Box className="card card-hover" display="flex" flexDirection="column" h="full">
        {/* Top accent line */}
        <Box h="1px" bg="linear-gradient(to right, rgba(0,117,255,0.6), transparent)" />

        <Box p={6} flex="1" display="flex" flexDirection="column">
          {/* Title + seats */}
          <Flex justify="space-between" align="flex-start" mb={3}>
            <Heading fontSize="15px" fontWeight="600" color="#fafafa"
              letterSpacing="-0.02em" lineHeight="1.4" noOfLines={2} flex={1} mr={3}>
              {gig.title}
            </Heading>
            <Box className="chip" flexShrink={0} style={{ color: full ? "#f87171" : "#a1a1aa" }}>
              {Number(gig.attendees)}/10
            </Box>
          </Flex>

          {/* Description */}
          <Text color="#71717a" fontSize="13px" lineHeight="1.6" noOfLines={3} mb={5} flex="1">
            {gig.description}
          </Text>

          {/* Host */}
          <Flex align="center" gap={2} mb={3}>
            <Box w="18px" h="18px" borderRadius="full" bg="rgba(255,255,255,0.07)"
              border="1px solid rgba(255,255,255,0.08)" display="flex" alignItems="center"
              justifyContent="center" fontSize="9px" color="#a1a1aa" fontWeight="600" flexShrink={0}>
              {gig.host ? gig.host.slice(2, 4).toUpperCase() : "??"}
            </Box>
            <Text fontSize="12px" fontFamily="'JetBrains Mono', monospace" color="#52525b">{short}</Text>
          </Flex>

          {gig.time && (
            <Text fontSize="12px" color="#52525b" mb={4}>🗓 {gig.time}</Text>
          )}

          {/* Divider */}
          <Box className="divider-soft" mb={4} />

          {/* Pricing */}
          <Box mb={5}>
            <Flex justify="space-between" mb={1.5}>
              <Text fontSize="12px" color="#52525b">Total rate</Text>
              <Text fontSize="12px" fontFamily="'JetBrains Mono', monospace" color="#a1a1aa">{totalEth} ETH/hr</Text>
            </Flex>
            <Flex justify="space-between">
              <Text fontSize="12px" color="#52525b">Pay now (10%)</Text>
              <Text fontSize="12px" fontFamily="'JetBrains Mono', monospace" fontWeight="600" color="#60a5fa">{advEth} ETH</Text>
            </Flex>
          </Box>

          {/* Button */}
          <button
            className={full ? "btn-outline-pill" : "btn-primary"}
            onClick={() => !full && onBuy(gig)}
            disabled={full || isBuying}
            style={{ width: "100%", height: 40, opacity: (full || isBuying) ? 0.5 : 1,
              cursor: full ? "not-allowed" : "pointer" }}
          >
            {isBuying ? "Enrolling…" : full ? "Class Full" : "Enroll Now"}
          </button>
        </Box>
      </Box>
    </motion.div>
  );
}

function GigSkeleton() {
  const pulse = { opacity: [0.4, 0.7, 0.4], transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" } };
  return (
    <Box className="card" p={6}>
      <motion.div animate={pulse}>
        <Box h="1px" bg="rgba(255,255,255,0.06)" mb={5} />
        <Box h="18px" bg="rgba(255,255,255,0.05)" borderRadius="6px" mb={3} w="70%" />
        <Box h="13px" bg="rgba(255,255,255,0.04)" borderRadius="6px" mb={2} />
        <Box h="13px" bg="rgba(255,255,255,0.04)" borderRadius="6px" mb={2} w="85%" />
        <Box h="13px" bg="rgba(255,255,255,0.04)" borderRadius="6px" mb={5} w="60%" />
        <Box h="36px" bg="rgba(255,255,255,0.04)" borderRadius="9999px" />
      </motion.div>
    </Box>
  );
}

export default function Gigs() {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState(null);
  const [error, setError] = useState(null);
  const toast = useToast();
  const router = useRouter();
  const { account, isConnected, contract, connect } = useWeb3();

  useEffect(() => {
    if (contract) fetchGigs();
    else setLoading(false);
  }, [contract, isConnected]);

  const fetchGigs = async () => {
    try {
      setLoading(true); setError(null);
      const all = await contract.listGigs();
      setGigs(all.filter((g) => g.gigId > 0n));
    } catch (err) {
      setError("Failed to load classes. Make sure your wallet is on Base Sepolia.");
    } finally { setLoading(false); }
  };

  const buyGig = async (gig) => {
    if (!account) { toast({ title: "Connect wallet first", status: "warning", duration: 4000, isClosable: true }); return; }
    const id = gig.gigId.toString();
    setBuyingId(id);
    try {
      const advance = (BigInt(gig.stringFlowRate.toString()) * 10n) / 100n;
      const tx = await contract.buy(gig.gigId, { value: advance });
      toast({ title: "Transaction submitted", description: "Waiting for confirmation…", status: "info", duration: 8000, isClosable: true });
      await tx.wait();
      toast({ title: "Enrolled!", description: "Head to My Classes to join.", status: "success", duration: 6000, isClosable: true });
      fetchGigs();
    } catch (err) {
      toast({ title: "Purchase failed", description: err?.reason || err?.message, status: "error", duration: 6000, isClosable: true });
    } finally { setBuyingId(null); }
  };

  return (
    <Box bg="#000000" minH="100vh" fontFamily="'Inter', sans-serif" pt="72px">
      <Navbar />

      <Container maxW="1280px" px={{ base: 5, md: 8 }} py={12}>
        {/* Header */}
        <Flex justify="space-between" align="center" mb={10} gap={4} flexWrap="wrap">
          <Box>
            <Heading fontSize={{ base: "28px", md: "36px" }} fontWeight="700"
              letterSpacing="-0.04em" color="#fafafa" mb={1}>
              Browse Classes
            </Heading>
            <Text color="#71717a" fontSize="14px">Live blockchain-powered sessions</Text>
          </Box>
          {isConnected && contract && (
            <button className="btn-outline-pill" onClick={fetchGigs}
              disabled={loading} style={{ opacity: loading ? 0.5 : 1 }}>
              {loading ? "Loading…" : "Refresh"}
            </button>
          )}
        </Flex>

        {/* Not connected */}
        {!isConnected && (
          <Box textAlign="center" py={28}>
            <Text fontSize="40px" mb={6}>🔒</Text>
            <Heading fontSize="24px" fontWeight="700" letterSpacing="-0.03em" color="#fafafa" mb={3}>
              Connect your wallet
            </Heading>
            <Text color="#71717a" fontSize="15px" mb={8} maxW="400px" mx="auto" lineHeight="1.6">
              Connect your wallet on Base Sepolia to browse and enroll in classes.
            </Text>
            <button className="btn-primary" onClick={connect} style={{ height: 44, padding: "0 28px" }}>
              Connect Wallet
            </button>
          </Box>
        )}

        {/* Connected but wagmi bridge still syncing — show spinner, not empty state */}
        {isConnected && !contract && !loading && (
          <Box textAlign="center" py={28}>
            <Box
              w="40px" h="40px" mx="auto" mb={5}
              border="3px solid rgba(255,255,255,0.1)"
              borderTop="3px solid #0075ff"
              borderRadius="full"
              style={{ animation: "spin 0.8s linear infinite" }}
            />
            <Text color="#71717a" fontSize="15px">Connecting to network…</Text>
          </Box>
        )}

        {/* Error */}
        {isConnected && contract && error && (
          <Box bg="rgba(239,68,68,0.05)" border="1px solid rgba(239,68,68,0.15)"
            borderRadius="12px" px={5} py={4} mb={8}>
            <Flex justify="space-between" align="center">
              <Text color="#f87171" fontSize="14px">{error}</Text>
              <button className="btn-outline-pill" onClick={fetchGigs}
                style={{ height: 30, padding: "0 12px", fontSize: 13, borderColor: "rgba(248,113,113,0.3)", color: "#f87171" }}>
                Retry
              </button>
            </Flex>
          </Box>
        )}

        {/* Loading */}
        {isConnected && contract && loading && (
          <Grid templateColumns={{ base: "1fr", md: "repeat(2,1fr)", lg: "repeat(3,1fr)" }} gap={5}>
            {[1,2,3,4,5,6].map(i => <GigSkeleton key={i} />)}
          </Grid>
        )}

        {/* Empty */}
        {isConnected && contract && !loading && !error && gigs.length === 0 && (
          <Box textAlign="center" py={28}>
            <Text fontSize="40px" mb={6}>📚</Text>
            <Heading fontSize="24px" fontWeight="700" letterSpacing="-0.03em" color="#fafafa" mb={3}>
              No classes yet
            </Heading>
            <Text color="#71717a" fontSize="15px" mb={8} maxW="400px" mx="auto" lineHeight="1.6">
              Be the first to host a class and start earning per second.
            </Text>
            <button className="btn-primary" onClick={() => router.push("/host-class")}
              style={{ height: 44, padding: "0 28px" }}>
              Host a Class
            </button>
          </Box>
        )}

        {/* Grid */}
        {isConnected && contract && !loading && gigs.length > 0 && (
          <>
            <Text color="#52525b" fontSize="13px" mb={6}>
              {gigs.length} class{gigs.length !== 1 ? "es" : ""} available
            </Text>
            <motion.div initial="hidden" animate="show" variants={stagger}>
              <Grid templateColumns={{ base: "1fr", md: "repeat(2,1fr)", lg: "repeat(3,1fr)" }} gap={5}>
                {gigs.map(gig => (
                  <GigCard key={gig.gigId.toString()} gig={gig} onBuy={buyGig}
                    isBuying={buyingId === gig.gigId.toString()} />
                ))}
              </Grid>
            </motion.div>
          </>
        )}
      </Container>
    </Box>
  );
}
