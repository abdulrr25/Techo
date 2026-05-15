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

const Testimonials = () => {
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
              What people are saying about us
            </Heading>
            <Text fontSize="lg" color="gray.600" maxW="2xl">
              Hear from our satisfied users about their experience with our platform.
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
                name: "John Doe",
                role: "Student",
                text: "This platform has transformed my learning experience. The quality of education is outstanding!",
              },
              {
                name: "Jane Smith",
                role: "Teacher",
                text: "As an educator, I find this platform incredibly intuitive and effective for teaching.",
              },
              {
                name: "Mike Johnson",
                role: "Parent",
                text: "My child's academic performance has improved significantly since using this platform.",
              },
            ].map((testimonial, index) => (
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
                  <Text fontSize="lg" color="gray.600" mb={4}>
                    &quot;{testimonial.text}&quot;
                  </Text>
                  <Text fontWeight="bold" color="gray.800">
                    {testimonial.name}
                  </Text>
                  <Text color="gray.600">{testimonial.role}</Text>
                </Box>
              </MotionBox>
            ))}
          </Flex>
        </Stack>
      </Container>
    </Box>
  );
};

export default Testimonials;
