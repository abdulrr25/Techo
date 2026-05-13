import {
  Video as VideoIcon,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Monitor,
  Users,
  MessageCircle,
  Settings,
} from "lucide-react";

import { HuddleClient, HuddleProvider } from "@huddle01/react";
import { useRoom } from "@huddle01/react/hooks";
import { useState, useEffect, useCallback } from "react";
import {
  useLocalVideo,
  useLocalAudio,
  useLocalScreenShare,
} from "@huddle01/react/hooks";

import {
  usePeerIds,
  useRemoteVideo,
  useRemoteAudio,
} from "@huddle01/react/hooks";
import { Audio, Video } from "@huddle01/react/components";
import { Role } from "@huddle01/server-sdk/auth";
import { useToast } from "@chakra-ui/react";

const RemotePeer = ({ peerId }) => {
  const { stream: videoStream, isLoading: videoLoading } = useRemoteVideo({ peerId });
  const { stream: audioStream, isLoading: audioLoading } = useRemoteAudio({ peerId });
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const toast = useToast();

  useEffect(() => {
    const handleStreamError = (e) => {
      setError(e.message);
      console.error("Stream error:", e);
      
      if (retryCount < 3) {
        toast({
          title: "Stream Error",
          description: "Attempting to reconnect...",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        setRetryCount(prev => prev + 1);
      } else {
        toast({
          title: "Connection Failed",
          description: "Unable to establish connection. Please try again later.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    const videoErrorHandler = videoStream ? handleStreamError : null;
    const audioErrorHandler = audioStream ? handleStreamError : null;

    if (videoStream) {
      videoStream.addEventListener("error", videoErrorHandler);
    }
    if (audioStream) {
      audioStream.addEventListener("error", audioErrorHandler);
    }

    return () => {
      if (videoStream && videoErrorHandler) {
        videoStream.removeEventListener("error", videoErrorHandler);
      }
      if (audioStream && audioErrorHandler) {
        audioStream.removeEventListener("error", audioErrorHandler);
      }
    };
  }, [videoStream, audioStream, retryCount, toast]);

  if (error) {
    return (
      <div className="relative rounded-2xl overflow-hidden bg-gray-800 shadow-lg border border-red-500 p-4 flex items-center justify-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gray-800 shadow-lg border border-gray-700">
      {audioStream && <Audio stream={audioStream} />}
      <div className="w-full h-full flex items-center justify-center object-cover">
        {videoLoading ? (
          <div className="animate-pulse flex items-center justify-center">
            <p>Loading video...</p>
          </div>
        ) : videoStream ? (
          <Video stream={videoStream} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="bg-gray-700 rounded-full p-8">
              <Users size={48} className="text-gray-400" />
            </div>
          </div>
        )}
      </div>
      <div className="absolute bottom-4 left-4 bg-gray-900/60 px-3 py-1 rounded-lg">
        Peer {peerId.slice(0, 8)}
      </div>
    </div>
  );
};

export const VideoCall = () => {
  const { peerIds } = usePeerIds({ roles: [Role.HOST, Role.CO_HOST] });
  const { stream: localVideoStream, isLoading: localVideoLoading } = useLocalVideo();
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const toast = useToast();

  useEffect(() => {
    const handleError = (e) => {
      setError(e.message);
      console.error("Video error:", e);
      
      if (retryCount < 3) {
        toast({
          title: "Connection Error",
          description: "Attempting to reconnect...",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        setRetryCount(prev => prev + 1);
      } else {
        toast({
          title: "Connection Failed",
          description: "Unable to establish connection. Please try again later.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    const errorHandler = localVideoStream ? handleError : null;

    if (localVideoStream) {
      localVideoStream.addEventListener("error", errorHandler);
    }

    return () => {
      if (localVideoStream && errorHandler) {
        localVideoStream.removeEventListener("error", errorHandler);
      }
    };
  }, [localVideoStream, toast, retryCount]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="h-screen flex flex-col">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          <div className="relative rounded-2xl overflow-hidden bg-gray-800 shadow-lg border border-gray-700">
            <div className="w-full h-full flex items-center justify-center object-cover">
              {localVideoLoading ? (
                <div className="animate-pulse flex items-center justify-center">
                  <p>Loading video...</p>
                </div>
              ) : localVideoStream ? (
                <Video stream={localVideoStream} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="bg-gray-700 rounded-full p-8">
                    <Users size={48} className="text-gray-400" />
                  </div>
                </div>
              )}
            </div>
            <div className="absolute bottom-4 left-4 bg-gray-900/60 px-3 py-1 rounded-lg">
              You (Host)
            </div>
          </div>
          {peerIds.map((peerId) => (
            <RemotePeer key={peerId} peerId={peerId} />
          ))}
        </div>
        <Controls />
      </div>
    </div>
  );
};

function Controls() {
  const {
    stream: localVideoStream,
    enableVideo,
    disableVideo,
    isVideoOn,
  } = useLocalVideo();
  const {
    stream: localAudioStream,
    enableAudio,
    disableAudio,
    isAudioOn,
  } = useLocalAudio();
  const {
    startScreenShare,
    stopScreenShare,
    isScreenShared,
  } = useLocalScreenShare();
  const [isLeaving, setIsLeaving] = useState(false);
  const toast = useToast();

  const handleVideoToggle = useCallback(async () => {
    try {
      if (isVideoOn) {
        await disableVideo();
      } else {
        await enableVideo();
      }
    } catch (error) {
      toast({
        title: "Video Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [isVideoOn, enableVideo, disableVideo, toast]);

  const handleAudioToggle = useCallback(async () => {
    try {
      if (isAudioOn) {
        await disableAudio();
      } else {
        await enableAudio();
      }
    } catch (error) {
      toast({
        title: "Audio Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [isAudioOn, enableAudio, disableAudio, toast]);

  const handleScreenShare = useCallback(async () => {
    try {
      if (isScreenShared) {
        await stopScreenShare();
      } else {
        await startScreenShare();
      }
    } catch (error) {
      toast({
        title: "Screen Share Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [isScreenShared, startScreenShare, stopScreenShare, toast]);

  const handleLeave = useCallback(async () => {
    setIsLeaving(true);
    try {
      // Stop all media streams
      if (localVideoStream) {
        localVideoStream.getTracks().forEach(track => track.stop());
      }
      if (localAudioStream) {
        localAudioStream.getTracks().forEach(track => track.stop());
      }
      
      // Redirect to home page
      window.location.href = "/";
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to leave the room",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setIsLeaving(false);
    }
  }, [localVideoStream, localAudioStream, toast]);

  return (
    <div className="bg-gray-800 p-4 flex justify-center space-x-4">
      <button
        onClick={handleVideoToggle}
        className={`p-3 rounded-full ${
          isVideoOn ? "bg-gray-700" : "bg-red-500"
        } hover:bg-opacity-80 transition-colors`}
      >
        {isVideoOn ? <VideoIcon size={24} /> : <VideoOff size={24} />}
      </button>
      <button
        onClick={handleAudioToggle}
        className={`p-3 rounded-full ${
          isAudioOn ? "bg-gray-700" : "bg-red-500"
        } hover:bg-opacity-80 transition-colors`}
      >
        {isAudioOn ? <Mic size={24} /> : <MicOff size={24} />}
      </button>
      <button
        onClick={handleScreenShare}
        className={`p-3 rounded-full ${
          isScreenShared ? "bg-blue-500" : "bg-gray-700"
        } hover:bg-opacity-80 transition-colors`}
      >
        <Monitor size={24} />
      </button>
      <button
        onClick={handleLeave}
        disabled={isLeaving}
        className="p-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50"
      >
        <PhoneOff size={24} />
      </button>
    </div>
  );
}

export default VideoCall;
