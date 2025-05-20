import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reported: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  reportId: {
    type: String,
    required: true,
  },
});

const Report = mongoose.models.Report || mongoose.model("Report", ReportSchema);
export default Report;
