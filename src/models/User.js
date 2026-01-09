import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  passwordHash: {
    type: String,
    required: true
  },
  theme: {
    type: String,
    enum: ["midnight", "ocean", "forest", "sunset", "lavender"],
    default: "midnight"
  },
  createdAt: { type: Date, default: Date.now }
});

// Index for faster username lookups
UserSchema.index({ username: 1 });

export default mongoose.model("User", UserSchema);
    