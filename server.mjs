import axios from 'axios'; // Add this at the top with other imports
import bcrypt from "bcrypt";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import multer from "multer";
import { getBucket } from "./db.js";
import Admin from "./schema/Admin.js";
import Attendance from "./schema/Attendance.js";
import Class from "./schema/Class.js";
import Module from "./schema/Module.js";
import Student from "./schema/Student.js";

dotenv.config();

const app = express();

// Increase payload size limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS configuration - update this section
const corsOptions = {
  origin: [
    'http://localhost:5173', 
    'http://127.0.0.1:5173',
    'http://localhost:5000',
    'http://localhost:5174' // Add your frontend port
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Add OPTIONS method
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(express.json());
// Remove this duplicate line
// app.use(cors());

// Admin Authentication Route
app.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email }); // Add this log
    
    const admin = await Admin.findOne({ email });
    if (!admin) {
      console.log('Admin not found'); // Add this log
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash);
    console.log('Password valid:', isValid); // Add this log

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({ token, admin: { email: admin.email, role: admin.role } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

// // Middleware to protect routes
// const authenticateAdmin = async (req, res, next) => {
//   try {
//     const token = req.headers.authorization?.split(' ')[1];
//     if (!token) {
//       return res.status(401).json({ message: 'No token provided' });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
//     req.admin = decoded;
//     next();
//   } catch (error) {
//     res.status(401).json({ message: 'Invalid token' });
//   }
// };

// ✅ Multer for Memory Storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Debugging Middleware
app.use((req, res, next) => {
  console.log("📢 Incoming request:", req.method, req.url);
  next();
});

// ✅ Register Student API
app.post("/register", upload.array("face", 5), async (req, res) => {
  try {
    console.log(" Incoming Request Body:", req.body);
    console.log(" Uploaded Files:", req.files);

    // ✅ Validate request body
    const { studentID, name, email, educationLevel, yearOfStudy } = req.body;
    if (!studentID || !name || !email || !educationLevel || !yearOfStudy) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No images uploaded" });
    }

    // ✅ Ensure bucket is initialized
    const bucket = getBucket();
    if (!bucket) {
      return res.status(500).json({ error: "GridFSBucket is not initialized" });
    }

    // ✅ Upload images to GridFS
    const imageIds = await Promise.all(
      req.files.map((file) => {
        return new Promise((resolve, reject) => {
          const uploadStream = bucket.openUploadStream(file.originalname, {
            contentType: file.mimetype,
          });

          uploadStream.end(file.buffer);

          uploadStream.on("finish", function () {
            console.log(`✅ Uploaded ${file.originalname} to MongoDB`);
            resolve(new mongoose.Types.ObjectId(this.id)); // ✅ Ensure it's an ObjectId
          });

          uploadStream.on("error", function (err) {
            console.error("❌ Upload Stream Error:", err);
            reject(err);
          });
        });
      })
    );

    console.log("✅ Image IDs:", imageIds);

    // ✅ Save student info to MongoDB
    const newStudent = new Student({
      studentID,
      name,
      email,
      educationLevel,
      yearOfStudy,
      faceImageIds: imageIds,
    });

    await newStudent.save();

    res.status(201).json({ message: "✅ Student registered!", student: newStudent });
  } catch (error) {
    console.error("❌ Error registering student:", error);
    res.status(500).json({ error: "Failed to register student" });
  }
});

// // Fetch all courses endpoint
// app.get("/courses", async (req, res) => {
//   try {
//     console.log("📢 Fetching courses...");
//     const courses = await Course.find({});
//     console.log("✅ Courses found:", courses.length);
//     res.json(courses);
//   } catch (error) {
//     console.error("❌ Error fetching courses:", error);
//     res.status(500).json({ error: "Failed to fetch courses" });
//   }
// });

// // Fetch class details with course and students
// app.get("/classes/:moduleCode", async (req, res) => {
//   try {
//     const classDetails = await Class.findOne({ moduleCode: req.params.moduleCode })
//       .populate('students');
    
//     if (!classDetails) {
//       return res.status(404).json({ error: "Class not found" });
//     }
//     res.json(classDetails);
//   } catch (error) {
//     console.error("Error fetching class details:", error);
//     res.status(500).json({ error: "Failed to fetch class details" });
//   }
// });

app.get("/attendance/low", async (req, res) => {
  try {
    const currentDate = new Date();
    const pipeline = [
      {
        $lookup: {
          from: "classes",
          localField: "classId",
          foreignField: "_id",
          as: "class"
        }
      },
      {
        $unwind: "$class"
      },
      {
        $match: {
          $expr: {
            $or: [
              { $lt: ["$class.date", currentDate.toISOString().split('T')[0]] },
              {
                $and: [
                  { $eq: ["$class.date", currentDate.toISOString().split('T')[0]] },
                  { $lt: ["$class.endTime", currentDate.toTimeString().slice(0, 5)] }
                ]
              }
            ]
          }
        }
      },
      {
        $group: {
          _id: {
            studentId: "$studentId",
            moduleCode: "$class.moduleCode"  // Include moduleCode in grouping
          },
          totalAttended: {
            $sum: {
              $cond: [
                { $in: ["$status", ["Present", "Late"]] },
                1,
                0
              ]
            }
          },
          totalClasses: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "students",
          localField: "_id.studentId",
          foreignField: "_id",
          as: "student"
        }
      },
      {
        $unwind: "$student"
      },
      {
        $project: {
          studentId: "$student",
          moduleCode: "$_id.moduleCode",  // Include moduleCode in output
          attendanceRate: {
            $multiply: [{ $divide: ["$totalAttended", "$totalClasses"] }, 100]
          },
          studentIDNumber: "$student.studentID"
        }
      },
      {
        $match: {
          attendanceRate: { $lt: 40 }
        }
      },
      {
        $sort: { 
          studentIDNumber: 1,
          moduleCode: 1  // Secondary sort by module code
        }
      }
    ];

    const lowAttendance = await Attendance.aggregate(pipeline);
    res.json(lowAttendance);
  } catch (error) {
    console.error("Error fetching low attendance:", error);
    res.status(500).json({ error: "Failed to fetch low attendance data" });
  }
});

// Fetch attendance records for a class
// Update the attendance fetch endpoint
app.get("/attendance/:classId", async (req, res) => {
  try {
    const { date } = req.query;
    const query = { 
      classId: req.params.classId,
      ...(date && { date: new Date(date) })
    };
    
    const attendance = await Attendance.find(query)
      .populate('studentId');
    res.json(attendance);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ error: "Failed to fetch attendance records" });
  }
});

