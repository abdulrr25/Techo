import { AccessToken, Role } from "@huddle01/server-sdk/auth";

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const isGet = req.method === "GET";
    const roomId = isGet ? req.query.roomId : req.body?.roomId;
    const isHost = isGet
      ? req.query.isHost === "true"
      : req.body?.isHost === true;

    if (!roomId) {
      return res.status(400).json({ error: "Room ID is required" });
    }

    const apiKey = process.env.HUDDLE_API_KEY || process.env.NEXT_PUBLIC_HUDDLE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "HUDDLE_API_KEY not configured" });
    }

    // Host  → Role.HOST  with full admin
    // Student → Role.GUEST with no admin, but can produce cam/mic/screen
    const accessToken = new AccessToken({
      apiKey,
      roomId,
      role: isHost ? Role.HOST : Role.GUEST,
      permissions: {
        admin: isHost,
        canConsume: true,
        canProduce: true,
        canProduceSources: { cam: true, mic: true, screen: true },
        canRecvData: true,
        canSendData: true,
        canUpdateMetadata: isHost,
      },
    });

    const token = await accessToken.toJwt();
    if (!token) {
      return res.status(422).json({
        error: "Room not associated with this API key. Only rooms created via this app are joinable.",
      });
    }
    return res.status(200).json({ token });
  } catch (error) {
    console.error("Error generating access token:", error);
    return res.status(500).json({ error: "Failed to generate token", details: error.message });
  }
}
