// import axios from "axios";
// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import book from "../assets/book.png";

// interface Class {
//   _id: string;
//   moduleCode: string; // Changed from courseId
//   date: string;
//   startTime: string;
//   endTime: string;
//   location: string;
// }

// interface Student {
//   _id: string;
//   studentID: string;
//   name: string;
// }

// interface Attendance {
//   _id: string;
//   studentId: Student;
//   status: "Present" | "Absent" | "Late";
// }

// function Attendance() {
//   const navigate = useNavigate();
//   const { moduleCode } = useParams(); // Changed from courseId
//   const [classDetails, setClassDetails] = useState<Class | null>(null);
//   const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedDate, setSelectedDate] = useState(
//     new Date().toISOString().split("T")[0]
//   );
//   const [availableDates, setAvailableDates] = useState<string[]>([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch class details with enrolled students
//         const classResponse = await axios.get(
//           `http://localhost:5000/classes/${moduleCode}`
//         );
//         setClassDetails(classResponse.data);

//         // Fetch available dates for this course
//         const datesResponse = await axios.get(
//           `http://localhost:5000/classes_dates/${moduleCode}`
//         );
//         setAvailableDates(datesResponse.data);
//         setSelectedDate(datesResponse.data[0] || "");

//         // Fetch attendance records for this class
//         const attendanceResponse = await axios.get(
//           `http://localhost:5000/attendance/${classResponse.data._id}?date=${datesResponse.data[0]}`
//         );
//         setAttendanceRecords(attendanceResponse.data);

//         setLoading(false);
//       } catch (err) {
//         console.error("Error fetching data:", err);
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [moduleCode]); // Changed dependency

//   const handleLogout = () => {
//     localStorage.removeItem("adminToken");
//     navigate("/");
//   };

//   const updateAttendance = async (
//     studentId: string,
//     status: "Present" | "Absent" | "Late"
//   ) => {
//     try {
//       await axios.post(`http://localhost:5000/attendance`, {
//         classId: classDetails?._id,
//         studentId,
//         status,
//         date: selectedDate, // Make sure this matches the selected date
//       });

//       // Refresh attendance records with the correct date
//       const response = await axios.get(
//         `http://localhost:5000/attendance/${classDetails?._id}?date=${selectedDate}`
//       );
//       setAttendanceRecords(response.data);
//     } catch (err) {
//       console.error("Error updating attendance:", err);
//     }
//   };

//   return (
//     <div className="h-[100vh] bg-[#9363ff] w-full">
//       <div className="flex justify-between bg-white h-[10vh] items-center px-6 w-full">
//         <img
//           src={book}
//           alt="Book Icon"
//           className="w-10 h-10 cursor-pointer"
//           onClick={() => navigate("/course")}
//         />
//         <button
//           onClick={handleLogout}
//           className="!bg-[#7E57C2] !text-white font-semibold rounded-md transition-colors hover:!bg-[#5E35B1] h-[60%] px-4"
//         >
//           Log Out
//         </button>
//       </div>

//       <div className="p-8">
//         <div className="bg-white rounded-lg p-6 mb-8">
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <p className="font-semibold mb-2">Course:</p>
//               <p className="p-2">
//                 {classDetails?.moduleCode}{" "}
//                 {/* Changed from courseId.courseCode */}
//               </p>
//             </div>
//             <div>
//               <p className="font-semibold mb-2">Date:</p>
//               <p className="p-2">{classDetails?.date}</p>
//             </div>
//             <div>
//               <p className="font-semibold mb-2">Time:</p>
//               <p className="p-2">
//                 {classDetails?.startTime} - {classDetails?.endTime}
//               </p>
//             </div>
//             <div>
//               <p className="font-semibold mb-2">Location:</p>
//               <p className="p-2">{classDetails?.location}</p>
//             </div>
//             <div className="col-span-2">
//               <p className="font-semibold mb-2">Select Date:</p>
//               <select
//                 value={selectedDate}
//                 onChange={async (e) => {
//                   const newDate = e.target.value;
//                   setSelectedDate(newDate);

//                   try {
//                     // Fetch class details for the selected date
//                     const classDetailsResponse = await axios.get(
//                       `http://localhost:5000/classes/${courseCode}/${newDate}`
//                     );
//                     setClassDetails(classDetailsResponse.data);

//                     // Fetch attendance records for the selected date
//                     const attendanceResponse = await axios.get(
//                       `http://localhost:5000/attendance/${classDetails?._id}?date=${newDate}`
//                     );
//                     setAttendanceRecords(attendanceResponse.data);
//                   } catch (err) {
//                     console.error("Error fetching updated data:", err);
//                   }
//                 }}
//                 className="border p-2 rounded w-full"
//               >
//                 {availableDates.map((date) => (
//                   <option key={date} value={date}>
//                     {new Date(date).toLocaleDateString()}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-lg overflow-hidden">
//           <table className="w-full">
//             <thead className="bg-[#7E57C2] text-white">
//               <tr>
//                 <th className="p-4 text-left">Student ID</th>
//                 <th className="p-4 text-left">Name</th>
//                 <th className="p-4 text-left">Attendance</th>
//                 <th className="p-4 text-left">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {classDetails?.students.map((student) => {
//                 const attendance = attendanceRecords.find(
//                   (record) => record.studentId._id === student._id
//                 );
//                 return (
//                   <tr key={student._id} className="border-t">
//                     <td className="p-4">{student.studentID}</td>
//                     <td className="p-4">{student.name}</td>
//                     <td className="p-4">
//                       {attendance?.status || "Not Marked"}
//                     </td>
//                     <td className="p-4">
//                       <select
//                         className="border p-1 rounded"
//                         value={attendance?.status || "Absent"}
//                         onChange={(e) =>
//                           updateAttendance(
//                             student._id,
//                             e.target.value as "Present" | "Absent" | "Late"
//                           )
//                         }
//                       >
//                         <option value="Present">Present</option>
//                         <option value="Absent">Absent</option>
//                         <option value="Late">Late</option>
//                       </select>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Attendance;
