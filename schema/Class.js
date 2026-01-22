import mongoose from "mongoose";

const ClassSchema = new mongoose.Schema({
  moduleCode: { type: String, required: true }, // Module code (e.g., "CSC301")
  course: { type: String, enum: ["Business", "Computer Science","Engineering"], required: true },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  location: { type: String, required: true }

});

export default mongoose.model("Class", ClassSchema);