// Update or create attendance record
app.post("/attendance", async (req, res) => {
  try {
    const { classId, studentId, status, date } = req.body;
    
    const attendance = await Attendance.findOneAndUpdate(
      { 
        classId, 
        studentId,
        date: new Date(date) // Use the date from the request
      },
      { 
        $set: { 
          status,
          classId,
          studentId,
          date: new Date(date)
        }
      },
      { upsert: true, new: true }
    );

    res.json(attendance);
  } catch (error) {
    console.error("Error updating attendance:", error);
    res.status(500).json({ error: "Failed to update attendance" });
  }
});

// Add this new endpoint for camera-based attendance
app.post("/attendance/camera", async (req, res) => {
  try {
    const { classId, studentId, date } = req.body;
    
    // Get class details to check start time
    const classDetails = await Class.findById(classId);
    if (!classDetails) {
      return res.status(404).json({ error: "Class not found" });
    }

    // Convert class start time to minutes since midnight
    const [startHours, startMinutes] = classDetails.startTime.split(':').map(Number);
    const classStartMins = startHours * 60 + startMinutes;

    // Get current time in minutes since midnight
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    // Determine attendance status
    let status;
    if (currentMins <= classStartMins + 30) {
      status = "Present";
    } else {
      status = "Late";
    }

    // Update or create attendance record
    const attendance = await Attendance.findOneAndUpdate(
      { 
        classId, 
        studentId,
        date: new Date(date)
      },
      { 
        $set: { 
          status,
          classId,
          studentId,
          date: new Date(date)
        }
      },
      { upsert: true, new: true }
    );

    res.json({ attendance, status });
  } catch (error) {
    console.error("Error updating attendance:", error);
    res.status(500).json({ error: "Failed to update attendance" });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

// Replace the existing dates endpoint with this one
app.get("/classes_dates/:moduleCode", async (req, res) => {
  try {
    const { moduleCode } = req.params;
    console.log("Searching for module Code:", moduleCode);
    
    // Find all classes for this course code
    const classes = await Class.find({ 
      moduleCode: moduleCode 
    }).select('date').lean();
    
    console.log("Found classes:", classes);
    
    if (!classes || classes.length === 0) {
      return res.status(404).json({ error: "No classes found for this course" });
    }
    
    // Extract and format dates
    const dates = classes
      .filter(c => c.date)
      .map(c => c.date)  // Already in YYYY-MM-DD format from our schema
      .sort();
    
    console.log("Available dates:", dates);
    res.json(dates);
  } catch (error) {
    console.error("Error fetching class dates:", error);
    res.status(500).json({ error: "Failed to fetch class dates" });
  }
});

// Fetch modules by course
app.get("/modules/:course", async (req, res) => {
  try {
    const { course } = req.params;
    console.log("Searching for modules:", course);
    
    // Find all modules for this course
    const modules = await Module.find({ 
      course: course 
    }).select('moduleCode moduleName instructor')
      .lean();
    
    console.log("Found modules:", modules);
    
    if (!modules || modules.length === 0) {
      return res.status(404).json({ error: "No modules found for this course" });
    }
    
    console.log(`Found ${modules.length} modules for ${course}`);
    res.json(modules);
  } catch (error) {
    console.error("Error fetching modules:", error);
    res.status(500).json({ error: "Failed to fetch modules" });
  }
});

// Fetch students enrolled in a specific module
// Get class details and students for a specific module and date
// Remove or comment out these duplicate routes
// app.get("/classes/:moduleCode/:date", async (req, res) => { ... });
// app.get("/classes_dates/:moduleCode", async (req, res) => { ... });
// app.post("/attendance", async (req, res) => { ... });

// Keep only these updated versions of the routes
app.get("/classes/:moduleCode", async (req, res) => {
  try {
    const { moduleCode } = req.params;
    console.log("Fetching initial class and students for module:", moduleCode);
    
    // Get latest class details
    const classDetails = await Class.findOne({ 
      moduleCode 
    }).lean();
    
    // Get enrolled students
    const students = await Student.find({ 
      modulesEnrolled: moduleCode 
    }).select('studentID name')
      .lean();

    if (!classDetails) {
      return res.status(404).json({ error: "No class found" });
    }

    res.json({
      class: classDetails,
      students: students
    });
  } catch (error) {
    console.error("Error fetching class details:", error);
    res.status(500).json({ error: "Failed to fetch class details" });
  }
});

app.get("/classes/:moduleCode/:date", async (req, res) => {
  try {
    const { moduleCode, date } = req.params;
    console.log("Fetching class and students for module:", moduleCode, "date:", date);
    
    // Get class details for specific date
    const classDetails = await Class.findOne({ 
      moduleCode,
      date
    }).lean();
    
    if (!classDetails) {
      return res.status(404).json({ error: "No class found for this date" });
    }

    // Get enrolled students
    const students = await Student.find({ 
      modulesEnrolled: moduleCode 
    }).select('studentID name')
      .lean();

    // Get attendance records for this class and date
    const attendanceRecords = await Attendance.find({
      classId: classDetails._id,
      date: new Date(date)
    }).lean();

    // Map attendance status to students
    const studentsWithAttendance = students.map(student => {
      const attendanceRecord = attendanceRecords.find(
        record => record.studentId.toString() === student._id.toString()
      );
      return {
        ...student,
        attendanceStatus: attendanceRecord ? attendanceRecord.status : "Not Marked"
      };
    });

    res.json({
      class: classDetails,
      students: studentsWithAttendance
    });
  } catch (error) {
    console.error("Error fetching class details:", error);
    res.status(500).json({ error: "Failed to fetch class details" });
  }
});

// Student Registration API with Module Enrollment
app.post("/students/register", async (req, res) => {
  try {
    const { name, email, course, images } = req.body;  // Remove moduleCodes from destructuring
    console.log("📝 Registering student:", { name, email, course });

    // Validate required fields
    if (!name || !email || !course || !images || !images.length) {
      return res.status(400).json({ 
        success: false, 
        message: "Name, email, course, and face images are required" 
      });
    }

    // Check if email already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ 
        success: false, 
        message: "Email already registered" 
      });
    }

    // Generate course prefix for student ID
    let coursePrefix;
    switch (course) {
      case "Computer Science":
        coursePrefix = "1";
        break;
      case "Business":
        coursePrefix = "2";
        break;
      case "Engineering":
        coursePrefix = "3";
        break;
      default:
        coursePrefix = "0";
    }

    // Find the last student ID for this course
    const lastStudent = await Student.findOne({ course })
      .sort({ studentID: -1 });
    
    let nextNumber = 1;
    if (lastStudent && lastStudent.studentID) {
      const currentNumber = parseInt(lastStudent.studentID.slice(-3));
      nextNumber = currentNumber + 1;
    }

    // Generate student ID (e.g., 1001 for CS, 2001 for Business)
    const studentID = `${coursePrefix}${nextNumber.toString().padStart(3, '0')}`;

    // Get all modules for the course
    const modules = await Module.find({ course: course });
    const moduleCodes = modules.map(module => module.moduleCode);

    if (!moduleCodes.length) {
      throw new Error("No modules found for this course");
    }

    // Get face embeddings first
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/students/train",
        {
          studentId: studentID,
          images: images
        },
        {
          timeout: 180000 // Add timeout of 30 seconds
        }
      );

      if (!response.data || !response.data.embeddings) {
        throw new Error("Invalid response from face recognition server");
      }

      // Create new student with enrolled modules and face embeddings
      const newStudent = new Student({
        studentID,
        name,
        email,
        course: course,
        yearOfStudy: 1,
        modulesEnrolled: moduleCodes,
        faceEmbeddings: response.data.embeddings
      });

      await newStudent.save();

      // Create attendance records
      const classes = await Class.find({ moduleCode: { $in: moduleCodes } });
      const attendanceRecords = classes.map(classObj => ({
        classId: classObj._id,
        studentId: newStudent._id,
        date: classObj.date,
        status: "Absent",
        timestamp: new Date()
      }));

      await Attendance.insertMany(attendanceRecords);

      res.status(201).json({
        success: true,
        message: "Student registered with face recognition",
        student: {
          studentID,
          name,
          email,
          course: course,
          modulesEnrolled: moduleCodes
        }
      });

    } catch (error) {
      console.error("Face registration error details:", error.response?.data || error.message);
      throw new Error(`Face registration failed: ${error.response?.data?.message || error.message}`);
    }

  } catch (error) {
    console.error("❌ Error registering student:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to register student: " + error.message 
    });
  }
});


