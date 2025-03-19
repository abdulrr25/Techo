import { API } from "@huddle01/server-sdk/api";

const handler = async (req, res) => {
  try {
    if (!process.env.NEXT_PUBLIC_HUDDLE_API_KEY) {
      console.error("❌ Error: Missing Huddle API Key.");
      return res.status(500).json({ error: "API Key is missing" });
    }

    const api = new API({
      apiKey: process.env.NEXT_PUBLIC_HUDDLE_API_KEY,
    });

    const newRoom = await api.createRoom({
      roomLocked: false,
      metadata: JSON.stringify({ title: "Huddle01 Meeting" }),
    });

    if (!newRoom || !newRoom.roomId) {
      console.error("❌ Failed to create room. API Response:", newRoom);
      return res.status(500).json({ error: "Failed to create room" });
    }

    console.log("✅ Room Created:", newRoom.roomId);
    res.status(200).json({ roomId: newRoom.roomId });
  } catch (error) {
    console.error("❌ Error creating room:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export default handler;
