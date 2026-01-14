import mongoose from "mongoose";

const CategoryBreakdownSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  timeSpent: {
    type: Number, // estimated minutes
    default: 0
  },
  events: [{
    label: String,
    timestamp: Date
  }]
}, { _id: false });

const AnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  },
  date: {
    type: Date,
    required: true
  },
  totalEvents: {
    type: Number,
    default: 0
  },
  categories: [CategoryBreakdownSchema],
  insights: [{
    type: String
  }],
  recommendations: [{
    type: String
  }],
  productivityScore: {
    type: Number, // 0-100
    min: 0,
    max: 100
  },
  topCategory: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient user + date queries
AnalysisSchema.index({ userId: 1, date: -1 });

// Update the updatedAt field on save
AnalysisSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model("Analysis", AnalysisSchema);