// // Get all attendance records for a specific student
app.get("/student/id/:studentId", async (req, res) => {
  try {
    const student = await Student.findOne({ studentID: req.params.studentId });
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json({ studentId: student._id });
  } catch (error) {
    console.error("Error finding student:", error);
    res.status(500).json({ error: "Failed to find student" });
  }
});

// Get class by location and date
// Get class by location and date, checking time range
app.get("/class/location/:location/:date", async (req, res) => {
  try {
    const { location, date } = req.params;
    
    // Format current time as HH:mm
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    console.log("Current time:", currentTime);  // For debugging

    const classDetails = await Class.findOne({ 
      location: location,
      date: date,
      $expr: {
        $and: [
          { $lte: ["$startTime", currentTime] },
          { $gte: ["$endTime", currentTime] }
        ]
      }
    }).lean();
    
    if (!classDetails) {
      return res.status(404).json({ error: "No active class found for this location and date" });
    }

    res.json({ class: classDetails });
  } catch (error) {
    console.error("Error fetching class details:", error);
    res.status(500).json({ error: "Failed to fetch class details" });
  }
});
// Add this new endpoint for student search
app.get("/students/search", async (req, res) => {
  try {
    const { query } = req.query;
    const searchRegex = new RegExp(query, 'i');

    const students = await Student.find({
      $or: [
        { studentID: searchRegex },
        { name: searchRegex },
        { email: searchRegex }
      ]
    });

    res.json(students);
  } catch (error) {
    console.error("Error searching students:", error);
    res.status(500).json({ error: "Failed to search students" });
  }
});
// Get student details by ID
app.get("/students/:id", async (req, res) => {
  try {
    // Convert string ID to ObjectId
    const studentId = new mongoose.Types.ObjectId(req.params.id);
    const student = await Student.findById(studentId)
      .select('studentID name email course yearOfStudy modulesEnrolled')
      .lean();

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(student);
  } catch (error) {
    console.error("Error fetching student details:", error);
    res.status(500).json({ error: "Failed to fetch student details" });
  }
});

