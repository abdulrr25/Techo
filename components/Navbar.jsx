import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Box, Flex, Text, HStack, Stack, Collapse } from "@chakra-ui/react";
import { usePrivy } from "@privy-io/react-auth";
import { useWeb3 } from "../hooks/useWeb3";

const NAV_ITEMS = [
  { label: "Browse Classes", href: "/gigs" },
  { label: "Host Class",     href: "/host-class" },
  { label: "My Classes",     href: "/my-classes" },
];

export default function Navbar() {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Privy for auth actions and ready state
  const { login, logout, ready, authenticated } = usePrivy();
  // useWeb3 for the wallet address (now comes from wagmi, bridged by Privy)
  const { account } = useWeb3();
  const router = useRouter();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const short = account ? `${account.slice(0, 6)}…${account.slice(-4)}` : null;

  // Privy not yet initialised — show a disabled button to avoid hydration flash
  const isLoading = !ready;

  // After Google/email login, `authenticated` is true before the embedded wallet
  // address propagates into wagmi. Show the pill as soon as we're authenticated,
  // falling back to "Connected" label if the address isn't ready yet.
  const showConnected = authenticated;

  return (
    <Box
      as="header"
      position="fixed"
      top={0} left={0} right={0}
      zIndex={200}
      h="72px"
      bg={scrolled ? "rgba(0,0,0,0.72)" : "transparent"}
      backdropFilter={scrolled ? "blur(18px) saturate(160%)" : "none"}
      borderBottom={scrolled ? "1px solid rgba(255,255,255,0.06)" : "none"}
      boxShadow={scrolled ? "0 1px 0 rgba(255,255,255,0.04) inset" : "none"}
      transition="background 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease"
    >
      <Flex maxW="1280px" mx="auto" px={{ base: 5, md: 8 }} h="72px" align="center" justify="space-between">

        {/* Logo */}
        <Flex
          align="center" gap="9px" cursor="pointer" userSelect="none"
          onClick={() => router.push("/")} role="link"
          _hover={{ opacity: 0.85 }} transition="opacity 0.15s"
        >
          <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0"  y="8" width="4" height="8" rx="1" fill="white" opacity="0.45"/>
            <rect x="7"  y="4" width="4" height="12" rx="1" fill="white" opacity="0.72"/>
            <rect x="14" y="0" width="4" height="16" rx="1" fill="white"/>
          </svg>
          <Text
            fontFamily="'Inter', sans-serif"
            fontWeight="700"
            fontSize="16px"
            letterSpacing="-0.04em"
            color="#fafafa"
            lineHeight="1"
          >
            Teacho
          </Text>
        </Flex>

        {/* Desktop nav links */}
        <HStack spacing={1} display={{ base: "none", md: "flex" }}>
          {NAV_ITEMS.map(({ label, href }) => {
            const active = router.pathname === href;
            return (
              <Box
                key={label}
                as="button"
                onClick={() => router.push(href)}
                px={3} py={2}
                borderRadius="8px"
                fontSize="14px"
                fontWeight="500"
                fontFamily="'Inter', sans-serif"
                color={active ? "#ffffff" : "#a1a1aa"}
                bg={active ? "rgba(255,255,255,0.06)" : "transparent"}
                transition="all 0.15s ease"
                _hover={{ color: "#ffffff", bg: "rgba(255,255,255,0.05)" }}
                cursor="pointer"
                border="none"
                outline="none"
              >
                {label}
              </Box>
            );
          })}
        </HStack>

        {/* Wallet — desktop */}
        <HStack spacing={3} display={{ base: "none", md: "flex" }}>
          {showConnected ? (
            <HStack spacing={2}>
              {/* Address pill */}
              <Flex
                align="center" gap={2}
                h="32px" px={3}
                borderRadius="9999px"
                bg="rgba(255,255,255,0.04)"
                border="1px solid rgba(255,255,255,0.08)"
              >
                <Box w="6px" h="6px" bg="#00b34a" borderRadius="full" flexShrink={0} />
                <Text fontSize="13px" fontFamily="'JetBrains Mono', monospace" color="#a1a1aa">{short ?? "Connected"}</Text>
              </Flex>
              {/* Disconnect */}
              <Box
                as="button"
                onClick={logout}
                h="32px" px={4}
                borderRadius="9999px"
                fontSize="13px"
                fontWeight="500"
                fontFamily="'Inter', sans-serif"
                color="#a1a1aa"
                bg="transparent"
                border="1px solid rgba(255,255,255,0.08)"
                cursor="pointer"
                _hover={{ color: "#fafafa", borderColor: "rgba(255,255,255,0.22)", bg: "rgba(255,255,255,0.04)" }}
                transition="all 0.2s ease"
              >
                Disconnect
              </Box>
            </HStack>
          ) : (
            <Box
              as="button"
              onClick={isLoading ? undefined : login}
              h="36px" px={4}
              borderRadius="9999px"
              fontSize="14px"
              fontWeight="500"
              fontFamily="'Inter', sans-serif"
              color="white"
              bg={isLoading ? "rgba(255,255,255,0.1)" : "transparent"}
              border="1px solid rgba(255,255,255,0.22)"
              cursor={isLoading ? "default" : "pointer"}
              _hover={isLoading ? {} : { bg: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.4)" }}
              transition="all 0.2s ease"
              opacity={isLoading ? 0.5 : 1}
            >
              {isLoading ? "Loading…" : "Connect Wallet"}
            </Box>
          )}
        </HStack>

        {/* Mobile hamburger */}
        <Box
          as="button"
          display={{ base: "flex", md: "none" }}
          onClick={() => setMobileOpen(!mobileOpen)}
          w={9} h={9}
          alignItems="center"
          justifyContent="center"
          borderRadius="9px"
          border="1px solid rgba(255,255,255,0.10)"
          bg="rgba(255,255,255,0.05)"
          cursor="pointer"
          transition="all 0.2s"
          _hover={{ bg: "rgba(255,255,255,0.09)" }}
          flexDirection="column"
          gap="5px"
        >
          <Box w="14px" h="1.5px" bg={mobileOpen ? "transparent" : "#a1a1aa"} transition="all 0.2s" />
          <Box w="14px" h="1.5px" bg="#a1a1aa" transition="all 0.2s"
            transform={mobileOpen ? "rotate(45deg) translateY(-0px)" : "none"} />
          <Box w="14px" h="1.5px" bg={mobileOpen ? "transparent" : "#a1a1aa"} transition="all 0.2s" />
        </Box>
      </Flex>

      {/* Mobile dropdown */}
      <Collapse in={mobileOpen} animateOpacity>
        <Box
          mx={3} mb={3}
          borderRadius="16px"
          className="glass-strong"
          p={3}
          display={{ md: "none" }}
        >
          <Stack spacing={1} mb={3}>
            {NAV_ITEMS.map(({ label, href }) => {
              const active = router.pathname === href;
              return (
                <Box
                  key={label}
                  as="button"
                  onClick={() => { router.push(href); setMobileOpen(false); }}
                  px={3} py={2.5}
                  borderRadius="10px"
                  fontSize="14px"
                  fontWeight="500"
                  fontFamily="'Inter', sans-serif"
                  color={active ? "#ffffff" : "rgba(255,255,255,0.75)"}
                  bg={active ? "rgba(255,255,255,0.07)" : "transparent"}
                  textAlign="left"
                  cursor="pointer"
                  w="full"
                  border="none"
                  _hover={{ bg: "rgba(255,255,255,0.06)", color: "white" }}
                  transition="all 0.15s"
                >
                  {label}
                </Box>
              );
            })}
          </Stack>

          <Box className="divider-soft" mb={3} />

          {showConnected ? (
            <Stack spacing={2}>
              <Flex align="center" gap={2} px={3} py={2} borderRadius="10px"
                bg="rgba(255,255,255,0.03)" border="1px solid rgba(255,255,255,0.07)">
                <Box w="6px" h="6px" bg="#00b34a" borderRadius="full" flexShrink={0} />
                <Text fontSize="12px" fontFamily="'JetBrains Mono', monospace" color="#a1a1aa">{short ?? "Connected"}</Text>
              </Flex>
              <Box as="button" onClick={logout} py={2.5} borderRadius="10px"
                fontSize="14px" fontWeight="500" fontFamily="'Inter', sans-serif"
                color="#a1a1aa" bg="transparent" border="1px solid rgba(255,255,255,0.08)"
                cursor="pointer" w="full"
                _hover={{ color: "#fafafa", bg: "rgba(255,255,255,0.04)" }}
                transition="all 0.2s">
                Disconnect
              </Box>
            </Stack>
          ) : (
            <Box
              as="button"
              onClick={isLoading ? undefined : login}
              py={2.5} borderRadius="9999px"
              fontSize="14px" fontWeight="500" fontFamily="'Inter', sans-serif"
              color="white" bg="#0075ff" border="none"
              cursor={isLoading ? "default" : "pointer"}
              w="full"
              opacity={isLoading ? 0.5 : 1}
              _hover={isLoading ? {} : { bg: "#1f86ff" }}
              transition="background 0.15s"
            >
              {isLoading ? "Loading…" : "Connect Wallet"}
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}
