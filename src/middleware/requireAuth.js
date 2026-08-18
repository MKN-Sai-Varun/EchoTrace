import Session from "../models/Session.js";

export async function requireAuth(req, res, next) {
  try {
    const cookie = req.headers.cookie;
    if (!cookie) return res.status(401).json({ error: "Please log in to continue" });

    const sessionId = cookie
      .split("; ")
      .find(row => row.startsWith("sessionId="))
      ?.split("=")[1];

    if (!sessionId) return res.status(401).json({ error: "Please log in to continue" });

    const session = await Session.findOne({ sessionId });
    if (!session) return res.status(401).json({ error: "Session expired" });

    req.userId = session.userId;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
}
