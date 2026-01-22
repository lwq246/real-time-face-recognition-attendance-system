import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import Module from "../schema/Module.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const modules = [
  {
    moduleCode: "CSC301",
    moduleName: "Web Development",
    course: "Computer Science",
    instructor: "Dr. Sarah Johnson"
  },
  {
    moduleCode: "CSC201",
    moduleName: "Database Systems",
    course: "Computer Science",
    instructor: "Prof. Michael Chen"
  },
  {
    moduleCode: "BUS101",
    moduleName: "Business Management",
    course: "Business",
    instructor: "Dr. James Wilson"
  },
  {
    moduleCode: "BUS201",
    moduleName: "Marketing Principles",
    course: "Business",
    instructor: "Prof. Lisa Anderson"
  },
  {
    moduleCode: "ENG201",
    moduleName: "Engineering Mechanics",
    course: "Engineering",
    instructor: "Dr. Emily Brown"
  },
  {
    moduleCode: "ENG301",
    moduleName: "Control Systems",
    course: "Engineering",
    instructor: "Dr. Robert Taylor"
  }
];

async function seedModules() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing modules
    await Module.deleteMany({});
    console.log("Cleared existing modules");

    // Insert new modules
    const result = await Module.insertMany(modules);
    console.log(`✅ Successfully inserted ${result.length} modules`);

  } catch (error) {
    console.error("❌ Error seeding modules:", error);
  } finally {
    mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

seedModules();