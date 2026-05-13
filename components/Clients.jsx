import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Image,
  useColorModeValue,
} from "@chakra-ui/react";

const Clients = () => {
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");

  return (
    <Box bg={bgColor} py={20}>
      <Container maxW="container.xl">
        <Flex
          direction={{ base: "column", md: "row" }}
          align="center"
          justify="space-between"
          gap={8}
        >
          <Box flex="1" maxW={{ base: "100%", md: "40%" }}>
            <Heading
              as="h2"
              size="2xl"
              color={textColor}
              mb={4}
              fontWeight="bold"
              lineHeight="1.2"
            >
              Join the thousands of innovators already building with us
            </Heading>
            <Text fontSize="lg" color={textColor} opacity={0.9}>
              Everything you need to accept card payments and grow your business
              anywhere on the planet.
            </Text>
          </Box>

          <Box flex="1">
            <Flex
              wrap="wrap"
              justify="center"
              align="center"
              gap={{ base: 8, md: 12 }}
            >
              <Image
                src="/images/airbnb.png"
                alt="Airbnb"
                h={8}
                opacity={0.7}
                _hover={{ opacity: 1 }}
              />
              <Image
                src="/images/binance.png"
                alt="Binance"
                h={8}
                opacity={0.7}
                _hover={{ opacity: 1 }}
              />
              <Image
                src="/images/coinbase.png"
                alt="Coinbase"
                h={8}
                opacity={0.7}
                _hover={{ opacity: 1 }}
              />
              <Image
                src="/images/dropbox.png"
                alt="Dropbox"
                h={8}
                opacity={0.7}
                _hover={{ opacity: 1 }}
              />
            </Flex>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default Clients;
