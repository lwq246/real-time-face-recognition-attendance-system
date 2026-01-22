import { Link } from "react-router-dom";
import book from "../assets/book.png";
import search from "../assets/search.png";
import warning from "../assets/warning.png";

function Student() {
  return (
    <div className="h-[100vh] bg-[#9363ff] w-full">
      <div className="flex justify-between bg-white h-[10vh] items-center px-6 w-full">
        <img src={book} alt="Book Icon" className="w-10 h-10" />
        <Link
          to="/Home"
          className="!bg-[#7E57C2] !text-white font-semibold rounded-md transition-colors hover:!bg-[#5E35B1] h-[60%] px-4 flex items-center"
        >
          Back
        </Link>
      </div>

      <div className="flex justify-center items-center h-[90vh] gap-60 w-full bg-[#9363ff]">
        <Link to="/student-search" className="w-[30%] h-[50%] group">
          <div className="w-full h-full bg-white rounded-lg flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow">
            <div className="text-center">
              <img
                src={search}
                alt="Search Icon"
                className="w-12 h-12 mx-auto mb-4"
              />
              <h2 className="text-2xl text-[black] font-normal group-hover:text-[#7E57C2] transition-colors">
                Search Student
              </h2>
            </div>
          </div>
        </Link>

        <Link to="/low-attendance" className="w-[30%] h-[50%] group">
          <div className="w-full h-full bg-white rounded-lg flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow">
            <div className="text-center">
              <img
                src={warning}
                alt="Warning Icon"
                className="w-12 h-12 mx-auto mb-4"
              />
              <h2 className="text-2xl text-[black] font-normal group-hover:text-[#7E57C2] transition-colors">
                Low Attendance
              </h2>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default Student;
