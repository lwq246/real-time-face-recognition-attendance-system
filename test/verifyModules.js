import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

import Class from '../schema/Class.js';

async function verifyModules() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const courses = ["Computer Science", "Business", "Engineering"];

    for (const course of courses) {
      console.log(`\n📚 Modules for ${course}:`);
      
      const modules = await Class.find({ course: course })
        .select('moduleCode course date startTime endTime location')
        .lean();

      if (modules.length === 0) {
        console.log(`No modules found for ${course}`);
        continue;
      }

      modules.forEach(module => {
        console.log({
          moduleCode: module.moduleCode,
          date: module.date,
          time: `${module.startTime}-${module.endTime}`,
          location: module.location
        });
      });
    }

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

verifyModules();