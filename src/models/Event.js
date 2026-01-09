import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  label: String,
  category: String,
  timestamp: { type: Date, default: Date.now },
  userId: mongoose.Schema.Types.ObjectId
});

export default mongoose.model("Event", EventSchema);
