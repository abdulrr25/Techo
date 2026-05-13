import { useState, useCallback, useEffect } from "react";
import { BrowserProvider, Contract, parseEther, formatEther } from "ethers";
import { CFA_FORWARDER_ABI, SUPER_TOKEN_ABI } from "../constants/superfluidAbi";

const FORWARDER_ADDRESS = process.env.NEXT_PUBLIC_FORWARDER_ADDRESS;
const SUPER_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_SUPER_TOKEN_ADDRESS;

// Status: idle | wrapping | creating | streaming | deleting | stopped | error
export function useStream({ senderAddress, receiverAddress, flowRate }) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [ethxBalance, setEthxBalance] = useState(null);
  const [activeFlowRate, setActiveFlowRate] = useState(null);
  const [elapsed, setElapsed] = useState(0); // seconds since stream started
  const [streamStartTime, setStreamStartTime] = useState(null);

  // ── Tick elapsed seconds while streaming ───────────────────────────────────
  useEffect(() => {
    if (status !== "streaming" || !streamStartTime) return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - streamStartTime) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [status, streamStartTime]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getSigner = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("MetaMask not found");
    }
    const provider = new BrowserProvider(window.ethereum);
    return provider.getSigner();
  };

  const getForwarder = async (signer) =>
    new Contract(FORWARDER_ADDRESS, CFA_FORWARDER_ABI, signer);

  const getSuperToken = async (signer) =>
    new Contract(SUPER_TOKEN_ADDRESS, SUPER_TOKEN_ABI, signer);

  // ── Read ETHx balance ──────────────────────────────────────────────────────
  const refreshBalance = useCallback(async () => {
    if (!senderAddress) return;
    try {
      const signer = await getSigner();
      const token = await getSuperToken(signer);
      const bal = await token.balanceOf(senderAddress);
      setEthxBalance(bal);
    } catch (err) {
      console.error("Balance check failed:", err);
    }
  }, [senderAddress]);

  // ── Wrap ETH → ETHx ────────────────────────────────────────────────────────
  const wrapEth = useCallback(
    async (amountEth) => {
      setError(null);
      setStatus("wrapping");
      try {
        const signer = await getSigner();
        const token = await getSuperToken(signer);
        const tx = await token.upgradeByETH({ value: parseEther(String(amountEth)) });
        await tx.wait();
        await refreshBalance();
        setStatus("idle");
        return true;
      } catch (err) {
        const msg = err?.reason || err?.message || "Wrap failed";
        setError(msg);
        setStatus("error");
        throw err;
      }
    },
    [refreshBalance]
  );

  // ── Check if a live flow exists ────────────────────────────────────────────
  const checkExistingStream = useCallback(async () => {
    if (!senderAddress || !receiverAddress) return null;
    try {
      const signer = await getSigner();
      const forwarder = await getForwarder(signer);
      const rate = await forwarder.getFlowrate(
        SUPER_TOKEN_ADDRESS,
        senderAddress,
        receiverAddress
      );
      return rate; // int96 as BigInt; 0n if no stream
    } catch (err) {
      console.error("getFlowrate failed:", err);
      return null;
    }
  }, [senderAddress, receiverAddress]);

  // ── Create stream ──────────────────────────────────────────────────────────
  const createStream = useCallback(async () => {
    if (!senderAddress || !receiverAddress || !flowRate) {
      throw new Error("Missing stream parameters");
    }
    setError(null);
    setStatus("creating");
    try {
      // Guard: don't double-create
      const existing = await checkExistingStream();
      if (existing && existing > 0n) {
        setStatus("streaming");
        setActiveFlowRate(existing);
        setStreamStartTime(Date.now());
        return;
      }

      const signer = await getSigner();
      const forwarder = await getForwarder(signer);

      // flowRate is stored as BigInt from the contract (wei/second)
      const rate = BigInt(flowRate.toString());

      const tx = await forwarder.createFlow(
        SUPER_TOKEN_ADDRESS,
        senderAddress,
        receiverAddress,
        rate,
        "0x" // no userData
      );
      await tx.wait();

      setStatus("streaming");
      setActiveFlowRate(rate);
      setStreamStartTime(Date.now());
      await refreshBalance();
    } catch (err) {
      const msg = err?.reason || err?.message || "Stream creation failed";
      setError(msg);
      setStatus("error");
      throw err;
    }
  }, [senderAddress, receiverAddress, flowRate, checkExistingStream, refreshBalance]);

  // ── Delete stream ──────────────────────────────────────────────────────────
  const deleteStream = useCallback(async () => {
    if (!senderAddress || !receiverAddress) return;
    setError(null);
    setStatus("deleting");
    try {
      // Check if stream actually exists before trying to delete
      const existing = await checkExistingStream();
      if (!existing || existing === 0n) {
        setStatus("stopped");
        return;
      }

      const signer = await getSigner();
      const forwarder = await getForwarder(signer);

      const tx = await forwarder.deleteFlow(
        SUPER_TOKEN_ADDRESS,
        senderAddress,
        receiverAddress,
        "0x"
      );
      await tx.wait();

      setStatus("stopped");
      setActiveFlowRate(null);
      await refreshBalance();
    } catch (err) {
      const msg = err?.reason || err?.message || "Stream deletion failed";
      setError(msg);
      // Don't block leave even if delete fails — user is leaving anyway
      setStatus("stopped");
      console.error("deleteFlow error:", err);
    }
  }, [senderAddress, receiverAddress, checkExistingStream, refreshBalance]);

  // ── Computed helpers ───────────────────────────────────────────────────────
  const isStreaming = status === "streaming";
  const isLoading = ["wrapping", "creating", "deleting"].includes(status);

  // How much has been streamed so far (in ETH string)
  const amountStreamed =
    activeFlowRate && elapsed > 0
      ? formatEther((activeFlowRate * BigInt(elapsed)).toString())
      : "0";

  // Per-second rate as readable ETH string
  const ratePerSecond = activeFlowRate
    ? formatEther(activeFlowRate.toString())
    : flowRate
    ? formatEther(BigInt(flowRate.toString()).toString())
    : "0";

  return {
    status,
    error,
    isStreaming,
    isLoading,
    ethxBalance,
    activeFlowRate,
    elapsed,
    amountStreamed,
    ratePerSecond,
    wrapEth,
    createStream,
    deleteStream,
    refreshBalance,
    checkExistingStream,
  };
}
