import {
  Box,
  Container,
  Heading,
  Text,
  Image,
  Flex,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const Billing = () => {
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");

  return (
    <Box as="section" py={20} bg={bgColor}>
      <Container maxW="container.xl">
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
                as="h2"
                size="2xl"
                mb={6}
                color={textColor}
                fontWeight="bold"
              >
                Easily control your billing & invoicing.
              </Heading>
              <Text fontSize="lg" color="gray.600" mb={8}>
                Elit enim sed massa etiam. Mauris eu adipiscing ultrices ametodio
                aenean neque. Fusce ipsum orci rhoncus aliporttitor integer platea
                placerat.
              </Text>
              <Stack spacing={4}>
                <Flex align="center" gap={4}>
                  <Box
                    w={8}
                    h={8}
                    bg="blue.500"
                    rounded="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text color="white" fontWeight="bold">
                      ✓
                    </Text>
                  </Box>
                  <Text>Flexible payment options</Text>
                </Flex>
                <Flex align="center" gap={4}>
                  <Box
                    w={8}
                    h={8}
                    bg="blue.500"
                    rounded="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text color="white" fontWeight="bold">
                      ✓
                    </Text>
                  </Box>
                  <Text>Automatic invoice generation</Text>
                </Flex>
                <Flex align="center" gap={4}>
                  <Box
                    w={8}
                    h={8}
                    bg="blue.500"
                    rounded="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text color="white" fontWeight="bold">
                      ✓
                    </Text>
                  </Box>
                  <Text>Real-time payment tracking</Text>
                </Flex>
              </Stack>
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
                src="/assets/bill.png"
                alt="Billing illustration"
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

export default Billing;
