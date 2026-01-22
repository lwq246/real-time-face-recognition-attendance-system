import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

// Import both models
import Class from '../schema/Class.js';

async function verifyClasses() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Find all classes for Web Development (CSC301)
    const webDevClasses = await Class.find({ 
      courseId: '67dfa0d231f87df2d2cef6d9' 
    }).populate('courseId');
    
    console.log("\nWeb Development Class Dates:");
    webDevClasses.forEach(cls => {
      console.log({
        date: cls.date,
        formattedDate: new Date(cls.date).toLocaleDateString(),
        courseCode: cls.courseId?.courseCode,
        time: `${cls.startTime}-${cls.endTime}`
      });
    });

    // Extract just the dates
    const dates = webDevClasses.map(c => c.date).sort();
    console.log("\nJust the dates:");
    console.log(dates);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

verifyClasses();