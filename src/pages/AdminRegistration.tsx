import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import book from "../assets/book.png";

function AdminRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin", // Fixed as admin
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/admin/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/home");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Failed to register admin");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="h-[100vh] bg-[#9363ff] w-full">
      <div className="flex justify-between bg-white h-[10vh] items-center px-6 w-full">
        <img src={book} alt="Book Icon" className="w-10 h-10" />
        <Link
          to="/home"
          className="!bg-[#7E57C2] !text-white font-semibold rounded-md transition-colors hover:!bg-[#5E35B1] h-[60%] px-4 flex items-center"
        >
          Back
        </Link>
      </div>

      <div className="flex justify-center items-center h-[90vh] w-full bg-[#9363ff]">
        <div className="w-[40%] bg-white rounded-lg p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Register New Admin
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#7E57C2]"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#7E57C2]"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#7E57C2]"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full !bg-[#9363ff] text-white font-semibold py-3 rounded-md transition-colors hover:bg-[#5E35B1]"
            >
              Register Admin
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminRegistration;
