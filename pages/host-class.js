import { useState } from "react";
import { parseEther } from "ethers";
import { useRouter } from "next/router";
import { useWeb3 } from "../hooks/useWeb3";
import Navbar from "../components/Navbar";
import { Box, Container, Flex, Heading, Text, useToast, SimpleGrid } from "@chakra-ui/react";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1];
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

const inputStyle = {
  width: "100%",
  background: "#0a0a0a",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
  color: "#fafafa",
  fontFamily: "'Inter', sans-serif",
  fontSize: 14,
  padding: "11px 14px",
  outline: "none",
  transition: "border-color 0.2s",
};

function FormInput({ label, helper, children }) {
  return (
    <motion.div variants={fadeUp}>
      <Box mb={5}>
        <Text fontSize="13px" fontWeight="500" color="#a1a1aa" mb={2} letterSpacing="-0.01em">
          {label}
        </Text>
        {children}
        {helper && <Text fontSize="12px" color="#52525b" mt={1.5}>{helper}</Text>}
      </Box>
    </motion.div>
  );
}

function InfoCard({ icon, title, desc }) {
  return (
    <motion.div variants={fadeUp}>
      <Box className="card" p={5}>
        <Text fontSize="20px" mb={3}>{icon}</Text>
        <Text fontWeight="600" fontSize="13px" color="#fafafa" mb={1.5} letterSpacing="-0.02em">{title}</Text>
        <Text fontSize="12px" color="#71717a" lineHeight="1.6">{desc}</Text>
      </Box>
    </motion.div>
  );
}

