import { useNavigate } from "react-router-dom";
import book from "../assets/book.png";

function Course() {
  const navigate = useNavigate();

  const courses = [
    { name: "Computer Science", path: "/modules/Computer Science" },
    { name: "Business", path: "/modules/Business" },
    { name: "Engineering", path: "/modules/Engineering" },
  ];

  const handleBack = () => {
    navigate("/Home");
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

      <div className="flex justify-center items-center h-[90vh] gap-8">
        {courses.map((course) => (
          <div
            key={course.name}
            className="w-[300px] h-[200px] bg-white rounded-lg flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(course.path)}
          >
            <h2 className="text-2xl font-semibold text-[#7E57C2]">
              {course.name}
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Course;
