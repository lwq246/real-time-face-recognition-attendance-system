import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import Student from "../schema/Student.js";
import Module from "../schema/Module.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function testEnrollments() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Test specific modules
    const testModules = ["CSC301", "BUS101", "ENG201"];

    for (const moduleCode of testModules) {
      const studentsInModule = await Student.find({ 
        modulesEnrolled: moduleCode 
      });

      console.log(`\nStudents enrolled in ${moduleCode}:`);
      studentsInModule.forEach(student => {
        console.log(`- ${student.name} (${student.studentID})`);
      });
      console.log(`Total students: ${studentsInModule.length}`);
    }

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

testEnrollments();