export default function HostClass() {
  const [title, setTitle]           = useState("");
  const [description, setDescription] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [price, setPrice]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [focused, setFocused]       = useState("");
  const router  = useRouter();
  const toast   = useToast();
  const { account, isConnected, contract, connect } = useWeb3();

  const focusStyle = (name) => ({
    ...inputStyle,
    borderColor: focused === name ? "rgba(0,117,255,0.7)" : "rgba(255,255,255,0.08)",
    boxShadow:   focused === name ? "0 0 0 1px rgba(0,117,255,0.3)" : "none",
  });

  const createRoom = async () => {
    const res  = await fetch("/api/create-room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to create room");
    if (!data.roomId) throw new Error("No room ID returned");
    return data.roomId;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!account) { toast({ title: "Connect your wallet first", status: "warning", duration: 4000, isClosable: true }); return; }
    if (!title.trim() || !description.trim() || !meetingTime || !price) {
      toast({ title: "All fields are required", status: "warning", duration: 4000, isClosable: true }); return;
    }
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast({ title: "Price must be a positive number", status: "error", duration: 4000, isClosable: true }); return;
    }
    try {
      setLoading(true);
      toast({ title: "Creating meeting room…", status: "info", duration: 5000, isClosable: true });
      const meetingId     = await createRoom();
      toast({ title: "Confirm in your wallet…", status: "info", duration: 10000, isClosable: true });
      const stringFlowRate = parseEther(price);
      const flowRatePerSec = stringFlowRate / 3600n;
      const timeString     = new Date(meetingTime).toLocaleString();
      const tx = await contract.createGig(title.trim(), description.trim(), timeString, meetingId, flowRatePerSec, stringFlowRate);
      await tx.wait();
      toast({ title: "Class created!", description: "Your class is now live on-chain.", status: "success", duration: 6000, isClosable: true });
      router.push("/my-classes");
    } catch (err) {
      toast({ title: "Failed to create class", description: err?.reason || err?.message, status: "error", duration: 6000, isClosable: true });
    } finally { setLoading(false); }
  };

  return (
    <Box bg="#000000" minH="100vh" fontFamily="'Inter', sans-serif" pt="72px">
      <Navbar />

      <Container maxW="760px" px={{ base: 5, md: 8 }} py={12}>
        <motion.div initial="hidden" animate="show" variants={stagger}>

          {/* Header */}
          <motion.div variants={fadeUp}>
            <Box mb={10}>
              <Heading fontSize={{ base: "28px", md: "36px" }} fontWeight="700"
                letterSpacing="-0.04em" color="#fafafa" mb={2}>Host a Class</Heading>
              <Text color="#71717a" fontSize="15px" lineHeight="1.6">
                Create a live session and earn ETHx per second while you teach.
              </Text>
            </Box>
          </motion.div>

          {/* Info cards */}
          <SimpleGrid columns={{ base: 1, sm: 3 }} gap={4} mb={10}>
            <InfoCard icon="🎬" title="Set up your class" desc="Fill in details and pricing below" />
            <InfoCard icon="💸" title="10% upfront deposit" desc="Students commit with a 10% fee" />
            <InfoCard icon="⏱" title="Earn per second" desc="ETHx streams to you in real time" />
          </SimpleGrid>

          {/* Wallet warning */}
          {!isConnected && (
            <motion.div variants={fadeUp}>
              <Box className="card" px={5} py={4} mb={8} borderColor="rgba(234,179,8,0.2) !important">
                <Flex justify="space-between" align="center" gap={4}>
                  <Box>
                    <Text fontWeight="600" fontSize="14px" color="#fbbf24" mb={0.5}>Wallet not connected</Text>
                    <Text fontSize="13px" color="#71717a">Connect your wallet to create a class.</Text>
                  </Box>
                  <button className="btn-outline-pill" onClick={connect}
                    style={{ flexShrink: 0, borderColor: "rgba(251,191,36,0.3)", color: "#fbbf24" }}>
                    Connect
                  </button>
                </Flex>
              </Box>
            </motion.div>
          )}

          {/* Form card */}
          <motion.div variants={fadeUp}>
            <Box className="card" overflow="hidden">
              <Box h="1px" bg="linear-gradient(to right, rgba(0,117,255,0.7), rgba(56,189,248,0.4), transparent)" />
              <Box p={{ base: 6, md: 8 }}>
                <Box as="form" onSubmit={handleSubmit}>
                  <motion.div initial="hidden" animate="show" variants={stagger}>

                    <FormInput label="Class Title">
                      <input
                        value={title} onChange={e => setTitle(e.target.value)}
                        placeholder="e.g. Introduction to DeFi"
                        maxLength={100}
                        style={focusStyle("title")}
                        onFocus={() => setFocused("title")}
                        onBlur={() => setFocused("")}
                      />
                    </FormInput>

                    <FormInput label="Description"
                      helper={`${description.length}/500 characters`}>
                      <textarea
                        value={description} onChange={e => setDescription(e.target.value)}
                        placeholder="What will students learn? Who is this class for?"
                        maxLength={500} rows={4}
                        style={{ ...focusStyle("desc"), resize: "none", lineHeight: 1.6 }}
                        onFocus={() => setFocused("desc")}
                        onBlur={() => setFocused("")}
                      />
                    </FormInput>

                    <FormInput label="Scheduled Time">
                      <input
                        type="datetime-local" value={meetingTime}
                        onChange={e => setMeetingTime(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                        style={{ ...focusStyle("time"), colorScheme: "dark" }}
                        onFocus={() => setFocused("time")}
                        onBlur={() => setFocused("")}
                      />
                    </FormInput>

                    <FormInput label="Price per Hour (ETH)"
                      helper={`Students pay ${price ? (parseFloat(price) * 0.1).toFixed(6) : "0"} ETH (10%) upfront. The rest streams per second during the session.`}>
                      <Flex gap={0}>
                        <input
                          type="number" value={price} onChange={e => setPrice(e.target.value)}
                          placeholder="0.01" min={0} step={0.001}
                          style={{ ...focusStyle("price"), borderRadius: "12px 0 0 12px", flex: 1 }}
                          onFocus={() => setFocused("price")}
                          onBlur={() => setFocused("")}
                        />
                        <Box
                          px={4} display="flex" alignItems="center"
                          bg="#0a0a0a" border="1px solid rgba(255,255,255,0.08)"
                          borderLeft="none" borderRadius="0 12px 12px 0"
                          fontSize="13px" fontWeight="600" color="#71717a" whiteSpace="nowrap"
                        >
                          ETH/hr
                        </Box>
                      </Flex>
                    </FormInput>

                    <Box className="divider-soft" mb={6} />

                    <motion.div variants={fadeUp}>
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={!isConnected || !contract || loading}
                        style={{
                          width: "100%", height: 48, fontSize: 15,
                          opacity: (!isConnected || !contract || loading) ? 0.45 : 1,
                          cursor: (!isConnected || !contract || loading) ? "not-allowed" : "pointer",
                        }}
                      >
                        {loading ? "Creating class…" : "Create Class"}
                      </button>
                    </motion.div>

                    <motion.div variants={fadeUp}>
                      <Text fontSize="12px" color="#52525b" textAlign="center" mt={4}>
                        Creating a class mints an ERC-1155 NFT on Base Sepolia testnet.
                      </Text>
                    </motion.div>

                  </motion.div>
                </Box>
              </Box>
            </Box>
          </motion.div>

        </motion.div>
      </Container>
    </Box>
  );
}
