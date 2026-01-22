import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import Attendance from "../schema/Attendance.js";
import Class from "../schema/Class.js";
import Student from "../schema/Student.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function seedSpecificAttendance(moduleCode, date) {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Get specific class
    const classObj = await Class.findOne({ 
      moduleCode: moduleCode,
      date: date 
    });

    if (!classObj) {
      console.log(`No class found for ${moduleCode} on ${date}`);
      return;
    }
    console.log(`Found class: ${classObj.moduleCode} for ${classObj.date}`);

    // Find students enrolled in this module
    const enrolledStudents = await Student.find({ 
      modulesEnrolled: moduleCode 
    });

    console.log(`Found ${enrolledStudents.length} students for class ${moduleCode}`);

    if (!enrolledStudents.length) {
      console.log(`No students found for class ${moduleCode}`);
      return;
    }

    // Delete existing attendance records for this class and date
    await Attendance.deleteMany({
      classId: classObj._id,
      date: date
    });
    console.log("Cleared existing attendance records for this class");

    // Create attendance records for each student
    const attendanceRecords = enrolledStudents.map(student => ({
      classId: classObj._id,
      studentId: student._id,
      date: classObj.date,
      status: 'Absent'
    }));

    const result = await Attendance.insertMany(attendanceRecords);
    console.log(`✅ Successfully inserted ${result.length} attendance records`);

  } catch (error) {
    console.error("❌ Error seeding attendance:", error);
  } finally {
    mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Example usage:
seedSpecificAttendance('CSC301', '2025-05-05');