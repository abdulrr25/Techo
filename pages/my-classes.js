import { formatEther } from "ethers";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useWeb3 } from "../hooks/useWeb3";
import Navbar from "../components/Navbar";
import { Box, Container, Flex, Grid, Heading, Text, useToast, HStack } from "@chakra-ui/react";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1];
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } };
const stagger = { show: { transition: { staggerChildren: 0.07 } } };

function ClassCard({ cls, onJoin }) {
  const totalEth = cls.stringFlowRate
    ? parseFloat(formatEther(cls.stringFlowRate.toString())).toFixed(6) : "0";
  const short = cls.host ? `${cls.host.slice(0, 6)}…${cls.host.slice(-4)}` : "Unknown";

  return (
    <motion.div variants={fadeUp}>
      <Box className="card card-hover" display="flex" flexDirection="column" h="full">
        <Box h="1px" bg="linear-gradient(to right, rgba(99,102,241,0.6), transparent)" />
        <Box p={6} flex="1" display="flex" flexDirection="column">
          <Flex justify="space-between" align="flex-start" mb={3}>
            <Heading fontSize="15px" fontWeight="600" color="#fafafa"
              letterSpacing="-0.02em" lineHeight="1.4" noOfLines={2} flex={1} mr={3}>
              {cls.title}
            </Heading>
            <Box className="chip" flexShrink={0}>{Number(cls.attendees)} enrolled</Box>
          </Flex>

          <Text color="#71717a" fontSize="13px" lineHeight="1.6" noOfLines={3} mb={5} flex="1">
            {cls.description}
          </Text>

          <Flex align="center" gap={2} mb={3}>
            <Box w="18px" h="18px" borderRadius="full" bg="rgba(255,255,255,0.07)"
              border="1px solid rgba(255,255,255,0.08)" display="flex" alignItems="center"
              justifyContent="center" fontSize="9px" color="#a1a1aa" fontWeight="600" flexShrink={0}>
              {cls.host ? cls.host.slice(2, 4).toUpperCase() : "??"}
            </Box>
            <Text fontSize="12px" fontFamily="'JetBrains Mono', monospace" color="#52525b">{short}</Text>
          </Flex>

          {cls.time && <Text fontSize="12px" color="#52525b" mb={4}>🗓 {cls.time}</Text>}

          <Box className="divider-soft" mb={4} />

          <Flex justify="space-between" mb={5}>
            <Box>
              <Text fontSize="11px" color="#52525b" mb={1}>Rate</Text>
              <Text fontSize="12px" fontFamily="'JetBrains Mono', monospace" color="#a1a1aa">{totalEth} ETH/hr</Text>
            </Box>
            <Box textAlign="right">
              <Text fontSize="11px" color="#52525b" mb={1}>Room ID</Text>
              <Text fontSize="11px" fontFamily="'JetBrains Mono', monospace" color="#52525b"
                noOfLines={1} maxW="130px">{cls.meetingId}</Text>
            </Box>
          </Flex>

          <button className="btn-secondary" onClick={() => onJoin(cls)}
            style={{ width: "100%", height: 40 }}>
            🎥 Join Class
          </button>
        </Box>
      </Box>
    </motion.div>
  );
}

