/**
 * @file config.js
 * @description Configuration settings for the Teacho application
 * @requires ethers
 */

// Default network configuration
const DEFAULT_NETWORK = {
  name: "Polygon Mumbai",
  chainId: 80001,
  rpcUrl: "https://rpc-mumbai.maticvigil.com",
  explorerUrl: "https://mumbai.polygonscan.com",
};

// Environment variable validation
const validateEnvVars = () => {
  const requiredVars = [
    "NEXT_PUBLIC_HUDDLE_API_KEY",
    "NEXT_PUBLIC_PROJECT_ID",
    "NEXT_PUBLIC_CLIENT_KEY",
    "NEXT_PUBLIC_SERVER_KEY",
    "NEXT_PUBLIC_APP_ID",
  ];

  const missingVars = requiredVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
    return false;
  }

  return true;
};

// Contract addresses
const CONTRACT_ADDRESSES = {
  TEACHO: process.env.NEXT_PUBLIC_TEACHO_CONTRACT || "",
  FORWARDER: process.env.NEXT_PUBLIC_FORWARDER_CONTRACT || "",
  SUPER_TOKEN: process.env.NEXT_PUBLIC_SUPER_TOKEN_CONTRACT || "",
};

// Huddle01 configuration
const HUDDLE_CONFIG = {
  API_KEY: process.env.NEXT_PUBLIC_HUDDLE_API_KEY,
  PROJECT_ID: process.env.NEXT_PUBLIC_PROJECT_ID,
  CLIENT_KEY: process.env.NEXT_PUBLIC_CLIENT_KEY,
  SERVER_KEY: process.env.NEXT_PUBLIC_SERVER_KEY,
  APP_ID: process.env.NEXT_PUBLIC_APP_ID,
};

// Address validation
const validateAddress = (address) => {
  if (!address) return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Export configuration
module.exports = {
  DEFAULT_NETWORK,
  validateEnvVars,
  CONTRACT_ADDRESSES,
  HUDDLE_CONFIG,
  validateAddress,
};
