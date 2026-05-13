import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Image,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";

const CardDeal = () => {
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const buttonBg = useColorModeValue("blue.500", "blue.400");
  const buttonHoverBg = useColorModeValue("blue.600", "blue.500");

  return (
    <Box bg={bgColor} py={20}>
      <Container maxW="container.xl">
        <Flex
          direction={{ base: "column", md: "row" }}
          align="center"
          justify="space-between"
          gap={8}
        >
          <Box flex="1" maxW={{ base: "100%", md: "50%" }}>
            <Heading
              as="h2"
              size="2xl"
              color={textColor}
              mb={4}
              fontWeight="bold"
              lineHeight="1.2"
            >
              Find a better card deal in a few easy steps.
            </Heading>
            <Text fontSize="lg" color={textColor} opacity={0.9} mb={8}>
              Arcu tortor, purus in mattis at sed integer faucibus. Aliquet quis
              aliquet eget mauris tortor.ç Aliquet ultrices ac, ametau.
            </Text>
            <Button
              bg={buttonBg}
              color="white"
              size="lg"
              _hover={{ bg: buttonHoverBg }}
              _active={{ bg: buttonHoverBg }}
            >
              Get Started
            </Button>
          </Box>

          <Box flex="1" maxW={{ base: "100%", md: "50%" }}>
            <Image
              src="/images/card.png"
              alt="Card Deal"
              w="full"
              h="auto"
              objectFit="contain"
            />
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default CardDeal;
