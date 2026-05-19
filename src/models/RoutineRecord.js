import mongoose from "mongoose";

/**
 * Stores AI-scored daily routine records for each user.
 * One document per user per day — upserted after analysis.
 */
const RoutineRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  date: {
    type: Date,
    required: true
  },

  // AI routine scoring
  routineScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  grade: {
    type: String,
    enum: ["A", "B", "C", "D", "F", "N/A"],
    default: "N/A"
  },
  strengths: [{ type: String }],
  weaknesses: [{ type: String }],
  improvement: { type: String },
  consistency: { type: String },

  // Balance breakdown (0-100 each)
  balanceBreakdown: {
    physical: { type: Number, default: 0 },
    mental:   { type: Number, default: 0 },
    social:   { type: Number, default: 0 },
    recovery: { type: Number, default: 0 }
  },

  // Mindset inference
  mindset: {
    state: {
      type: String,
      enum: ["focused", "scattered", "relaxed", "stressed", "balanced", "social", "creative", "recovering", "unknown"],
      default: "unknown"
    },
    confidence: { type: Number, default: 0 },
    description: { type: String },
    triggers: [{ type: String }],
    suggestion: { type: String }
  },

  // Personalized suggestions for each part of the day
  suggestions: {
    immediate:  { type: String },
    morning:    { type: String },
    afternoon:  { type: String },
    evening:    { type: String },
    night:      { type: String },
    weeklyGoal: { type: String }
  },

  // Snapshot of events used for this record
  eventCount: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// One record per user per day
RoutineRecordSchema.index({ userId: 1, date: -1 }, { unique: true });

RoutineRecordSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model("RoutineRecord", RoutineRecordSchema);
