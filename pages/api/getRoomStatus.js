export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { roomId } = req.query;

    if (!roomId) {
      return res.status(400).json({ error: "Room ID is required" });
    }

    const apiKey = process.env.HUDDLE_API_KEY || process.env.NEXT_PUBLIC_HUDDLE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Huddle API key not configured" });
    }

    const response = await fetch(`https://api.huddle01.com/api/v1/room-status/${roomId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Huddle API error:", data);
      return res.status(response.status).json({ error: "Failed to get room status", details: data });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error getting room status:", error);
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
}
