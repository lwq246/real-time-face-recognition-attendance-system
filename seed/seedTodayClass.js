import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import Class from "../schema/Class.js";
import Module from "../schema/Module.js";
import Student from "../schema/Student.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function seedTodayClass() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");


    const today = new Date().toISOString().split('T')[0];

    // Get a specific module (you can modify the query as needed)
    const module = await Module.findOne({ moduleCode: "CSC301" });
    if (!module) {
      throw new Error("Module not found");
    }

    const students = await Student.find({ course: module.course });
    console.log(`Found ${students.length} students for ${module.course}`);

    // Create class for today
    const newClass = {
      moduleCode: module.moduleCode,
      course: module.course,
      students: students.map(student => student._id),
      date: today,
      startTime: "14:00",
      endTime: "16:00",
      location: "Room A101"
    };

    // Insert the class
    const result = await Class.create(newClass);
    console.log("Class details:", {
      moduleCode: result.moduleCode,
      date: result.date,
      location: result.location,
      time: `${result.startTime}-${result.endTime}`
    });

  } catch (error) {
    console.error("❌ Error seeding today's class:", error);
  } finally {
    mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seedTodayClass();