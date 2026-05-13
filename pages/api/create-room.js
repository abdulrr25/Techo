import { API } from "@huddle01/server-sdk/api";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required" });
    }

    const apiKey = process.env.HUDDLE_API_KEY || process.env.NEXT_PUBLIC_HUDDLE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "HUDDLE_API_KEY not configured" });
    }

    const huddle01API = new API({ apiKey });
    // API.createRoom accepts { metadata?, roomLocked? } and throws on failure
    const result = await huddle01API.createRoom({
      metadata: JSON.stringify({ title, description }),
    });

    if (!result?.roomId) {
      return res.status(500).json({ error: "No room ID returned from Huddle01" });
    }

    return res.status(200).json({ roomId: result.roomId });
  } catch (error) {
    console.error("Error creating room:", error);
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
}
