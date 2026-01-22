import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
  studentID: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  course: { type: String, enum: ["Business", "Computer Science","Engineering"], required: true },
  yearOfStudy: { type: Number, required: true },
  modulesEnrolled: [{ type: String }],
  faceEmbeddings: { type: [[Number]], default: null }  // Array of numbers for face embeddings
});

export default mongoose.model("Student", StudentSchema);
