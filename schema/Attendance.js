import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ["Present", "Absent", "Late"], default: "Absent" },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("Attendance", AttendanceSchema);
