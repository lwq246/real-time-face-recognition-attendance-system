import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import book from "../assets/book.png";

// Fix interface name and usage
// Update interface to match Module schema
interface Module {
  _id: string;
  moduleCode: string;
  moduleName: string;
  course: string;
  instructor: string;
}

function Module() {
  const navigate = useNavigate();
  const { course } = useParams();
  const [modules, setModules] = useState<Module[]>([]); // Fix type here

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/modules/${course}`
        );
        setModules(response.data);
      } catch (error) {
        console.error("Error fetching modules:", error);
      }
    };

    fetchModules();
  }, [course]);

  const handleBack = () => {
    navigate("/Course");
  };

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
        <h1 className="text-3xl font-bold text-white mb-6">{course} Modules</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <div
              key={module._id}
              className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/attendance/${module.moduleCode}`)}
            >
              <h2 className="text-xl font-semibold mb-4">
                {module.moduleCode}
              </h2>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Module Name:</span>{" "}
                  {module.moduleName}
                </p>
                <p>
                  <span className="font-medium">Instructor:</span>{" "}
                  {module.instructor}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Module; // Fix export name
