const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  qid: Number,
  question: String,
  options: [String],
  answer: String,
  qType: {
    type: String,
    enum: ["Objective", "Subjective"],
    default: "Subjective"
  },
  qDomain: {
    type: String,
    enum: ["technical", "design", "management", "documentation"],
    default: "management"
  }
});

module.exports = mongoose.model("question", questionSchema);
