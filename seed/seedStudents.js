import dotenv from "dotenv";
import fs from 'fs';
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import Module from "../schema/Module.js";
import Student from "../schema/Student.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function seedStudents() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Load face embeddings from the JSON file (not pickle)
    const embeddingsPath = path.join(__dirname, '../server/embeddings.json');
    const embeddings = JSON.parse(fs.readFileSync(embeddingsPath, 'utf8'));

    // Get modules first
    const cscModules = await Module.find({ course: "Computer Science" });
    const busModules = await Module.find({ course: "Business" });
    const engModules = await Module.find({ course: "Engineering" });

    // Create students based on available embeddings
    const uniqueStudentIds = [...new Set(Object.keys(embeddings))];
    const students = uniqueStudentIds.map(personName => {
      let course, modules;
      const prefixes = ['1', '2', '3'];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      
      // Get all embeddings for this person
      const studentEmbeddings = embeddings[personName];
      
      switch(prefix) {
        case '1':
          course = "Computer Science";
          modules = cscModules;
          break;
        case '2':
          course = "Business";
          modules = busModules;
          break;
        case '3':
          course = "Engineering";
          modules = engModules;
          break;
      }

      // Verify modules exist
      if (!modules || modules.length === 0) {
        console.error(`No modules found for course: ${course}`);
        return null;
      }

      // Generate a student ID based on the prefix
      const studentNumber = Math.floor(Math.random() * 999) + 1;
      const studentID = `${prefix}${String(studentNumber).padStart(3, '0')}`;

      return {
        studentID: studentID,
        name: personName.replace(/_/g, ' '), // Convert underscores to spaces
        email: `${personName.toLowerCase().replace(/_/g, '.')}@student.edu`,
        course: course,
        yearOfStudy: 1,
        modulesEnrolled: modules.map(m => m.moduleCode),
        faceEmbeddings: studentEmbeddings
      };
    }).filter(Boolean); // Remove any null entries

    // Only proceed if we have valid students
    if (students.length === 0) {
      throw new Error("No valid students to insert");
    }

    // Clear existing students
    await Student.deleteMany({});
    console.log("Cleared existing students");

    // Insert new students
    const result = await Student.insertMany(students);
    console.log(`✅ Successfully inserted ${result.length} students with face embeddings`);

  } catch (error) {
    console.error("❌ Error seeding students:", error);
  } finally {
    mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seedStudents();