function CardSkeleton() {
  const pulse = { opacity: [0.4, 0.7, 0.4], transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" } };
  return (
    <Box className="card" p={6}>
      <motion.div animate={pulse}>
        <Box h="1px" bg="rgba(255,255,255,0.06)" mb={5} />
        <Box h="18px" bg="rgba(255,255,255,0.05)" borderRadius="6px" mb={3} w="70%" />
        <Box h="13px" bg="rgba(255,255,255,0.04)" borderRadius="6px" mb={2} />
        <Box h="13px" bg="rgba(255,255,255,0.04)" borderRadius="6px" mb={5} w="75%" />
        <Box h="36px" bg="rgba(255,255,255,0.04)" borderRadius="9999px" />
      </motion.div>
    </Box>
  );
}

const TABS = ["All", "Hosted", "Enrolled"];

export default function MyClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const router = useRouter();
  const toast = useToast();
  const { account, isConnected, contract, connect } = useWeb3();

  useEffect(() => {
    if (account && contract) fetchMyClasses();
    else setLoading(false);
  }, [account, contract, isConnected]);

  const fetchMyClasses = async () => {
    try {
      setLoading(true); setError(null);
      const all = await contract.myClasses(account);
      setClasses(all.filter((c) => c.gigId > 0n));
    } catch (err) {
      setError("Failed to fetch your classes. Make sure your wallet is on Base Sepolia.");
    } finally { setLoading(false); }
  };

  const joinMeeting = (cls) => {
    if (!cls.meetingId) {
      toast({ title: "No meeting ID", status: "error", duration: 4000, isClosable: true }); return;
    }
    router.push(`/${cls.meetingId}?gigId=${cls.gigId}&host=${cls.host}&flowRate=${cls.flowRate}`);
  };

  const hosted   = classes.filter(c => c.host?.toLowerCase() === account?.toLowerCase());
  const enrolled = classes.filter(c => c.host?.toLowerCase() !== account?.toLowerCase());
  const tabItems = [classes, hosted, enrolled];
  const counts   = [classes.length, hosted.length, enrolled.length];

  return (
    <Box bg="#000000" minH="100vh" fontFamily="'Inter', sans-serif" pt="72px">
      <Navbar />

      <Container maxW="1280px" px={{ base: 5, md: 8 }} py={12}>
        {/* Header */}
        <Flex justify="space-between" align="center" mb={10} gap={4} flexWrap="wrap">
          <Box>
            <Heading fontSize={{ base: "28px", md: "36px" }} fontWeight="700"
              letterSpacing="-0.04em" color="#fafafa" mb={1}>My Classes</Heading>
            <Text color="#71717a" fontSize="14px">Classes you&apos;ve hosted or enrolled in</Text>
          </Box>
          {isConnected && contract && (
            <HStack spacing={3}>
              <button className="btn-outline-pill" onClick={fetchMyClasses}
                disabled={loading} style={{ opacity: loading ? 0.5 : 1 }}>
                {loading ? "Loading…" : "Refresh"}
              </button>
              <button className="btn-primary" onClick={() => router.push("/host-class")}
                style={{ height: 36, padding: "0 16px", fontSize: 14 }}>
                + Host Class
              </button>
            </HStack>
          )}
        </Flex>

        {/* Not connected */}
        {!isConnected && (
          <Box textAlign="center" py={28}>
            <Text fontSize="40px" mb={6}>🔑</Text>
            <Heading fontSize="24px" fontWeight="700" letterSpacing="-0.03em" color="#fafafa" mb={3}>
              Connect your wallet
            </Heading>
            <Text color="#71717a" fontSize="15px" mb={8} maxW="400px" mx="auto" lineHeight="1.6">
              Connect your wallet to view the classes you&apos;ve hosted or enrolled in.
            </Text>
            <button className="btn-primary" onClick={connect} style={{ height: 44, padding: "0 28px" }}>
              Connect Wallet
            </button>
          </Box>
        )}

        {/* Connected but wagmi bridge still syncing — show spinner */}
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
              <button className="btn-outline-pill" onClick={fetchMyClasses}
                style={{ height: 30, padding: "0 12px", fontSize: 13, borderColor: "rgba(248,113,113,0.3)", color: "#f87171" }}>
                Retry
              </button>
            </Flex>
          </Box>
        )}

        {/* Loading */}
        {isConnected && contract && loading && (
          <Grid templateColumns={{ base: "1fr", md: "repeat(2,1fr)", lg: "repeat(3,1fr)" }} gap={5}>
            {[1,2,3].map(i => <CardSkeleton key={i} />)}
          </Grid>
        )}

        {/* Content */}
        {isConnected && contract && !loading && !error && (
          <>
            {classes.length === 0 ? (
              <Box textAlign="center" py={28}>
                <Text fontSize="40px" mb={6}>🎒</Text>
                <Heading fontSize="24px" fontWeight="700" letterSpacing="-0.03em" color="#fafafa" mb={3}>
                  No classes yet
                </Heading>
                <Text color="#71717a" fontSize="15px" mb={8} maxW="400px" mx="auto" lineHeight="1.6">
                  Browse classes to enroll, or host your own and start earning.
                </Text>
                <Flex gap={3} justify="center">
                  <button className="btn-primary" onClick={() => router.push("/gigs")}
                    style={{ height: 44, padding: "0 24px" }}>Browse Classes</button>
                  <button className="btn-outline-pill" onClick={() => router.push("/host-class")}
                    style={{ height: 44, padding: "0 24px" }}>Host a Class</button>
                </Flex>
              </Box>
            ) : (
              <>
                {/* Tab bar */}
                <Flex gap={2} mb={8} wrap="wrap">
                  {TABS.map((tab, i) => (
                    <button key={tab} onClick={() => setActiveTab(i)}
                      style={{
                        height: 34, padding: "0 14px", borderRadius: 9999,
                        fontSize: 13, fontWeight: 500, fontFamily: "'Inter', sans-serif",
                        cursor: "pointer", transition: "all 0.2s ease",
                        background: activeTab === i ? "rgba(255,255,255,0.08)" : "transparent",
                        color: activeTab === i ? "#fafafa" : "#71717a",
                        border: activeTab === i ? "1px solid rgba(255,255,255,0.16)" : "1px solid rgba(255,255,255,0.06)",
                      }}>
                      {tab}
                      <span style={{
                        marginLeft: 8, padding: "1px 7px", borderRadius: 9999,
                        background: "rgba(255,255,255,0.06)", fontSize: 11, color: "#71717a",
                      }}>{counts[i]}</span>
                    </button>
                  ))}
                </Flex>

                {tabItems[activeTab].length === 0 ? (
                  <Text color="#52525b" textAlign="center" py={12} fontSize="14px">
                    {activeTab === 1 ? "You haven't hosted any classes yet." : "You haven't enrolled in any classes yet."}
                  </Text>
                ) : (
                  <motion.div initial="hidden" animate="show" variants={stagger}>
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2,1fr)", lg: "repeat(3,1fr)" }} gap={5}>
                      {tabItems[activeTab].map(cls => (
                        <ClassCard key={cls.gigId.toString()} cls={cls} onJoin={joinMeeting} />
                      ))}
                    </Grid>
                  </motion.div>
                )}
              </>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}