app.get("/attendance/student/:id", async (req, res) => {
  try {
    const attendanceRecords = await Attendance.aggregate([
      {
        $match: {
          studentId: new mongoose.Types.ObjectId(req.params.id)
        }
      },
      {
        $lookup: {
          from: "classes",
          localField: "classId",
          foreignField: "_id",
          as: "classDetails"
        }
      },
      {
        $unwind: "$classDetails"
      },
      {
        $project: {
          _id: 1,
          date: 1,
          status: 1,
          moduleCode: "$classDetails.moduleCode",
          classId: 1
        }
      },
      {
        $sort: { date: -1 }
      }
    ]);

    res.json(attendanceRecords);
  } catch (error) {
    console.error("Error fetching student attendance:", error);
    res.status(500).json({ error: "Failed to fetch attendance records" });
  }
});

// Admin Registration endpoint
app.post("/admin/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create new admin
    const newAdmin = new Admin({
      name,
      email,
      passwordHash,
      role
    });

    await newAdmin.save();

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (error) {
    console.error("Error registering admin:", error);
    res.status(500).json({ message: "Failed to register admin" });
  }
});


// Delete all attendance records for a student
app.delete("/attendance/student/:studentId", async (req, res) => {
  try {
    const student = await Student.findOne({ studentID: req.params.studentId });
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: "Student not found" 
      });
    }

    const result = await Attendance.deleteMany({ studentId: student._id });

    res.json({ 
      success: true, 
      message: `Successfully deleted ${result.deletedCount} attendance records`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("Error deleting attendance records:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete attendance records" 
    });
  }
});

