import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { HuddleClient, HuddleProvider } from "@huddle01/react";
import {
  useRoom,
  useLocalVideo,
  useLocalAudio,
  useLocalScreenShare,
  usePeerIds,
  useRemoteVideo,
  useRemoteAudio,
} from "@huddle01/react/hooks";
import { Audio, Video } from "@huddle01/react/components";
import { Role } from "@huddle01/server-sdk/auth";
import { useToast, Box, Text, Button, HStack, Spinner, Badge } from "@chakra-ui/react";
import {
  Mic, MicOff, Video as VideoIcon, VideoOff,
  Monitor, MonitorOff, PhoneOff, Users, Wifi, WifiOff,
} from "lucide-react";
import { useWeb3 } from "@/hooks/useWeb3";
import { useStream } from "@/hooks/useStream";
import { formatEther, parseEther } from "ethers";

const huddleClient = new HuddleClient({
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  options: {
    activeSpeakers: { size: 12 },
  },
});

// ── Remote peer tile ──────────────────────────────────────────────────────────
function RemotePeer({ peerId }) {
  const { stream: videoStream } = useRemoteVideo({ peerId });
  const { stream: audioStream } = useRemoteAudio({ peerId });

  return (
    <div style={{
      position: "relative", borderRadius: 16, overflow: "hidden",
      background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.08)",
      display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200,
    }}>
      {audioStream && <Audio stream={audioStream} />}
      {videoStream ? (
        <Video stream={videoStream} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "40px 0" }}>
          <div style={{
            background: "rgba(255,255,255,0.04)", borderRadius: "50%", padding: 24,
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <Users size={32} color="#3f3f46" />
          </div>
          <span style={{ color: "#52525b", fontSize: 13, fontFamily: "'Inter', sans-serif" }}>Camera off</span>
        </div>
      )}
      <div style={{
        position: "absolute", bottom: 10, left: 10,
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
        color: "#a1a1aa", fontSize: 11, padding: "3px 10px", borderRadius: 9999,
        fontFamily: "'JetBrains Mono', monospace",
        border: "1px solid rgba(255,255,255,0.08)",
      }}>
        {peerId.slice(0, 8)}…
      </div>
    </div>
  );
}

// ── Local video tile ──────────────────────────────────────────────────────────
function LocalTile({ isHost }) {
  const { stream } = useLocalVideo();
  return (
    <div style={{
      position: "relative", borderRadius: 16, overflow: "hidden",
      background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.08)",
      display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200,
    }}>
      {stream ? (
        <Video stream={stream} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "40px 0" }}>
          <div style={{
            background: "rgba(255,255,255,0.04)", borderRadius: "50%", padding: 24,
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <Users size={32} color="#3f3f46" />
          </div>
          <span style={{ color: "#52525b", fontSize: 13, fontFamily: "'Inter', sans-serif" }}>Camera off</span>
        </div>
      )}
      <div style={{
        position: "absolute", bottom: 10, left: 10,
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
        color: "#a1a1aa", fontSize: 11, padding: "3px 10px", borderRadius: 9999,
        fontFamily: "'JetBrains Mono', monospace",
        border: "1px solid rgba(255,255,255,0.08)",
      }}>
        You {isHost ? "(Host)" : "(Student)"}
      </div>
    </div>
  );
}

// ── Remote peers grid ─────────────────────────────────────────────────────────
function PeersGrid() {
  const { peerIds } = usePeerIds({ roles: [Role.HOST, Role.CO_HOST, Role.GUEST] });
  if (peerIds.length === 0) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", height: 192, gap: 10, color: "#3f3f46",
      }}>
        <Users size={28} />
        <p style={{ fontSize: 13, fontFamily: "'Inter', sans-serif" }}>Waiting for others to join…</p>
      </div>
    );
  }
  return (
    <>
      {peerIds.map((peerId) => (
        <RemotePeer key={peerId} peerId={peerId} />
      ))}
    </>
  );
}

