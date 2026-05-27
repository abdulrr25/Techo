import { Box, Container, Heading, Text, Flex, SimpleGrid, Stack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import { useWeb3 } from "../hooks/useWeb3";

const ease = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

function Section({ children, ...props }) {
  return (
    <motion.div initial="hidden" whileInView="show"
      viewport={{ once: true, amount: 0.25 }} variants={stagger} {...props}>
      {children}
    </motion.div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <motion.div variants={fadeUp}>
      <Box className="card card-hover" p={7} h="full">
        <Text fontSize="26px" mb={5}>{icon}</Text>
        <Text fontWeight="600" fontSize="15px" color="#fafafa" mb={2.5} letterSpacing="-0.02em">{title}</Text>
        <Text color="#71717a" fontSize="14px" lineHeight="1.6">{desc}</Text>
      </Box>
    </motion.div>
  );
}

function StepCard({ num, icon, title, desc }) {
  return (
    <motion.div variants={fadeUp}>
      <Box textAlign="center" px={4}>
        <Box
          w={14} h={14} borderRadius="full" mx="auto" mb={5}
          bg="rgba(255,255,255,0.04)" border="1px solid rgba(255,255,255,0.08)"
          display="flex" alignItems="center" justifyContent="center" fontSize="22px"
        >
          {icon}
        </Box>
        <Text className="chip" mb={4} display="inline-flex">Step {num}</Text>
        <Text fontWeight="600" fontSize="15px" color="#fafafa" mb={2} letterSpacing="-0.02em">{title}</Text>
        <Text color="#71717a" fontSize="14px" lineHeight="1.6" maxW="200px" mx="auto">{desc}</Text>
      </Box>
    </motion.div>
  );
}

function StatItem({ value, label }) {
  return (
    <motion.div variants={fadeUp}>
      <Box textAlign="center">
        <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="700" color="#fafafa"
          letterSpacing="-0.04em" mb={1}>{value}</Text>
        <Text color="#71717a" fontSize="13px">{label}</Text>
      </Box>
    </motion.div>
  );
}

export default function Home() {
  const { account, isConnected, connect } = useWeb3();
  const router = useRouter();
  const short = account ? `${account.slice(0, 6)}…${account.slice(-4)}` : null;

  return (
    <Box bg="#000000" minH="100vh" fontFamily="'Inter', sans-serif">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <Box className="bg-app" position="relative" pt={{ base: "140px", md: "160px" }} pb={{ base: "100px", md: "128px" }}>
        <div className="grid-pattern" />

        <Container maxW="1280px" px={{ base: 5, md: 8 }} position="relative" zIndex={1}>
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <Flex direction="column" align="center" textAlign="center" gap={6}>

              {/* Badge */}
              <motion.div variants={fadeUp}>
                <Box className="chip">
                  <Box w="6px" h="6px" bg="#0075ff" borderRadius="full" className="animate-pulseGlow" />
                  Powered by Base Sepolia · Superfluid
                </Box>
              </motion.div>

              {/* Headline */}
              <motion.div variants={fadeUp}>
                <Heading
                  as="h1"
                  fontSize={{ base: "40px", md: "60px", lg: "72px" }}
                  fontWeight="700"
                  letterSpacing="-0.05em"
                  lineHeight="1.05"
                  color="#fafafa"
                  maxW="900px"
                >
                  Learn anything.{" "}
                  <span className="blue-gradient-text">Pay per second.</span>
                </Heading>
              </motion.div>

              {/* Sub */}
              <motion.div variants={fadeUp}>
                <Text fontSize={{ base: "16px", md: "18px" }} color="#71717a"
                  maxW="560px" lineHeight="1.6" letterSpacing="-0.01em">
                  The first decentralized education platform where ETHx streams
                  directly from student to teacher in real time — pay only for
                  the exact seconds you spend learning.
                </Text>
              </motion.div>

              {/* CTAs */}
              <motion.div variants={fadeUp}>
                {isConnected ? (
                  <Stack align="center" spacing={4}>
                    {/* Show address pill only once wallet address is available */}
                    {short && (
                      <Flex align="center" gap={2}
                        h="28px" px={3} borderRadius="9999px"
                        bg="rgba(255,255,255,0.04)" border="1px solid rgba(255,255,255,0.08)">
                        <Box w="6px" h="6px" bg="#00b34a" borderRadius="full" />
                        <Text fontSize="11px" fontFamily="'JetBrains Mono', monospace" color="#a1a1aa">{short}</Text>
                      </Flex>
                    )}
                    <Flex gap={3} wrap="wrap" justify="center">
                      <button className="btn-primary" onClick={() => router.push("/gigs")}
                        style={{ height: 40, padding: "0 22px", fontSize: 14 }}>
                        Browse Classes
                      </button>
                      <button className="btn-outline-pill" onClick={() => router.push("/host-class")}
                        style={{ height: 40, padding: "0 22px", fontSize: 14 }}>
                        Host a Class
                      </button>
                    </Flex>
                  </Stack>
                ) : (
                  <Flex gap={3} wrap="wrap" justify="center">
                    <button className="btn-primary" onClick={connect}
                      style={{ height: 40, padding: "0 22px", fontSize: 14 }}>
                      Connect Wallet
                    </button>
                    <button className="btn-outline-pill" onClick={() => router.push("/gigs")}
                      style={{ height: 40, padding: "0 22px", fontSize: 14 }}>
                      Browse Classes
                    </button>
                  </Flex>
                )}
              </motion.div>
            </Flex>
          </motion.div>
        </Container>
      </Box>

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      <Box className="divider-soft" />
      <Box bg="#000000" py={14}>
        <Container maxW="1280px" px={{ base: 5, md: 8 }}>
          <Section>
            <Flex justify="space-around" align="center" wrap="wrap" gap={8}>
              <StatItem value="10%" label="Upfront commitment only" />
              <Box w="1px" h="32px" bg="rgba(255,255,255,0.08)" display={{ base: "none", md: "block" }} />
              <StatItem value="90%" label="Streamed per second" />
              <Box w="1px" h="32px" bg="rgba(255,255,255,0.08)" display={{ base: "none", md: "block" }} />
              <StatItem value="0%" label="Platform cut" />
              <Box w="1px" h="32px" bg="rgba(255,255,255,0.08)" display={{ base: "none", md: "block" }} />
              <StatItem value="ERC-1155" label="NFT attendance proof" />
            </Flex>
          </Section>
        </Container>
      </Box>
      <Box className="divider-soft" />

      {/* ── How it works ─────────────────────────────────────────────── */}
      <Box py={{ base: "80px", md: "112px" }} bg="#000000">
        <Container maxW="1280px" px={{ base: 5, md: 8 }}>
          <Section>
            <Box textAlign="center" mb={16}>
              <motion.div variants={fadeUp}>
                <Text className="chip" mb={5} display="inline-flex">How it works</Text>
              </motion.div>
              <motion.div variants={fadeUp}>
                <Heading fontSize={{ base: "32px", md: "48px" }} fontWeight="700"
                  letterSpacing="-0.05em" color="#fafafa" mb={4} lineHeight="1.1">
                  Simple. Fair.{" "}
                  <span className="gradient-text">Trustless.</span>
                </Heading>
              </motion.div>
              <motion.div variants={fadeUp}>
                <Text color="#71717a" fontSize="16px" maxW="480px" mx="auto" lineHeight="1.6">
                  Three steps to start learning or earning on-chain
                </Text>
              </motion.div>
            </Box>
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={10}>
              <StepCard num={1} icon="👛" title="Connect Wallet"
                desc="Connect your wallet to Base Sepolia to access the platform" />
              <StepCard num={2} icon="📖" title="Enroll & Pay 10%"
                desc="Browse live classes and pay a 10% commitment deposit" />
              <StepCard num={3} icon="⚡" title="Stream & Learn"
                desc="Join the session — ETHx flows per second. Leave anytime, stop paying instantly" />
            </SimpleGrid>
          </Section>
        </Container>
      </Box>

      {/* ── Features ────────────────────────────────────────────────── */}
      <Box className="divider-soft" />
      <Box py={{ base: "80px", md: "112px" }} bg="#000000">
        <Container maxW="1280px" px={{ base: 5, md: 8 }}>
          <Section>
            <Box textAlign="center" mb={16}>
              <motion.div variants={fadeUp}>
                <Text className="chip" mb={5} display="inline-flex">Features</Text>
              </motion.div>
              <motion.div variants={fadeUp}>
                <Heading fontSize={{ base: "32px", md: "48px" }} fontWeight="700"
                  letterSpacing="-0.05em" color="#fafafa" mb={4} lineHeight="1.1">
                  Built for Web3 education
                </Heading>
              </motion.div>
              <motion.div variants={fadeUp}>
                <Text color="#71717a" fontSize="16px" maxW="480px" mx="auto" lineHeight="1.6">
                  Fair, transparent, and fully decentralized
                </Text>
              </motion.div>
            </Box>
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={5}>
              <FeatureCard icon="⏱" title="Pay Per Second"
                desc="Only charged for the exact time you spend learning. Zero wasted fees, full control." />
              <FeatureCard icon="🔒" title="Smart Contract"
                desc="All classes and payments governed by auditable contracts on Base Sepolia." />
              <FeatureCard icon="🎖" title="NFT Certificate"
                desc="ERC-1155 NFT minted on enrollment — verifiable on-chain proof of attendance." />
              <FeatureCard icon="🎥" title="Live HD Video"
                desc="Huddle01 powered — crystal-clear video, audio, and screen sharing built in." />
            </SimpleGrid>
          </Section>
        </Container>
      </Box>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <Box className="divider-soft" />
      <Box py={{ base: "80px", md: "112px" }} bg="#000000" position="relative" overflow="hidden">
        <Box position="absolute" top="50%" left="50%" transform="translate(-50%,-50%)"
          w="600px" h="400px" borderRadius="full"
          bg="rgba(0,117,255,0.07)" filter="blur(80px)" pointerEvents="none" />
        <Container maxW="1280px" px={{ base: 5, md: 8 }} position="relative" zIndex={1}>
          <Section>
            <Box textAlign="center">
              <motion.div variants={fadeUp}>
                <Heading fontSize={{ base: "32px", md: "48px" }} fontWeight="700"
                  letterSpacing="-0.05em" color="#fafafa" mb={4} lineHeight="1.1">
                  Ready to get started?
                </Heading>
              </motion.div>
              <motion.div variants={fadeUp}>
                <Text color="#71717a" fontSize="17px" mb={10} lineHeight="1.6">
                  Host your first class and earn per second, or enroll and experience truly fair education payments.
                </Text>
              </motion.div>
              <motion.div variants={fadeUp}>
                <Flex gap={3} wrap="wrap" justify="center">
                  {!isConnected ? (
                    <button className="btn-primary" onClick={connect}
                      style={{ height: 40, padding: "0 24px", fontSize: 14 }}>
                      Get Started Free
                    </button>
                  ) : (
                    <>
                      <button className="btn-primary" onClick={() => router.push("/gigs")}
                        style={{ height: 40, padding: "0 24px", fontSize: 14 }}>
                        Browse Classes
                      </button>
                      <button className="btn-outline-pill" onClick={() => router.push("/host-class")}
                        style={{ height: 40, padding: "0 24px", fontSize: 14 }}>
                        Host a Class
                      </button>
                    </>
                  )}
                </Flex>
              </motion.div>
            </Box>
          </Section>
        </Container>
      </Box>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <Box className="divider-soft" />
      <Box bg="#000000" pt={14} pb={0} overflow="hidden">
        <Container maxW="1280px" px={{ base: 5, md: 8 }}>

          {/* Top row: logo + nav grid */}
          <Flex direction={{ base: "column", md: "row" }} justify="space-between"
            align={{ base: "flex-start", md: "flex-start" }} gap={10} mb={12}>

            {/* Brand */}
            <Box flexShrink={0}>
              <Flex align="center" gap="9px" mb={3}>
                <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="0"  y="8" width="4" height="8" rx="1" fill="white" opacity="0.45"/>
                  <rect x="7"  y="4" width="4" height="12" rx="1" fill="white" opacity="0.72"/>
                  <rect x="14" y="0" width="4" height="16" rx="1" fill="white"/>
                </svg>
                <Text fontWeight="700" fontSize="15px" letterSpacing="-0.04em" color="#fafafa" lineHeight="1">Teacho</Text>
              </Flex>
              <Text fontSize="12px" color="#3f3f46" maxW="200px" lineHeight="1.6">
                Decentralized education on Base Sepolia
              </Text>
            </Box>

            {/* Nav cells */}
            <Box>
              <Text fontSize="11px" fontWeight="500" color="#3f3f46" letterSpacing="0.08em"
                textTransform="uppercase" mb={3}>Navigation</Text>
              <Flex gap={1.5} wrap="wrap" maxW="360px">
                {[
                  ["Browse Classes", "/gigs"],
                  ["Host a Class",   "/host-class"],
                  ["My Classes",     "/my-classes"],
                  ["Base Sepolia",   "https://sepolia.basescan.org"],
                  ["Superfluid",     "https://superfluid.finance"],
                  ["Huddle01",       "https://huddle01.com"],
                ].map(([label, href]) => (
                  <a key={href} href={href} className="nav-cell">{label}</a>
                ))}
              </Flex>
            </Box>

            {/* Stack info */}
            <Box>
              <Text fontSize="11px" fontWeight="500" color="#3f3f46" letterSpacing="0.08em"
                textTransform="uppercase" mb={3}>Built on</Text>
              <Flex gap={1.5} wrap="wrap" maxW="220px">
                {["Base Sepolia", "Superfluid", "ERC-1155", "Huddle01", "Next.js"].map(tag => (
                  <Box key={tag} className="chip" style={{ fontSize: 11, padding: "0.25rem 0.6rem" }}>{tag}</Box>
                ))}
              </Flex>
            </Box>
          </Flex>

          {/* Timeline ruler */}
          <Box className="divider-soft" mb={0} />
          <div className="timeline-ruler">
            {Array.from({ length: 15 }, (_, i) => (
              <div key={i} className="timeline-ruler__cell">{i === 0 ? "0" : `${i}s`}</div>
            ))}
          </div>

          {/* Watermark wordmark */}
          <Box position="relative" overflow="hidden" mt={0}>
            <Box className="footer-watermark" textAlign="center" aria-hidden="true"
              style={{ lineHeight: 0.85, paddingTop: "0.1em" }}>
              Teacho
            </Box>

            {/* Bottom bar overlay */}
            <Box
              position="absolute" bottom={0} left={0} right={0}
              h="56px"
              bg="linear-gradient(to top, #000000 55%, transparent)"
              display="flex" alignItems="flex-end" justifyContent="space-between"
              px={{ base: 5, md: 8 }} pb={4}
            >
              <Text fontSize="12px" color="#3f3f46" fontFamily="'JetBrains Mono', monospace">
                © 2026 Teacho · Base Sepolia Testnet
              </Text>
              <Text fontSize="12px" color="#3f3f46">
                Open source · MIT
              </Text>
            </Box>
          </Box>

        </Container>
      </Box>
    </Box>
  );
}
