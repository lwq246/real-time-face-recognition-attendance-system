// import axios from "axios";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import book from "../assets/book.png";

// interface Course {
//   _id: string;
//   courseCode: string;
//   courseName: string;
//   educationLevel: string;
//   instructor: string;
// }

// function Course() {
//   const navigate = useNavigate();
//   const [courses, setCourses] = useState<Course[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const handleLogout = () => {
//     localStorage.removeItem("adminToken");
//     navigate("/");
//   };

//   useEffect(() => {
//     const fetchCourses = async () => {
//       try {
//         const response = await axios.get("http://localhost:5000/courses");
//         setCourses(response.data);
//         setLoading(false);
//       } catch (err) {
//         console.error("Error fetching courses:", err);
//         setError("Failed to fetch courses");
//         setLoading(false);
//       }
//     };

//     fetchCourses();
//   }, []);

//   if (loading)
//     return <div className="text-center text-white p-8">Loading...</div>;
//   if (error) return <div className="text-center text-red-500 p-8">{error}</div>;

//   const handleCourseClick = (courseCode: string) => {
//     navigate(`/attendance/${courseCode}`);
//   };

//   return (
//     <div className="h-[100vh] bg-[#9363ff] w-full">
//       <div className="flex justify-between bg-white h-[10vh] items-center px-6 w-full">
//         <img
//           src={book}
//           alt="Book Icon"
//           className="w-10 h-10 cursor-pointer"
//           onClick={() => navigate("/home")}
//         />
//         <button
//           onClick={handleLogout}
//           className="!bg-[#7E57C2] !text-white font-semibold rounded-md transition-colors hover:!bg-[#5E35B1] h-[60%] px-4"
//         >
//           Log Out
//         </button>
//       </div>

//       <div className="p-8">
//         <h1 className="text-3xl font-bold text-white mb-8">
//           Available Courses
//         </h1>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {courses.map((course) => (
//             <div
//               key={course._id}
//               onClick={() => handleCourseClick(course.courseCode)}
//               className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
//             >
//               <h2 className="text-2xl font-semibold text-[#7E57C2] mb-2">
//                 {course.courseCode}
//               </h2>
//               <p className="text-xl text-gray-800 mb-2">{course.courseName}</p>
//               <p className="text-gray-600">Level: {course.educationLevel}</p>
//               <p className="text-gray-600">Instructor: {course.instructor}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Course;
