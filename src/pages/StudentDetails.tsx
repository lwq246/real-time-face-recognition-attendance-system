import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import book from "../assets/book.png";

interface Student {
  _id: string;
  studentID: string;
  name: string;
  email: string;
  course: string;
  yearOfStudy: number;
  modulesEnrolled: string[];
}

interface Attendance {
  _id: string;
  classId: string;
  date: string;
  status: string;
  moduleCode: string;
}

function StudentDetails() {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        // Fetch student details
        const studentResponse = await fetch(`http://localhost:5000/students/${id}`);
        if (!studentResponse.ok) {
          throw new Error("Failed to fetch student details");
        }
        const studentData = await studentResponse.json();
        setStudent(studentData);

        // Fetch attendance records
        const attendanceResponse = await fetch(`http://localhost:5000/attendance/student/${id}`);
        if (!attendanceResponse.ok) {
          throw new Error("Failed to fetch attendance records");
        }
        const attendanceData = await attendanceResponse.json();
        setAttendance(attendanceData);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching student details:", error);
        setError("Failed to load student information");
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [id]);

  return (
    <div className="h-[100vh] bg-[#9363ff] w-full">
      <div className="flex justify-between bg-white h-[10vh] items-center px-6 w-full">
        <img src={book} alt="Book Icon" className="w-10 h-10" />
        <Link
          to="/student-search"
          className="!bg-[#7E57C2] !text-white font-semibold rounded-md transition-colors hover:!bg-[#5E35B1] h-[60%] px-4 flex items-center"
        >
          Back
        </Link>
      </div>

      <div className="flex flex-col items-center p-8 h-[90vh] w-full bg-[#9363ff] overflow-y-auto">
        <div className="w-full max-w-3xl bg-white rounded-lg p-6 shadow-lg">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : error ? (
            <div className="text-red-500 text-center py-8">{error}</div>
          ) : student ? (
            <>
              <h2 className="text-2xl font-bold mb-6 text-center">
                Student Details
              </h2>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-xl font-semibold mb-2">{student.name}</h3>
                <p className="text-gray-700">ID: {student.studentID}</p>
                <p className="text-gray-700">Email: {student.email}</p>
                <p className="text-gray-700">Course: {student.course}</p>
                <p className="text-gray-700">Year of Study: {student.yearOfStudy}</p>
                <p className="text-gray-700">
                  Modules: {student.modulesEnrolled.join(", ")}
                </p>
              </div>

              <h3 className="text-xl font-semibold mb-4">Attendance Records</h3>
              
              {attendance.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No attendance records found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                        <th className="py-3 px-6 text-left">Date</th>
                        <th className="py-3 px-6 text-left">Module</th>
                        <th className="py-3 px-6 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm">
                      {attendance.map((record) => (
                        <tr key={record._id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-6 text-left">
                            {new Date(record.date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-6 text-left">{record.moduleCode}</td>
                          <td className="py-3 px-6 text-left">
                            <span className={`py-1 px-3 rounded-full text-xs ${
                              record.status === 'Present' 
                                ? 'bg-green-200 text-green-800' 
                                : record.status === 'Late'
                                ? 'bg-yellow-200 text-yellow-800'
                                : 'bg-red-200 text-red-800'
                            }`}>
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">Student not found</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDetails;