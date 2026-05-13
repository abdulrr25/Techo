import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";

const CTA = () => {
  const bgColor = useColorModeValue("blue.500", "blue.600");
  const textColor = "white";
  const buttonBg = useColorModeValue("white", "gray.100");
  const buttonHoverBg = useColorModeValue("gray.100", "white");

  return (
    <Box bg={bgColor} py={20}>
      <Container maxW="container.xl">
        <Flex
          direction={{ base: "column", md: "row" }}
          align="center"
          justify="space-between"
          gap={8}
        >
          <Box flex="1" maxW={{ base: "100%", md: "60%" }}>
            <Heading
              as="h2"
              size="2xl"
              color={textColor}
              mb={4}
              fontWeight="bold"
              lineHeight="1.2"
            >
              Let's try our service now!
            </Heading>
            <Text fontSize="lg" color={textColor} opacity={0.9}>
              Everything you need to accept card payments and grow your business
              anywhere on the planet.
            </Text>
          </Box>

          <Box>
            <Button
              bg={buttonBg}
              color={bgColor}
              size="lg"
              px={8}
              py={6}
              fontSize="lg"
              fontWeight="bold"
              _hover={{ bg: buttonHoverBg }}
              _active={{ bg: buttonHoverBg }}
            >
              Get Started
            </Button>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default CTA;
