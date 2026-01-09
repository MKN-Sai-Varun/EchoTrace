import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema({
  sessionId: String,
  userId: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Session", SessionSchema);
