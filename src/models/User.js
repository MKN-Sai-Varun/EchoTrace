import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: String,
  passwordHash: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", UserSchema);
    