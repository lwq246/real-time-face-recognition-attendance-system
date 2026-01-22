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

async function seedAttendance() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Get all classes
    const classes = await Class.find({});
    console.log(`Found ${classes.length} classes`);

    // Clear existing attendance records
    await Attendance.deleteMany({});
    console.log("Cleared existing attendance records");

    const attendanceRecords = [];

    // Create attendance records for each class
    for (const classObj of classes) {
      // Find students enrolled in this module using moduleCode
      const enrolledStudents = await Student.find({ 
        modulesEnrolled: classObj.moduleCode 
      });

      console.log(`Found ${enrolledStudents.length} students for class ${classObj.moduleCode}`);

      if (!enrolledStudents.length) {
        console.log(`No students found for class ${classObj.moduleCode}`);
        continue;
      }

      // Create attendance records for each student
      for (const student of enrolledStudents) {
        const random = Math.random();
        // const status = random > 0.7 ? 'Absent' : (random > 0.2 ? 'Present' : 'Late');
        const status = 'Absent' ;

        attendanceRecords.push({
          classId: classObj._id,
          studentId: student._id,
          date: classObj.date,
          status: status
        });
      }
    }

    console.log(`Created ${attendanceRecords.length} attendance records`);

    const result = await Attendance.insertMany(attendanceRecords);
    console.log(`✅ Successfully inserted ${result.length} attendance records`);

  } catch (error) {
    console.error("❌ Error seeding attendance:", error);
  } finally {
    mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seedAttendance();