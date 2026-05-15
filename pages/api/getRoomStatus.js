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

    const response = await fetch(`https://api.huddle01.com/api/v2/sdk/rooms/${roomId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
    });

    // Parse body safely — Huddle can return HTML on 404s
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text.slice(0, 200) };
    }

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
