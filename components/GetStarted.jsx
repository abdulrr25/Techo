import {
  Box,
  Button,
  Flex,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const GetStarted = () => {
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");

  return (
    <MotionBox
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Button
        colorScheme="blue"
        size="lg"
        px={8}
        py={6}
        fontSize="md"
        rounded="full"
        _hover={{
          transform: "translateY(-2px)",
          boxShadow: "lg",
        }}
      >
        Get Started
      </Button>
    </MotionBox>
  );
};

export default GetStarted;
