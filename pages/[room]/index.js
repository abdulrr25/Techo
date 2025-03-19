import { useState, useEffect, useRef } from "react";
import { HuddleClient, HuddleProvider } from "@huddle01/react";
import { useRoom } from "@huddle01/react/hooks";
import {
  useLocalVideo,
  useLocalAudio,
  useLocalScreenShare,
  usePeerIds,
  useRemoteVideo,
  useRemoteAudio,
} from "@huddle01/react/hooks";
import { Audio, Video } from "@huddle01/react/components";
import { Role } from "@huddle01/server-sdk/auth";
import { VideoCall } from "@/components/VideoCall";
import { Mic, MicOff, Video as VideoIcon, VideoOff, Monitor, MonitorOff, PhoneOff } from "lucide-react"; // Google Meet Icons

const huddleClient = new HuddleClient({
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  options: { activeSpeakers: { size: 12 } },
});

// ✅ Remote Participant Video & Audio
const RemotePeer = ({ peerId }) => {
  const { stream: videoStream } = useRemoteVideo({ peerId });
  const { stream: audioStream } = useRemoteAudio({ peerId });

  return (
    <div>
      {videoStream && <Video stream={videoStream} />}
      {audioStream && <Audio stream={audioStream} />}
    </div>
  );
};

// ✅ Show All Connected Peers
const ShowPeers = () => {
  const { peerIds } = usePeerIds({ roles: [Role.HOST, Role.CO_HOST] });

  return (
    <div>
      {peerIds.map((peerId) => (
        <RemotePeer key={peerId} peerId={peerId} />
      ))}
    </div>
  );
};

// ✅ Main Class Component
export default function Classes() {
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const { joinRoom, leaveRoom } = useRoom({
    onJoin: () => console.log("✅ Successfully joined the room"),
    onLeave: () => console.log("🚪 Left the room"),
  });

  // ✅ Step 1: Fetch Room ID from API
  useEffect(() => {
    async function createRoom() {
      try {
        const response = await fetch("/api/create-room", { method: "POST" });
        const resJson = await response.json();
        if (!resJson.roomId) {
          console.error("❌ Error: Room ID not generated");
          return;
        }
        setRoomId(resJson.roomId);
      } catch (error) {
        console.error("❌ Error creating room:", error);
      }
    }
    createRoom();
  }, []);

  // ✅ Step 2: Get Token & Join Room
  useEffect(() => {
    if (!roomId) return;

    async function getTokenAndJoin() {
      try {
        const response = await fetch(`/api/getAccessToken?roomId=${roomId}`);
        const resJson = await response.json();
        if (!resJson.token) {
          console.error("❌ Error: Failed to get token");
          return;
        }

        // ✅ FIX: Wait for WebSocket Connection Before Joining
        let attempts = 0;
        while (huddleClient.connectionState !== "connected" && attempts < 10) {
          console.log(`⏳ Waiting for WebSocket... Attempt ${attempts + 1}`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          attempts++;
        }

        if (huddleClient.connectionState !== "connected") {
          console.error("❌ WebSocket failed to connect.");
          return;
        }

        await huddleClient.enableVideo();
        await huddleClient.enableAudio();
        await joinRoom({ roomId, token: resJson.token });

        setJoined(true);
      } catch (error) {
        console.error("❌ Error joining room:", error);
      }
    }

    getTokenAndJoin();
    return () => {
      if (joined) leaveRoom();
    };
  }, [roomId]);

  if (!joined) return <div>Loading...</div>;

  return <MeetScreen />;
}

// ✅ MeetScreen Component with Google Meet-Style Buttons
const MeetScreen = () => {
  const { enableVideo, disableVideo, isVideoOn } = useLocalVideo();
  const { enableAudio, disableAudio, isAudioOn } = useLocalAudio();
  const { startScreenShare, stopScreenShare, shareStream } = useLocalScreenShare();

  return (
    <div className="bg-primary w-full flex flex-col items-center justify-center min-h-screen">
      {/* Control Buttons */}
      <div className="flex gap-6 p-4 bg-gray-900 rounded-full shadow-lg">
        
        {/* Video Toggle */}
        <button
          onClick={() => (isVideoOn ? disableVideo() : enableVideo())}
          className={`w-14 h-14 flex items-center justify-center rounded-full transition-all ${
            isVideoOn ? "bg-gray-800 hover:bg-gray-700" : "bg-red-600 hover:bg-red-500"
          }`}
        >
          {isVideoOn ? <VideoIcon size={24} color="white" /> : <VideoOff size={24} color="white" />}
        </button>

        {/* Mic Toggle */}
        <button
          onClick={() => (isAudioOn ? disableAudio() : enableAudio())}
          className={`w-14 h-14 flex items-center justify-center rounded-full transition-all ${
            isAudioOn ? "bg-gray-800 hover:bg-gray-700" : "bg-red-600 hover:bg-red-500"
          }`}
        >
          {isAudioOn ? <Mic size={24} color="white" /> : <MicOff size={24} color="white" />}
        </button>

        {/* Screen Share Toggle */}
        <button
          onClick={() => (shareStream ? stopScreenShare() : startScreenShare())}
          className={`w-14 h-14 flex items-center justify-center rounded-full transition-all ${
            shareStream ? "bg-gray-800 hover:bg-gray-700" : "bg-blue-600 hover:bg-blue-500"
          }`}
        >
          {shareStream ? <MonitorOff size={24} color="white" /> : <Monitor size={24} color="white" />}
        </button>

        {/* Leave Meeting Button */}
        <button
          onClick={() => window.location.reload()} // Reloads page to simulate meeting exit
          className="w-14 h-14 flex items-center justify-center bg-red-600 hover:bg-red-500 rounded-full transition-all"
        >
          <PhoneOff size={24} color="white" />
        </button>
      </div>

      {/* Show Remote Peers */}
      <ShowPeers />
    </div>
  );
};
