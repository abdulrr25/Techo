import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { baseSepolia } from "wagmi/chains";
import { http } from "wagmi";
// IMPORTANT: createConfig and WagmiProvider MUST both come from @privy-io/wagmi,
// NOT from wagmi. @privy-io/wagmi's createConfig adds ssr:true,
// multiInjectedProviderDiscovery:false, and strips non-Privy connectors so
// useSyncPrivyWallets can inject the embedded wallet connector after login.
// Using wagmi's createConfig breaks the bridge and leaves useAccount() empty.
import { WagmiProvider, createConfig } from "@privy-io/wagmi";
import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import "../styles/globals.css";

const theme = extendTheme({
  config: { initialColorMode: "dark", useSystemColorMode: false },
  fonts: {
    heading: `'Inter', system-ui, sans-serif`,
    body:    `'Inter', system-ui, sans-serif`,
    mono:    `'JetBrains Mono', monospace`,
  },
  styles: {
    global: {
      body: {
        bg: "#000000",
        color: "#fafafa",
        fontFamily: "'Inter', system-ui, sans-serif",
        WebkitFontSmoothing: "antialiased",
        textRendering: "optimizeLegibility",
      },
      "::selection": { bg: "rgba(255,255,255,0.18)", color: "#fff" },
    },
  },
  colors: {
    brand: {
      50:  "#eff6ff",
      400: "#60a5fa",
      500: "#0075ff",
      600: "#1f86ff",
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontFamily: "'Inter', system-ui, sans-serif",
        fontWeight: "500",
        borderRadius: "9999px",
        lineHeight: "1",
        letterSpacing: "-0.01em",
        transition: "all 0.2s ease",
        _focus: { boxShadow: "none" },
        _focusVisible: { boxShadow: "0 0 0 2px rgba(0,117,255,0.5)" },
      },
      sizes: {
        sm: { h: "32px", px: "14px", fontSize: "13px" },
        md: { h: "40px", px: "18px", fontSize: "15px" },
        lg: { h: "48px", px: "24px", fontSize: "16px" },
      },
      variants: {
        solid: {
          bg: "#0075ff",
          color: "#f5f5f5",
          _hover: { bg: "#1f86ff", _disabled: { bg: "#0075ff" } },
          _active: { bg: "#005fcc" },
        },
        outline: {
          bg: "transparent",
          color: "white",
          border: "1px solid rgba(255,255,255,0.22)",
          _hover: { bg: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.4)" },
        },
        ghost: {
          bg: "rgba(255,255,255,0.04)",
          color: "#fafafa",
          border: "1px solid rgba(255,255,255,0.08)",
          _hover: { bg: "rgba(255,255,255,0.07)", borderColor: "rgba(255,255,255,0.18)" },
        },
        secondary: {
          bg: "rgba(255,255,255,0.16)",
          color: "#f5f5f5",
          _hover: { bg: "rgba(255,255,255,0.22)" },
        },
      },
      defaultProps: { variant: "solid", size: "md" },
    },
    Input: {
      variants: {
        outline: {
          field: {
            bg: "#0a0a0a",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#fafafa",
            borderRadius: "12px",
            fontFamily: "'Inter', system-ui, sans-serif",
            _placeholder: { color: "#71717a" },
            _hover: { borderColor: "rgba(255,255,255,0.16)" },
            _focus: { borderColor: "rgba(0,117,255,0.7)", boxShadow: "0 0 0 1px rgba(0,117,255,0.4)" },
          },
        },
      },
      defaultProps: { variant: "outline" },
    },
    Textarea: {
      variants: {
        outline: {
          bg: "#0a0a0a",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "#fafafa",
          borderRadius: "12px",
          fontFamily: "'Inter', system-ui, sans-serif",
          _placeholder: { color: "#71717a" },
          _hover: { borderColor: "rgba(255,255,255,0.16)" },
          _focus: { borderColor: "rgba(0,117,255,0.7)", boxShadow: "0 0 0 1px rgba(0,117,255,0.4)" },
        },
      },
      defaultProps: { variant: "outline" },
    },
  },
});

// No connectors here — Privy's WagmiProvider injects them based on how the
// user authenticates (MetaMask connector for wallet login, privy connector for
// email/google embedded wallets). Keeping injected() would cause duplicates.
const wagmiConfig = createConfig({
  chains: [baseSepolia],
  transports: { [baseSepolia.id]: http(process.env.NEXT_PUBLIC_RPC_URL) },
});

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 30_000 } },
});

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: "1rem", fontFamily: "'Inter', sans-serif",
      background: "#000000", color: "#fafafa", padding: "2rem", textAlign: "center",
    }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: "600" }}>Something went wrong</h2>
      <p style={{ color: "#71717a", maxWidth: "400px", fontSize: "14px" }}>{error?.message}</p>
      <button onClick={resetErrorBoundary} style={{
        padding: "9px 18px", background: "#0075ff", color: "white",
        border: "none", borderRadius: "9999px", cursor: "pointer",
        fontWeight: "500", fontSize: "15px", fontFamily: "'Inter', sans-serif",
      }}>
        Try Again
      </button>
    </div>
  );
}

function MyApp({ Component, pageProps }) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
      {/*
        Provider nesting order matters:
        PrivyProvider  — manages auth session (MetaMask / email / google)
          QueryClientProvider — react-query (Privy needs this available)
            WagmiProvider (@privy-io/wagmi) — bridges Privy wallets into wagmi
              ChakraProvider — UI theme
      */}
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
        config={{
          loginMethods: ["wallet", "email", "google"],
          embeddedWallets: {
            // Only create a wallet for users who log in via email/google.
            // MetaMask users already have a wallet — don't create a duplicate.
            createOnLogin: "users-without-wallets",
          },
          defaultChain: baseSepolia,
          supportedChains: [baseSepolia],
          appearance: {
            theme: "dark",
            accentColor: "#0075ff",   // Matches Teacho's Morphic blue
            walletList: ["metamask", "detected_wallets"],
          },
        }}
      >
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={wagmiConfig}>
            <ChakraProvider
              theme={theme}
              toastOptions={{ defaultOptions: { position: "top-right", duration: 5000 } }}
            >
              <Component {...pageProps} />
            </ChakraProvider>
          </WagmiProvider>
        </QueryClientProvider>
      </PrivyProvider>
    </ErrorBoundary>
  );
}

export default MyApp;
