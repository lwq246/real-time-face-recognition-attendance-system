import mongoose from "mongoose";

const ModuleSchema = new mongoose.Schema({
  moduleCode: { type: String, required: true, unique: true },
  moduleName: { type: String, required: true },
  course: { type: String, enum: ["Business", "Computer Science","Engineering"], required: true },
  instructor: { type: String, required: true}
});

export default mongoose.model("Module", ModuleSchema);
