import bcrypt from "bcrypt"; // Add this import
import dotenv from "dotenv";
import { GridFSBucket } from "mongodb";
import mongoose from "mongoose";
import Admin from "./schema/Admin.js";
dotenv.config();

const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/facial_recognition";

// ✅ Use `mongoose.connect()` instead of `createConnection()`
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
});

const conn = mongoose.connection;
let bucket;

async function createDefaultAdmin() {
  try {
    const existingAdmin = await Admin.findOne({ email: "admin@example.com" });
    if (!existingAdmin) {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash("admin123", saltRounds);
      
      const admin = new Admin({
        name: "Default Admin",
        email: "admin@example.com",
        passwordHash: passwordHash,
        role: "admin"
      });

      await admin.save();
      console.log("✅ Default admin created successfully");
    }
  } catch (error) {
    console.error("Error creating default admin:", error);
  }
}
conn.once("open", async () => {  // Add async here
  console.log("✅ MongoDB Connected Successfully");
  bucket = new GridFSBucket(conn.db, { bucketName: "images" });
  await createDefaultAdmin();
});

conn.on("error", (err) => {
  console.error("MongoDB Connection Error:", err);
});

export const getBucket = () => {
  if (!bucket) {
    throw new Error("GridFSBucket is not initialized yet.");
  }
  return bucket;
};

export { conn };
