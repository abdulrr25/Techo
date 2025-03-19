import { AccessToken, Role } from "@huddle01/server-sdk/auth";

export default async function handler(req, res) {
  try {
    const { roomId } = req.query;

    if (!roomId) {
      console.error("❌ Error: roomId is missing in request.");
      return res.status(400).json({ error: "roomId is required" });
    }

    if (!process.env.NEXT_PUBLIC_HUDDLE_API_KEY) {
      console.error("❌ Error: Huddle API key is missing.");
      return res.status(500).json({ error: "API Key is missing" });
    }

    // console.log("🔹 Generating token for room:", roomId);

    const accessToken = new AccessToken({
      apiKey: process.env.NEXT_PUBLIC_HUDDLE_API_KEY,
      roomId,
      role: Role.HOST,
      permissions: {
        admin: true,
        canConsume: true,
        canProduce: true,
        canProduceSources: {
          cam: true,
          mic: true,
          screen: true,
        },
        canRecvData: true,
        canSendData: true,
        canUpdateMetadata: true,
      },
    });

    const token = await accessToken.toJwt();

    if (!token) {
      console.error("❌ Error: Failed to generate token.");
      return res.status(500).json({ error: "Failed to generate token" });
    }

    // console.log("✅ Token Generated Successfully:", token);
    return res.status(200).json({ token });
  } catch (error) {
    console.error("❌ Error generating access token:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
