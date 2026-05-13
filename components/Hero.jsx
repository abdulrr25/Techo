import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Flex,
  Stack,
  useColorModeValue,
  Image,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useWeb3 } from "../hooks/useWeb3";

const MotionBox = motion.create(Box);

const Hero = () => {
  const { account, isConnected, connect } = useWeb3();
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.800", "white");

  return (
    <Box as="section" minH="100vh" bg={bgColor}>
      <Container maxW="container.xl" py={20}>
        <Flex
          direction={{ base: "column", md: "row" }}
          align="center"
          justify="space-between"
          gap={8}
        >
          <Box flex={1}>
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Heading
                as="h1"
                size="4xl"
                mb={6}
                color={textColor}
                fontWeight="bold"
                lineHeight="1.2"
              >
                Welcome to Teacho
              </Heading>
              <Text fontSize="xl" color="gray.600" mb={8} maxW="2xl">
                Connect your wallet to get started with our decentralized learning platform.
              </Text>
              {!isConnected && (
                <Button
                  onClick={connect}
                  colorScheme="blue"
                  size="lg"
                  px={8}
                  py={6}
                  fontSize="md"
                  rounded="full"
                >
                  Connect Wallet
                </Button>
              )}
              {isConnected && (
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  p={6}
                  bg="white"
                  rounded="lg"
                  shadow="lg"
                  maxW="md"
                  w="full"
                >
                  <Text fontSize="lg" color="gray.600" mb={4}>
                    Connected Wallet:
                  </Text>
                  <Text
                    fontFamily="mono"
                    fontSize="sm"
                    color="gray.800"
                    bg="gray.100"
                    p={2}
                    rounded="md"
                  >
                    {account}
                  </Text>
                </Flex>
              )}
            </MotionBox>
          </Box>
          <Box flex={1}>
            <MotionBox
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src="/assets/hero.png"
                alt="Hero illustration"
                w="full"
                h="auto"
                rounded="lg"
                shadow="xl"
              />
            </MotionBox>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default Hero;
