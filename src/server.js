import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"));

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.get("/", (req, res) => {
  res.redirect("/login.html");
});


app.listen(process.env.PORT, () => {
  console.log(`EchoTrace running on ${process.env.PORT}`);
});
