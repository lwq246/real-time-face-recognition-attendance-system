import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

function StudentSearch() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState<string>("");

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length >= 2) {
      try {
        const response = await fetch(
          `http://localhost:5000/students/search?query=${query}`
        );
        if (!response.ok) {
          throw new Error("Search failed");
        }
        const data = await response.json();
        setStudents(data);
        setError("");
      } catch (error) {
        console.error("Error searching students:", error);
        setError("Failed to search students");
      }
    } else {
      setStudents([]);
    }
  };

  const viewStudentDetails = (studentId: string) => {
    navigate(`/student-details/${studentId}`);
  };

  return (
    <div className="h-[100vh] bg-[#9363ff] w-full">
      <div className="flex justify-between bg-white h-[10vh] items-center px-6 w-full">
        <img src={book} alt="Book Icon" className="w-10 h-10" />
        <Link
          to="/student"
          className="!bg-[#7E57C2] !text-white font-semibold rounded-md transition-colors hover:!bg-[#5E35B1] h-[60%] px-4 flex items-center"
        >
          Back
        </Link>
      </div>

      <div className="flex flex-col items-center p-8 h-[90vh] w-full bg-[#9363ff] overflow-y-auto">
        <div className="w-full max-w-3xl bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Student Search
          </h2>

          <input
            type="text"
            placeholder="Search students by ID, name, or email"
            className="w-full p-3 border rounded-md mb-6 focus:outline-none focus:ring-2 focus:ring-[#7E57C2]"
            value={searchQuery}
            onChange={handleSearch}
          />

          {error && (
            <div className="text-red-500 mb-4 text-center">{error}</div>
          )}

          <div className="space-y-4">
            {students.length === 0 && searchQuery.length >= 2 ? (
              <div className="text-center text-gray-500">No students found</div>
            ) : (
              students.map((student) => (
                <div
                  key={student._id}
                  className="border rounded-md p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => viewStudentDetails(student._id)}
                >
                  <div className="font-semibold text-lg">
                    {student.name} ({student.studentID})
                  </div>
                  <div className="text-gray-600 mt-1">
                    Email: {student.email}
                  </div>
                  <div className="text-gray-600">
                    Course: {student.course} | Year: {student.yearOfStudy}
                  </div>
                  <div className="text-gray-600">
                    Modules: {student.modulesEnrolled.join(", ")}
                  </div>
                  <div className="text-[#7E57C2] mt-2 text-sm font-medium">
                    Click to view attendance details →
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentSearch;
