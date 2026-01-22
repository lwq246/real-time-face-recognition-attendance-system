import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import book from "../assets/book.png";

interface Class {
  _id: string;
  moduleCode: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
}

interface Student {
  _id: string;
  studentID: string;
  name: string;
}

interface ApiResponse {
  class: Class | null;
  students: Student[];
}

function Attendance() {
  const navigate = useNavigate();
  const { moduleCode } = useParams();
  const [classDetails, setClassDetails] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [attendanceStatus, setAttendanceStatus] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch class details and students
        const response = await axios.get<ApiResponse>(
          `http://localhost:5000/classes/${moduleCode}`
        );

        if (!response.data.class) {
          console.log("No class details found");
          return;
        }

        setClassDetails(response.data.class);
        setStudents(response.data.students || []);

        // Fetch available dates
        const datesResponse = await axios.get(
          `http://localhost:5000/classes_dates/${moduleCode}`
        );
        const dates = datesResponse.data || [];
        setAvailableDates(dates);

        if (dates.length > 0) {
          const firstDate = dates[0];
          setSelectedDate(firstDate);

          // Only fetch attendance if we have both class ID and date
          if (response.data.class._id) {
            const attendanceResponse = await axios.get(
              `http://localhost:5000/attendance/${response.data.class._id}?date=${firstDate}`
            );

            // Create attendance status map from database records
            const statusMap: Record<string, string> = {};
            response.data.students.forEach((student) => {
              const record = attendanceResponse.data?.find(
                (r: any) => r.studentId?._id === student._id
              );
              statusMap[student._id] = record?.status || "Not Marked";
            });
            setAttendanceStatus(statusMap);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (moduleCode) {
      fetchData();
    }
  }, [moduleCode]);

  const handleBack = () => {
    navigate("/Course");
  };

  const updateAttendance = async (studentId: string, status: string) => {
    try {
      await axios.post(`http://localhost:5000/attendance`, {
        classId: classDetails?._id,
        studentId,
        status,
        date: selectedDate,
      });
      setAttendanceStatus((prev) => ({
        ...prev,
        [studentId]: status,
      }));
    } catch (error) {
      console.error("Error updating attendance:", error);
    }
  };

  // Update this select onChange handler
  const handleDateChange = async (newDate: string) => {
    setSelectedDate(newDate);

    try {
      // Fetch class details for the selected date
      const classDetailsResponse = await axios.get(
        `http://localhost:5000/classes/${moduleCode}/${newDate}`
      );
      setClassDetails(classDetailsResponse.data.class);

      // Fetch attendance records for the selected date
      if (classDetailsResponse.data.class?._id) {
        const attendanceResponse = await axios.get(
          `http://localhost:5000/attendance/${classDetailsResponse.data.class._id}?date=${newDate}`
        );

        // Update attendance status for all students
        const statusMap: Record<string, string> = {};
        students.forEach((student) => {
          const record = attendanceResponse.data.find(
            (r: any) => r.studentId._id === student._id
          );
          statusMap[student._id] = record ? record.status : "Not Marked";
        });
        setAttendanceStatus(statusMap);
      }
    } catch (err) {
      console.error("Error fetching updated data:", err);
    }
  };

  // Update the select element in the render section
  return (
    <div className="h-[100vh] bg-[#9363ff] w-full">
      <div className="flex justify-between bg-white h-[10vh] items-center px-6 w-full">
        <img
          src={book}
          alt="Book Icon"
          className="w-10 h-10 cursor-pointer"
          onClick={() => navigate("/course")}
        />
        <button
          onClick={handleBack}
          className="!bg-[#7E57C2] !text-white font-semibold rounded-md transition-colors hover:!bg-[#5E35B1] h-[60%] px-4"
        >
          Back
        </button>
      </div>

      <div className="p-8">
        <div className="bg-white rounded-lg p-6 mb-8">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold mb-2">Course:</p>
              <p className="p-2">{classDetails?.moduleCode}</p>
            </div>
            <div>
              <p className="font-semibold mb-2">Date:</p>
              <p className="p-2">{selectedDate}</p>
            </div>
            <div>
              <p className="font-semibold mb-2">Time:</p>
              <p className="p-2">
                {classDetails?.startTime} - {classDetails?.endTime}
              </p>
            </div>
            <div>
              <p className="font-semibold mb-2">Location:</p>
              <p className="p-2">{classDetails?.location}</p>
            </div>
            <div className="col-span-2">
              <p className="font-semibold mb-2">Select Date:</p>
              <select
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="border p-2 rounded w-full"
              >
                {availableDates.map((date) => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg overflow-hidden">
          <div className="max-h-[35vh] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-[#7E57C2] text-white sticky top-0">
                <tr>
                  <th className="p-4 text-left">Student ID</th>
                  <th className="p-4 text-left">Name</th>
                  <th className="p-4 text-left">Attendance</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id} className="border-t">
                    <td className="p-4">{student.studentID}</td>
                    <td className="p-4">{student.name}</td>
                    <td className="p-4">{attendanceStatus[student._id]}</td>
                    <td className="p-4">
                      <select
                        className="border p-1 rounded"
                        value={attendanceStatus[student._id]}
                        onChange={(e) =>
                          updateAttendance(student._id, e.target.value)
                        }
                      >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Late">Late</option>
                      </select>
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

export default Attendance;
