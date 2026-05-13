import {
  Box,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  Text,
  Link,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";

const Footer = () => {
  const bgColor = useColorModeValue("gray.900", "gray.800");
  const textColor = "white";
  const linkColor = "gray.400";

  return (
    <Box as="footer" bg={bgColor} color={textColor} py={20}>
      <Container maxW="container.xl">
        <Grid
          templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }}
          gap={8}
          mb={12}
        >
          <GridItem>
            <VStack align="start" spacing={4}>
              <Heading size="lg" mb={4}>
                Teacho
              </Heading>
              <Text color={linkColor}>
                A new way to make the payments easy, reliable and secure.
              </Text>
            </VStack>
          </GridItem>

          <GridItem>
            <VStack align="start" spacing={4}>
              <Heading size="md" mb={4}>
                Useful Links
              </Heading>
              <Link href="#" color={linkColor} _hover={{ color: "white" }}>
                Content
              </Link>
              <Link href="#" color={linkColor} _hover={{ color: "white" }}>
                How it Works
              </Link>
              <Link href="#" color={linkColor} _hover={{ color: "white" }}>
                Create
              </Link>
              <Link href="#" color={linkColor} _hover={{ color: "white" }}>
                Explore
              </Link>
            </VStack>
          </GridItem>

          <GridItem>
            <VStack align="start" spacing={4}>
              <Heading size="md" mb={4}>
                Community
              </Heading>
              <Link href="#" color={linkColor} _hover={{ color: "white" }}>
                Help Center
              </Link>
              <Link href="#" color={linkColor} _hover={{ color: "white" }}>
                Partners
              </Link>
              <Link href="#" color={linkColor} _hover={{ color: "white" }}>
                Suggestions
              </Link>
              <Link href="#" color={linkColor} _hover={{ color: "white" }}>
                Blog
              </Link>
            </VStack>
          </GridItem>

          <GridItem>
            <VStack align="start" spacing={4}>
              <Heading size="md" mb={4}>
                Partner
              </Heading>
              <Link href="#" color={linkColor} _hover={{ color: "white" }}>
                Our Partner
              </Link>
              <Link href="#" color={linkColor} _hover={{ color: "white" }}>
                Become a Partner
              </Link>
            </VStack>
          </GridItem>
        </Grid>

        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align="center"
          pt={8}
          borderTop="1px"
          borderColor="gray.700"
        >
          <Text color={linkColor}>
            Copyright © 2024 Teacho. All Rights Reserved.
          </Text>
          <HStack spacing={6} mt={{ base: 4, md: 0 }}>
            <Link href="#" color={linkColor} _hover={{ color: "white" }}>
              Terms & Services
            </Link>
            <Link href="#" color={linkColor} _hover={{ color: "white" }}>
              Privacy Policy
            </Link>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Footer;
