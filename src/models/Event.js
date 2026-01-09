import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    trim: true,
    maxlength: 50
  },
  timestamp: { type: Date, default: Date.now },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  }
});

// Compound index for efficient user timeline queries
EventSchema.index({ userId: 1, timestamp: -1 });

export default mongoose.model("Event", EventSchema);
