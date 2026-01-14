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
  email: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true // Allows null/undefined but unique when present
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: 50
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

export default mongoose.model("User", UserSchema);
    