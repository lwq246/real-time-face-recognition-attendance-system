import { Link, useNavigate } from "react-router-dom";
import admin from "../assets/admin.png";
import book from "../assets/book.png";
import education from "../assets/education.png";
import student from "../assets/graduated.png";
function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any stored tokens/data if needed
    localStorage.removeItem("adminToken");
    // Redirect to login page
    navigate("/");
  };

  return (
    <div className="h-[100vh] bg-[#9363ff] w-full">
      <div className="flex justify-between bg-white h-[10vh] items-center px-6 w-full">
        <img src={book} alt="Book Icon" className="w-10 h-10" />
        <button
          onClick={handleLogout}
          className="!bg-[#7E57C2] !text-white font-semibold rounded-md transition-colors hover:!bg-[#5E35B1] h-[60%] px-4"
        >
          Log Out
        </button>
      </div>

      <div className="flex justify-center items-center h-[90vh] gap-30 w-full bg-[#9363ff]">
        <Link to="/course" className="w-[20%] h-[50%] group">
          <div className="w-full h-full bg-white rounded-lg flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow">
            <div className="text-center">
              <img
                src={education}
                alt="Course Icon"
                className="w-12 h-12 mx-auto mb-4"
              />
              <h2 className="text-2xl text-[black] font-normal group-hover:text-[#7E57C2] transition-colors">
                Course
              </h2>
            </div>
          </div>
        </Link>

        <Link to="/student" className="w-[20%] h-[50%] group">
          <div className="w-full h-full bg-white rounded-lg flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow">
            <div className="text-center">
              <img
                src={student}
                alt="Student Icon"
                className="w-12 h-12 mx-auto mb-4"
              />
              <h2 className="text-2xl text-[black] font-normal group-hover:text-[#7E57C2] transition-colors">
                Student
              </h2>
            </div>
          </div>
        </Link>
        <Link to="/admin-registration" className="w-[20%] h-[50%] group">
          <div className="w-full h-full bg-white rounded-lg flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow">
            <div className="text-center">
              <img
                src={admin}
                alt="Student Icon"
                className="w-12 h-12 mx-auto mb-4"
              />
              <h2 className="text-2xl text-[black] font-normal group-hover:text-[#7E57C2] transition-colors">
                Admin
              </h2>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default Home;