// ── Stream status bar (students only) ────────────────────────────────────────
function StreamBar({ stream, onWrap }) {
  const { status, isStreaming, isLoading, ethxBalance, amountStreamed, ratePerSecond, elapsed, error } = stream;

  const balanceEth = ethxBalance != null ? parseFloat(formatEther(ethxBalance)).toFixed(4) : null;
  const hasBalance = ethxBalance != null && ethxBalance > 0n;

  return (
    <div style={{
      background: "#0a0a0a", borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: "8px 16px", display: "flex", alignItems: "center",
      justifyContent: "space-between", flexWrap: "wrap", gap: 8, fontSize: 12,
    }}>
      {/* Stream status */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {isStreaming ? (
          <>
            <span style={{ width: 7, height: 7, background: "#22c55e", borderRadius: "50%", display: "inline-block", animation: "pulseGlow 2s ease-in-out infinite" }} />
            <span style={{ color: "#22c55e", fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>Stream Active</span>
          </>
        ) : isLoading ? (
          <>
            <Spinner size="xs" color="yellow.400" />
            <span style={{ color: "#eab308", textTransform: "capitalize", fontFamily: "'Inter', sans-serif" }}>{status}…</span>
          </>
        ) : status === "error" ? (
          <>
            <WifiOff size={12} color="#f87171" />
            <span style={{ color: "#f87171", fontFamily: "'Inter', sans-serif" }}>Stream error</span>
          </>
        ) : (
          <>
            <Wifi size={12} color="#3f3f46" />
            <span style={{ color: "#3f3f46", textTransform: "capitalize", fontFamily: "'Inter', sans-serif" }}>{status}</span>
          </>
        )}
      </div>

      {/* Live meter */}
      {isStreaming && (
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span style={{ color: "#71717a", fontFamily: "'Inter', sans-serif" }}>
            Rate:{" "}
            <span style={{ color: "#fafafa", fontFamily: "'JetBrains Mono', monospace" }}>
              {parseFloat(ratePerSecond).toFixed(8)} ETHx/s
            </span>
          </span>
          <span style={{ color: "#71717a", fontFamily: "'Inter', sans-serif" }}>
            Streamed:{" "}
            <span style={{ color: "#60a5fa", fontFamily: "'JetBrains Mono', monospace" }}>
              {parseFloat(amountStreamed).toFixed(8)} ETHx
            </span>
          </span>
          <span style={{ color: "#71717a", fontFamily: "'Inter', sans-serif" }}>
            Time:{" "}
            <span style={{ color: "#fafafa", fontFamily: "'JetBrains Mono', monospace" }}>{elapsed}s</span>
          </span>
        </div>
      )}

      {/* ETHx balance + wrap button */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {balanceEth !== null && (
          <span style={{ color: "#71717a", fontFamily: "'Inter', sans-serif" }}>
            Balance:{" "}
            <span style={{
              color: hasBalance ? "#22c55e" : "#f87171",
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {balanceEth} ETHx
            </span>
          </span>
        )}
        {ethxBalance !== null && !hasBalance && !isStreaming && (
          <button
            onClick={onWrap}
            style={{
              fontSize: 12, background: "#0075ff", color: "#fff",
              padding: "4px 12px", borderRadius: 9999, border: "none", cursor: "pointer",
              fontFamily: "'Inter', sans-serif", fontWeight: 500,
              transition: "background 0.15s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#1f86ff"}
            onMouseLeave={e => e.currentTarget.style.background = "#0075ff"}
          >
            Wrap ETH → ETHx
          </button>
        )}
      </div>

      {/* Error detail */}
      {error && (
        <span style={{ color: "#f87171", fontSize: 12, width: "100%", fontFamily: "'Inter', sans-serif" }}>
          {error}
        </span>
      )}
    </div>
  );
}

// ── Control bar ───────────────────────────────────────────────────────────────
function Controls({ onLeave, isLeavingDisabled }) {
  const { enableVideo, disableVideo, isVideoOn } = useLocalVideo();
  const { enableAudio, disableAudio, isAudioOn } = useLocalAudio();
  const [leaving, setLeaving] = useState(false);
  // Track screen-share ourselves — SDK's shareStream can be stale when
  // the internal videoProduce() fails async without emitting stream-closed.
  const [screenSharing, setScreenSharing] = useState(false);
  const toast = useToast();

  const { startScreenShare, stopScreenShare } = useLocalScreenShare({
    onProduceStart: () => setScreenSharing(true),
    onProduceClose: () => setScreenSharing(false),
    onProduceError: () => setScreenSharing(false),
  });

  // The SDK wraps device errors as "❌ Error Fetching Stream From Device"
  // before re-throwing — the original NotFoundError string is only in SDK logs.
  const friendlyMediaError = (err, label) => {
    const msg = err?.message || "";
    if (
      msg.includes("NotFoundError") ||
      msg.includes("Requested device not found") ||
      msg.includes("Error Fetching Stream From Device") ||
      msg.includes("Stream Not Found")
    ) {
      return `No ${label.toLowerCase()} device found. Check that your ${label.toLowerCase()} is plugged in and browser permissions are granted.`;
    }
    if (msg.includes("NotAllowedError") || msg.includes("Permission denied")) {
      return `${label} access denied. Allow ${label.toLowerCase()} in your browser settings, then rejoin.`;
    }
    if (msg.includes("NotReadableError") || msg.includes("device in use")) {
      return `${label} is already in use by another app. Close other tabs/apps using it and try again.`;
    }
    return msg || `${label} error`;
  };

  const toggle = async (isOn, enable, disable, label) => {
    try {
      if (isOn) await disable();
      else await enable();
    } catch (err) {
      toast({
        title: `${label} unavailable`,
        description: friendlyMediaError(err, label),
        status: "warning",
        duration: 6000,
        isClosable: true,
      });
    }
  };

  // Screen share handler owns the UI state completely.
  // We try VP8 codec first to avoid the RTP header extension ID collision
  // that Chrome triggers when re-using extension IDs across multiple transports.
  const handleScreenShare = async () => {
    if (screenSharing) {
      // Attempt stop — swallow all errors because the SDK producer may have
      // already self-destructed after the async videoProduce failure.
      try { await stopScreenShare(); } catch { /* noop */ }
      setScreenSharing(false);
    } else {
      try {
        // VP8 avoids the "RTP extension ID reassignment" SDP collision that
        // Chrome triggers with VP9/H264 when multiple send-transports coexist.
        await startScreenShare({ prefferedCodec: "VP8" });
        // onProduceStart callback sets screenSharing = true when transport succeeds
      } catch (err) {
        setScreenSharing(false);
        const msg = err?.message || "";
        // User dismissed the browser share picker — no toast needed
        if (
          msg.includes("Permission denied") ||
          msg.includes("NotAllowedError") ||
          msg.includes("The user aborted") ||
          msg.includes("user denied")
        ) return;
        toast({
          title: "Screen share failed",
          description: msg.includes("Stream Not Found") || msg.includes("ShareStream")
            ? "Could not capture screen. Try again or check browser permissions."
            : msg || "Could not start screen share.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const isSharing = screenSharing;

  const handleLeave = async () => {
    setLeaving(true);
    try { await onLeave(); }
    finally { setLeaving(false); }
  };

  const btnBase = {
    width: 48, height: 48, borderRadius: "50%", border: "none", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease",
    outline: "none",
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "16px 0" }}>
      <div style={{
        display: "flex", gap: 10,
        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(20px)",
        padding: "10px 20px", borderRadius: 9999,
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.9), 0 1px 0 rgba(255,255,255,0.04) inset",
      }}>
        {/* Video */}
        <button
          title={isVideoOn ? "Turn off camera" : "Turn on camera"}
          onClick={() => toggle(isVideoOn, enableVideo, disableVideo, "Video")}
          style={{
            ...btnBase,
            background: isVideoOn ? "rgba(255,255,255,0.08)" : "rgba(239,68,68,0.85)",
          }}
          onMouseEnter={e => e.currentTarget.style.background = isVideoOn ? "rgba(255,255,255,0.14)" : "rgba(239,68,68,1)"}
          onMouseLeave={e => e.currentTarget.style.background = isVideoOn ? "rgba(255,255,255,0.08)" : "rgba(239,68,68,0.85)"}
        >
          {isVideoOn
            ? <VideoIcon size={19} color="#fafafa" />
            : <VideoOff size={19} color="#fafafa" />}
        </button>

        {/* Audio */}
        <button
          title={isAudioOn ? "Mute" : "Unmute"}
          onClick={() => toggle(isAudioOn, enableAudio, disableAudio, "Audio")}
          style={{
            ...btnBase,
            background: isAudioOn ? "rgba(255,255,255,0.08)" : "rgba(239,68,68,0.85)",
          }}
          onMouseEnter={e => e.currentTarget.style.background = isAudioOn ? "rgba(255,255,255,0.14)" : "rgba(239,68,68,1)"}
          onMouseLeave={e => e.currentTarget.style.background = isAudioOn ? "rgba(255,255,255,0.08)" : "rgba(239,68,68,0.85)"}
        >
          {isAudioOn
            ? <Mic size={19} color="#fafafa" />
            : <MicOff size={19} color="#fafafa" />}
        </button>

        {/* Screen share */}
        <button
          title={isSharing ? "Stop sharing" : "Share screen"}
          onClick={handleScreenShare}
          style={{
            ...btnBase,
            background: isSharing ? "#0075ff" : "rgba(255,255,255,0.08)",
          }}
          onMouseEnter={e => e.currentTarget.style.background = isSharing ? "#1f86ff" : "rgba(255,255,255,0.14)"}
          onMouseLeave={e => e.currentTarget.style.background = isSharing ? "#0075ff" : "rgba(255,255,255,0.08)"}
        >
          {isSharing
            ? <MonitorOff size={19} color="#fafafa" />
            : <Monitor size={19} color="#fafafa" />}
        </button>

        {/* Divider */}
        <div style={{ width: 1, background: "rgba(255,255,255,0.08)", margin: "6px 2px" }} />

        {/* Leave */}
        <button
          title="Leave"
          onClick={handleLeave}
          disabled={leaving || isLeavingDisabled}
          style={{
            ...btnBase,
            background: "rgba(239,68,68,0.85)",
            opacity: (leaving || isLeavingDisabled) ? 0.5 : 1,
            cursor: (leaving || isLeavingDisabled) ? "not-allowed" : "pointer",
          }}
          onMouseEnter={e => { if (!leaving && !isLeavingDisabled) e.currentTarget.style.background = "rgba(239,68,68,1)"; }}
          onMouseLeave={e => { if (!leaving && !isLeavingDisabled) e.currentTarget.style.background = "rgba(239,68,68,0.85)"; }}
        >
          {leaving ? <Spinner size="sm" color="white" /> : <PhoneOff size={19} color="#fafafa" />}
        </button>
      </div>
    </div>
  );
}

// ── ETHx wrap modal ───────────────────────────────────────────────────────────
function WrapModal({ onWrap, onClose }) {
  const [amount, setAmount] = useState("0.01");
  const [loading, setLoading] = useState(false);

  const handleWrap = async () => {
    setLoading(true);
    try { await onWrap(amount); onClose(); }
    catch { /* error shown in stream bar */ }
    finally { setLoading(false); }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16,
    }}>
      <div style={{
        background: "#0a0a0a", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)",
        padding: 28, width: "100%", maxWidth: 380,
        boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset, 0 24px 64px rgba(0,0,0,0.9)",
      }}>
        {/* Top accent */}
        <div style={{ height: 1, background: "linear-gradient(to right, rgba(0,117,255,0.7), rgba(56,189,248,0.3), transparent)", marginBottom: 20, marginLeft: -28, marginRight: -28 }} />

        <h3 style={{
          color: "#fafafa", fontWeight: 700, fontSize: 18, marginBottom: 8,
          letterSpacing: "-0.03em", fontFamily: "'Inter', sans-serif",
        }}>
          Wrap ETH → ETHx
        </h3>
        <p style={{ color: "#71717a", fontSize: 13, marginBottom: 20, lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>
          You need ETHx (Super ETH) to stream payments. Wrap some ETH first.
        </p>

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          step="0.001"
          min="0.001"
          style={{
            width: "100%", background: "#111113", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12, padding: "11px 14px", color: "#fafafa", marginBottom: 16,
            outline: "none", fontSize: 14, fontFamily: "'JetBrains Mono', monospace",
            transition: "border-color 0.2s",
          }}
          onFocus={e => e.currentTarget.style.borderColor = "rgba(0,117,255,0.7)"}
          onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
          placeholder="Amount in ETH"
        />

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleWrap}
            disabled={loading}
            style={{
              flex: 1, background: "#0075ff", color: "#fff", padding: "11px 0",
              borderRadius: 9999, border: "none", cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 500, fontSize: 14, fontFamily: "'Inter', sans-serif",
              opacity: loading ? 0.5 : 1, transition: "background 0.15s ease",
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#1f86ff"; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#0075ff"; }}
          >
            {loading ? "Wrapping…" : "Wrap ETH"}
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1, background: "transparent", color: "#a1a1aa", padding: "11px 0",
              borderRadius: 9999, border: "1px solid rgba(255,255,255,0.12)", cursor: "pointer",
              fontWeight: 500, fontSize: 14, fontFamily: "'Inter', sans-serif",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#fafafa"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#a1a1aa"; }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main room logic ───────────────────────────────────────────────────────────
function RoomContent({ roomId, hostAddress, flowRate }) {
  const { joinRoom, leaveRoom, state } = useRoom();
  const [joinError, setJoinError] = useState(null);
  const [showWrapModal, setShowWrapModal] = useState(false);
  const joinedRef = useRef(false);
  const router = useRouter();
  const toast = useToast();
  const { account } = useWeb3();

  const isHost = account && hostAddress
    ? account.toLowerCase() === hostAddress.toLowerCase()
    : false;

  // Superfluid stream — only relevant for students
  const stream = useStream({
    senderAddress: !isHost ? account : null,
    receiverAddress: !isHost ? hostAddress : null,
    flowRate: !isHost ? flowRate : null,
  });

  // ── Step 1: Join Huddle room ────────────────────────────────────────────────
  useEffect(() => {
    if (!roomId || !account || joinedRef.current) return;
    let mounted = true;

    (async () => {
      try {
        const hostFlag = hostAddress && account.toLowerCase() === hostAddress.toLowerCase();
        const res = await fetch(`/api/getAccessToken?roomId=${roomId}&isHost=${!!hostFlag}`);
        const data = await res.json();
        if (!res.ok || !data.token) throw new Error(data.error || "No token returned");
        if (!mounted) return;
        joinedRef.current = true;
        await joinRoom({ roomId, token: data.token });
      } catch (err) {
        if (mounted) {
          setJoinError(err.message);
          toast({ title: "Failed to join", description: err.message, status: "error", duration: 8000, isClosable: true });
        }
      }
    })();

    return () => { mounted = false; };
  }, [roomId, account]);

  // ── Step 2: Once connected, start Superfluid stream (students only) ─────────
  // createStream() internally calls getFlowrate first — if a stream already
  // exists (e.g. student rejoined) it sets status → "streaming" without
  // sending a new tx. Never skip it with an early return, or the StreamBar
  // stays "idle" and handleLeave won't call deleteStream on exit.
  useEffect(() => {
    if (state !== "connected" || isHost || !account || !hostAddress || !flowRate) return;

    (async () => {
      try {
        // Fetch ETHx balance so StreamBar shows correct balance immediately
        await stream.refreshBalance();

        // Small delay to let the room settle before opening transport
        await new Promise((r) => setTimeout(r, 1500));

        const wasAlreadyStreaming = stream.status === "streaming";
        await stream.createStream();

        if (!wasAlreadyStreaming) {
          toast({
            title: "Payment stream started",
            description: "ETHx is flowing to the teacher per second.",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
        }
      } catch (err) {
        if (err?.message?.includes("insufficient") || err?.message?.includes("balance")) {
          setShowWrapModal(true);
        } else {
          toast({
            title: "Stream failed",
            description: err?.message || "Could not start payment stream",
            status: "warning",
            duration: 8000,
            isClosable: true,
          });
        }
      }
    })();
  }, [state, isHost, account, hostAddress, flowRate]);

  // ── Leave: stop stream then leave room ────────────────────────────────────
  const handleLeave = useCallback(async () => {
    if (!isHost && stream.isStreaming) {
      toast({ title: "Stopping payment stream…", status: "info", duration: 3000, isClosable: true });
      await stream.deleteStream();
      toast({ title: "Payment stopped", description: "You've been charged only for time in the class.", status: "success", duration: 5000, isClosable: true });
    }
    await leaveRoom();
    joinedRef.current = false;
    router.push("/my-classes");
  }, [isHost, stream, leaveRoom, router, toast]);

  // ── Error screen ──────────────────────────────────────────────────────────
  if (joinError) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#000000", fontFamily: "'Inter', sans-serif" }}>
        <div style={{ textAlign: "center", maxWidth: 440, padding: "0 24px" }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>⚠️</div>
          <h2 style={{ color: "#fafafa", fontSize: 24, fontWeight: 700, marginBottom: 12, letterSpacing: "-0.03em" }}>
            Failed to join
          </h2>
          <p style={{ color: "#71717a", marginBottom: 28, lineHeight: 1.6, fontSize: 14 }}>{joinError}</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button
              onClick={() => { setJoinError(null); joinedRef.current = false; }}
              style={{
                padding: "10px 22px", background: "#0075ff", color: "#fff", border: "none",
                borderRadius: 9999, cursor: "pointer", fontWeight: 500, fontSize: 14,
                fontFamily: "'Inter', sans-serif", transition: "background 0.15s ease",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#1f86ff"}
              onMouseLeave={e => e.currentTarget.style.background = "#0075ff"}
            >
              Retry
            </button>
            <button
              onClick={() => router.push("/my-classes")}
              style={{
                padding: "10px 22px", background: "transparent", color: "#a1a1aa",
                border: "1px solid rgba(255,255,255,0.15)", borderRadius: 9999, cursor: "pointer",
                fontWeight: 500, fontSize: 14, fontFamily: "'Inter', sans-serif",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#fafafa"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#a1a1aa"; }}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Connecting screen ─────────────────────────────────────────────────────
  if (state !== "connected") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#000000", fontFamily: "'Inter', sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 48, height: 48, margin: "0 auto 24px",
            border: "3px solid rgba(255,255,255,0.08)",
            borderTop: "3px solid #0075ff",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
          <h2 style={{ color: "#fafafa", fontSize: 18, fontWeight: 600, marginBottom: 8, letterSpacing: "-0.02em" }}>
            {state === "connecting" ? "Connecting to room…" : "Joining session…"}
          </h2>
          <p style={{ color: "#71717a", fontSize: 13 }}>Please wait</p>
        </div>
      </div>
    );
  }

  // ── In-meeting screen ─────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#000000", color: "#fafafa", display: "flex", flexDirection: "column", fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", height: 60, flexShrink: 0,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(0,0,0,0.8)", backdropFilter: "blur(18px)",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0"  y="8" width="4" height="8" rx="1" fill="white" opacity="0.45"/>
            <rect x="7"  y="4" width="4" height="12" rx="1" fill="white" opacity="0.72"/>
            <rect x="14" y="0" width="4" height="16" rx="1" fill="white"/>
          </svg>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.04em", color: "#fafafa" }}>Teacho</span>
        </div>

        {/* Right: meta */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            fontSize: 11, color: "#52525b", padding: "3px 10px", borderRadius: 9999,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {roomId}
          </span>

          {isHost ? (
            <span style={{
              fontSize: 11, padding: "3px 10px", borderRadius: 9999, fontWeight: 600,
              background: "rgba(139,92,246,0.12)", color: "#a78bfa",
              border: "1px solid rgba(139,92,246,0.2)", fontFamily: "'Inter', sans-serif",
            }}>
              Host
            </span>
          ) : (
            <span style={{
              fontSize: 11, padding: "3px 10px", borderRadius: 9999, fontWeight: 600,
              background: stream.isStreaming ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.05)",
              color: stream.isStreaming ? "#22c55e" : "#71717a",
              border: stream.isStreaming ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(255,255,255,0.07)",
              fontFamily: "'Inter', sans-serif",
            }}>
              {stream.isStreaming ? "💸 Streaming" : "Student"}
            </span>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#22c55e", fontFamily: "'Inter', sans-serif" }}>
            <span style={{ width: 7, height: 7, background: "#22c55e", borderRadius: "50%", display: "inline-block", animation: "pulseGlow 2s ease-in-out infinite" }} />
            Live
          </div>
        </div>
      </div>

      {/* Video grid */}
      <div style={{ flex: 1, padding: 16, overflowY: "auto" }}>
        <div style={{
          display: "grid", gap: 12,
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        }}>
          <LocalTile isHost={isHost} />
          <PeersGrid />
        </div>
      </div>

      {/* Superfluid stream bar — students only */}
      {!isHost && (
        <StreamBar stream={stream} onWrap={() => setShowWrapModal(true)} />
      )}

      {/* Controls */}
      <div style={{ flexShrink: 0, background: "#000000", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <Controls onLeave={handleLeave} isLeavingDisabled={stream.isLoading} />
      </div>

      {/* ETHx wrap modal */}
      {showWrapModal && (
        <WrapModal
          onWrap={stream.wrapEth}
          onClose={() => setShowWrapModal(false)}
        />
      )}
    </div>
  );
}

// ── Page export ───────────────────────────────────────────────────────────────
export default function RoomPage() {
  const { query } = useRouter();
  const { room: roomId, host, flowRate } = query;

  if (!roomId) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#000000" }}>
        <div style={{
          width: 40, height: 40,
          border: "3px solid rgba(255,255,255,0.08)",
          borderTop: "3px solid #0075ff",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
      </div>
    );
  }

  return (
    <HuddleProvider client={huddleClient}>
      <RoomContent
        roomId={roomId}
        hostAddress={host}
        flowRate={flowRate}
      />
    </HuddleProvider>
  );
}
