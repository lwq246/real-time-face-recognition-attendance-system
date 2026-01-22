import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import book from "../assets/book.png";

interface StudentAttendance {
  studentId: {
    _id: string;
    studentID: string;
    name: string;
  };
  moduleCode: string;
  attendanceRate: number;
}

function LowAttendance() {
  const navigate = useNavigate();
  const [lowAttendanceStudents, setLowAttendanceStudents] = useState<
    StudentAttendance[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/attendance/low"
        );
        setLowAttendanceStudents(response.data);
      } catch (error) {
        console.error("Error fetching low attendance data:", error);
      }
    };

    fetchData();
  }, []);

  const handleBack = () => {
    navigate("/student");
  };

  return (
    <div className="h-[100vh] bg-[#9363ff] w-full">
      <div className="flex justify-between bg-white h-[10vh] items-center px-6 w-full">
        <img
          src={book}
          alt="Book Icon"
          className="w-10 h-10 cursor-pointer"
          onClick={() => navigate("/home")}
        />
        <button
          onClick={handleBack}
          className="!bg-[#7E57C2] !text-white font-semibold rounded-md transition-colors hover:!bg-[#5E35B1] h-[60%] px-4"
        >
          Back
        </button>
      </div>

      <div className="p-8">
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="max-h-[70vh] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-[#7E57C2] text-white sticky top-0">
                <tr>
                  <th className="p-4 text-left">Student ID</th>
                  <th className="p-4 text-left">Name</th>
                  <th className="p-4 text-left">Module</th>
                  <th className="p-4 text-left">Attendance Rate</th>
                </tr>
              </thead>
              <tbody>
                {lowAttendanceStudents.map((student) => (
                  <tr
                    key={`${student.studentId._id}-${student.moduleCode}`}
                    className="border-t"
                  >
                    <td className="p-4">{student.studentId.studentID}</td>
                    <td className="p-4">{student.studentId.name}</td>
                    <td className="p-4">{student.moduleCode}</td>
                    <td className="p-4 text-red-500">
                      {student.attendanceRate.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LowAttendance;
