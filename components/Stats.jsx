import {
  Box,
  Container,
  Heading,
  Text,
  Flex,
  Stack,
  useColorModeValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const Stats = () => {
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");

  return (
    <Box as="section" py={20} bg={bgColor}>
      <Container maxW="container.xl">
        <Stack spacing={8} align="center" textAlign="center">
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
              Our Impact in Numbers
            </Heading>
            <Text fontSize="lg" color="gray.600" maxW="2xl">
              See how we&apos;re making a difference in education
            </Text>
          </MotionBox>
          <Flex
            direction={{ base: "column", md: "row" }}
            gap={8}
            justify="center"
            align="stretch"
          >
            {[
              {
                value: "10K+",
                label: "Active Students",
              },
              {
                value: "500+",
                label: "Expert Teachers",
              },
              {
                value: "1M+",
                label: "Hours of Learning",
              },
              {
                value: "95%",
                label: "Satisfaction Rate",
              },
            ].map((stat, index) => (
              <MotionBox
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                flex={1}
                maxW="md"
              >
                <Box
                  p={6}
                  bg="white"
                  rounded="lg"
                  shadow="lg"
                  borderWidth={1}
                  borderColor="gray.200"
                >
                  <Text fontSize="4xl" fontWeight="bold" color="blue.500" mb={2}>
                    {stat.value}
                  </Text>
                  <Text fontSize="lg" color="gray.600">
                    {stat.label}
                  </Text>
                </Box>
              </MotionBox>
            ))}
          </Flex>
        </Stack>
      </Container>
    </Box>
  );
};

export default Stats;