// Temporary storage for training embeddings
let temporaryEmbeddings = {
  embeddings: [],
  labels: []
};

// Modified embeddings endpoint for file storage
app.post('/api/embeddings/temp', async (req, res) => {
  try {
    const { studentId, embeddings } = req.body;
    
    // Read existing data if file exists
    let data = { embeddings: [], labels: [] };
    try {
      const fileContent = await fs.readFile(TEMP_EMBEDDINGS_FILE, 'utf8');
      data = JSON.parse(fileContent);
    } catch (err) {
      // File doesn't exist yet, use empty data
    }
    
    // Add new embeddings
    data.embeddings.push(...embeddings);
    data.labels.push(...Array(embeddings.length).fill(studentId));
    
    // Save to file
    await fs.writeFile(TEMP_EMBEDDINGS_FILE, JSON.stringify(data));
    
    res.json({
      success: true,
      message: 'Embeddings stored in temporary file'
    });
  } catch (error) {
    console.error('Error storing embeddings:', error);
    res.status(500).json({ error: 'Failed to store embeddings' });
  }
});

// Get embeddings for training
app.get('/api/embeddings', async (req, res) => {
  try {
    // Get stored embeddings from database
    const students = await Student.find({}).select('studentID faceEmbeddings');
    const storedEmbeddings = [];
    const storedLabels = [];
    
    students.forEach(student => {
      if (student.faceEmbeddings && student.faceEmbeddings.length > 0) {
        storedEmbeddings.push(...student.faceEmbeddings);
        storedLabels.push(...Array(student.faceEmbeddings.length).fill(student.studentID));
      }
    });
    
    // Get temporary embeddings from file if exists
    try {
      const fileContent = await fs.readFile(TEMP_EMBEDDINGS_FILE, 'utf8');
      const tempData = JSON.parse(fileContent);
      
      // Combine with stored embeddings
      const allEmbeddings = [...storedEmbeddings, ...tempData.embeddings];
      const allLabels = [...storedLabels, ...tempData.labels];
      
      // Delete temporary file after reading
      await fs.unlink(TEMP_EMBEDDINGS_FILE);
      
      res.json({
        embeddings: allEmbeddings,
        labels: allLabels
      });
    } catch (err) {
      // If no temporary file exists, just return stored embeddings
      res.json({
        embeddings: storedEmbeddings,
        labels: storedLabels
      });
    }
  } catch (error) {
    console.error('Error fetching embeddings:', error);
    res.status(500).json({ error: 'Failed to fetch embeddings' });
  }
});




