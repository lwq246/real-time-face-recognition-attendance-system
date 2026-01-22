import { Route, Routes } from "react-router-dom";
import About from "./pages/About";
import Attendance from "./pages/Attendance";
import Course from "./pages/Course";
import FaceRegistration from "./pages/FaceRegistration";
import Home from "./pages/Home";
import Login from "./pages/Login";
import LowAttendance from "./pages/LowAttendance";
import Module from "./pages/Module";
import Register from "./pages/Register";
import Student from "./pages/Student";
import StudentDetails from "./pages/StudentDetails";
import StudentSearch from "./pages/StudentSearch";
import AdminRegistration from "./pages/AdminRegistration";
function App() {
  return (
    <div className="min-h-screen w-screen">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/course" element={<Course />} />
        <Route path="/modules/:course" element={<Module />} />
        <Route path="/attendance/:moduleCode" element={<Attendance />} />
        <Route path="/face-registration" element={<FaceRegistration />} />
        // In your router setup
        <Route path="/low-attendance" element={<LowAttendance />} />
        <Route path="/student-search" element={<StudentSearch />} />
        <Route path="/student" element={<Student />} />
        // In your routes configuration
        <Route path="/student-details/:id" element={<StudentDetails />} />
        <Route path="/admin-registration" element={<AdminRegistration />} />
      </Routes>
    </div>
  );
}

export default App;
