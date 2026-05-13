import { features } from "../constants";
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

const Business = () => {
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
              You do the business, we'll handle the money.
            </Heading>
            <Text fontSize="lg" color={textColor} opacity={0.9} mb={8}>
              With the right credit card, you can improve your financial life by
              building credit, earning rewards and saving money. But with hundreds
              of credit cards on the market.
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
            <Flex direction="column" gap={6}>
              {features.map((feature, index) => (
                <Flex
                  key={feature.id}
                  align="center"
                  gap={4}
                  p={4}
                  borderRadius="lg"
                  bg={useColorModeValue("gray.50", "gray.700")}
                  _hover={{
                    transform: "translateY(-2px)",
                    transition: "all 0.2s",
                  }}
                >
                  <Box
                    w={12}
                    h={12}
                    borderRadius="full"
                    bg={useColorModeValue("blue.100", "blue.900")}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Image
                      src={feature.icon}
                      alt={feature.title}
                      w={6}
                      h={6}
                    />
                  </Box>
                  <Box>
                    <Heading as="h3" size="md" color={textColor} mb={2}>
                      {feature.title}
                    </Heading>
                    <Text color={textColor} opacity={0.9}>
                      {feature.content}
                    </Text>
                  </Box>
                </Flex>
              ))}
            </Flex>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default Business;
