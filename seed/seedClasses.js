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

async function seedClasses() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const modules = await Module.find({});
    const students = await Student.find({});

    const classes = [];

    // Create multiple classes for each module with different dates
    for (const module of modules) {
      const moduleStudents = students.filter(student => student.course === module.course);
      console.log(`Creating classes for ${module.moduleCode} with ${moduleStudents.length} students`);
      
      // Create classes for multiple dates
      const classDates = [
        { date: "2024-01-15", time: ["09:00", "11:00"] },
        { date: "2024-01-22", time: ["09:00", "11:00"] },
        { date: "2024-01-29", time: ["09:00", "11:00"] },
        { date: "2024-02-05", time: ["09:00", "11:00"] },
        { date: "2024-02-12", time: ["09:00", "11:00"] }
      ];

      for (const classDate of classDates) {
        classes.push({
          moduleCode: module.moduleCode,
          course: module.course,
          students: moduleStudents.map(student => student._id),
          date: classDate.date,
          startTime: classDate.time[0],
          endTime: classDate.time[1],
          location: `${module.course} Lab`
        });
      }
    }

    // Clear existing classes
    await Class.deleteMany({});
    console.log("Cleared existing classes");

    // Insert new classes
    const result = await Class.insertMany(classes);
    console.log(`✅ Successfully inserted ${result.length} classes`);

  } catch (error) {
    console.error("❌ Error seeding classes:", error);
  } finally {
    mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seedClasses();