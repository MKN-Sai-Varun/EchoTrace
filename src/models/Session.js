import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 7 // Session expires after 7 days (TTL index)
  }
});

// Index for user lookups
SessionSchema.index({ userId: 1 });

export default mongoose.model("Session", SessionSchema);
