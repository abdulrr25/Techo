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
    <div className="relative rounded-2xl overflow-hidden bg-gray-800 border border-gray-700 flex items-center justify-center min-h-[200px]">
      {audioStream && <Audio stream={audioStream} />}
      {videoStream ? (
        <Video stream={videoStream} className="w-full h-full object-cover" />
      ) : (
        <div className="flex flex-col items-center gap-3 py-10">
          <div className="bg-gray-700 rounded-full p-6">
            <Users size={36} className="text-gray-400" />
          </div>
          <span className="text-gray-400 text-sm">Camera off</span>
        </div>
      )}
      <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
        {peerId.slice(0, 8)}…
      </div>
    </div>
  );
}

// ── Local video tile ──────────────────────────────────────────────────────────
function LocalTile({ isHost }) {
  const { stream } = useLocalVideo();
  return (
    <div className="relative rounded-2xl overflow-hidden bg-gray-800 border border-gray-700 flex items-center justify-center min-h-[200px]">
      {stream ? (
        <Video stream={stream} className="w-full h-full object-cover" />
      ) : (
        <div className="flex flex-col items-center gap-3 py-10">
          <div className="bg-gray-700 rounded-full p-6">
            <Users size={36} className="text-gray-400" />
          </div>
          <span className="text-gray-400 text-sm">Camera off</span>
        </div>
      )}
      <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
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
      <div className="flex flex-col items-center justify-center h-48 text-gray-500 gap-2">
        <Users size={32} />
        <p className="text-sm">Waiting for others to join…</p>
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
    <div className="bg-gray-900 border-t border-gray-700 px-4 py-2 flex items-center justify-between flex-wrap gap-2 text-xs">
      {/* Stream status */}
      <div className="flex items-center gap-2">
        {isStreaming ? (
          <>
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 font-semibold">Stream Active</span>
          </>
        ) : isLoading ? (
          <>
            <Spinner size="xs" color="yellow.400" />
            <span className="text-yellow-400 capitalize">{status}…</span>
          </>
        ) : status === "error" ? (
          <>
            <WifiOff size={12} className="text-red-400" />
            <span className="text-red-400">Stream error</span>
          </>
        ) : (
          <>
            <Wifi size={12} className="text-gray-500" />
            <span className="text-gray-500 capitalize">{status}</span>
          </>
        )}
      </div>

      {/* Live meter */}
      {isStreaming && (
        <div className="flex items-center gap-4">
          <span className="text-gray-400">
            Rate: <span className="text-white font-mono">{parseFloat(ratePerSecond).toFixed(8)} ETHx/s</span>
          </span>
          <span className="text-gray-400">
            Streamed: <span className="text-cyan-400 font-mono">{parseFloat(amountStreamed).toFixed(8)} ETHx</span>
          </span>
          <span className="text-gray-400">
            Time: <span className="text-white font-mono">{elapsed}s</span>
          </span>
        </div>
      )}

      {/* ETHx balance + wrap button */}
      <div className="flex items-center gap-3">
        {balanceEth !== null && (
          <span className="text-gray-400">
            Balance: <span className={hasBalance ? "text-green-400 font-mono" : "text-red-400 font-mono"}>
              {balanceEth} ETHx
            </span>
          </span>
        )}
        {/* Only show wrap button once balance is fetched and is actually zero */}
        {ethxBalance !== null && !hasBalance && !isStreaming && (
          <button
            onClick={onWrap}
            className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1 rounded-lg transition"
          >
            Wrap ETH → ETHx
          </button>
        )}
      </div>

      {/* Error detail */}
      {error && <span className="text-red-400 text-xs w-full">{error}</span>}
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

  return (
    <div className="flex justify-center py-4">
      <div className="flex gap-3 bg-gray-900/90 backdrop-blur px-6 py-3 rounded-full shadow-2xl border border-gray-700">
        <button
          title={isVideoOn ? "Turn off camera" : "Turn on camera"}
          onClick={() => toggle(isVideoOn, enableVideo, disableVideo, "Video")}
          className={`w-12 h-12 flex items-center justify-center rounded-full transition-all ${
            isVideoOn ? "bg-gray-700 hover:bg-gray-600" : "bg-red-600 hover:bg-red-500"
          }`}
        >
          {isVideoOn ? <VideoIcon size={20} className="text-white" /> : <VideoOff size={20} className="text-white" />}
        </button>

        <button
          title={isAudioOn ? "Mute" : "Unmute"}
          onClick={() => toggle(isAudioOn, enableAudio, disableAudio, "Audio")}
          className={`w-12 h-12 flex items-center justify-center rounded-full transition-all ${
            isAudioOn ? "bg-gray-700 hover:bg-gray-600" : "bg-red-600 hover:bg-red-500"
          }`}
        >
          {isAudioOn ? <Mic size={20} className="text-white" /> : <MicOff size={20} className="text-white" />}
        </button>

        <button
          title={isSharing ? "Stop sharing" : "Share screen"}
          onClick={handleScreenShare}
          className={`w-12 h-12 flex items-center justify-center rounded-full transition-all ${
            isSharing ? "bg-blue-600 hover:bg-blue-500" : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          {isSharing ? <MonitorOff size={20} className="text-white" /> : <Monitor size={20} className="text-white" />}
        </button>

        <button
          title="Leave"
          onClick={handleLeave}
          disabled={leaving || isLeavingDisabled}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-500 transition-all disabled:opacity-50"
        >
          {leaving ? <Spinner size="sm" color="white" /> : <PhoneOff size={20} className="text-white" />}
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 w-full max-w-sm">
        <h3 className="text-white font-bold text-lg mb-2">Wrap ETH → ETHx</h3>
        <p className="text-gray-400 text-sm mb-4">
          You need ETHx (Super ETH) to stream payments. Wrap some ETH first.
        </p>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          step="0.001"
          min="0.001"
          className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-2 text-white mb-4 focus:outline-none focus:border-cyan-500"
          placeholder="Amount in ETH"
        />
        <div className="flex gap-3">
          <button
            onClick={handleWrap}
            disabled={loading}
            className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-2 rounded-xl font-semibold transition disabled:opacity-50"
          >
            {loading ? "Wrapping…" : "Wrap ETH"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-xl transition"
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
    if (!roomId || joinedRef.current) return;
    let mounted = true;

    (async () => {
      try {
        const res = await fetch(`/api/getAccessToken?roomId=${roomId}`);
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
  }, [roomId]);

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
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-center max-w-md px-6">
          <div className="text-5xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-3">Failed to join</h2>
          <p className="text-gray-400 mb-6">{joinError}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { setJoinError(null); joinedRef.current = false; }}
              className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition"
            >
              Retry
            </button>
            <button
              onClick={() => router.push("/my-classes")}
              className="px-5 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition"
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
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-bold text-white mb-2">
            {state === "connecting" ? "Connecting to room…" : "Joining session…"}
          </h2>
          <p className="text-gray-400 text-sm">Please wait</p>
        </div>
      </div>
    );
  }

  // ── In-meeting screen ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-800 shrink-0">
        <span className="font-black text-lg tracking-wide text-white">Teacho</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 font-mono bg-gray-800 px-3 py-1 rounded-full">
            {roomId}
          </span>
          {isHost ? (
            <span className="text-xs bg-purple-900 text-purple-300 px-3 py-1 rounded-full font-semibold">Host</span>
          ) : (
            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
              stream.isStreaming ? "bg-green-900 text-green-300" : "bg-gray-800 text-gray-400"
            }`}>
              {stream.isStreaming ? "💸 Streaming" : "Student"}
            </span>
          )}
          <span className="flex items-center gap-1.5 text-xs text-green-400">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Live
          </span>
        </div>
      </div>

      {/* Video grid */}
      <div className="flex-1 p-4 overflow-auto">
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
        >
          <LocalTile isHost={isHost} />
          <PeersGrid />
        </div>
      </div>

      {/* Superfluid stream bar — students only */}
      {!isHost && (
        <StreamBar stream={stream} onWrap={() => setShowWrapModal(true)} />
      )}

      {/* Controls */}
      <div className="shrink-0 bg-gray-950 border-t border-gray-800">
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
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
        <Spinner size="xl" color="cyan.400" />
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
