import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const courses = ["Computer Science", "Business", "Engineering"];
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    course: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.course) {
      setError("All fields are required");
      return;
    }

    // Navigate to face registration with form data
    navigate("/face-registration", { state: formData });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen w-full flex">
      <div className="min-h-screen w-[50%] flex items-center justify-center bg-[#EEE4FF]">
        <div className="w-[80%] max-w-md">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          <h1 className="text-3xl font-bold text-[#1a2b3c] mb-2">
            Student Registration
          </h1>
          <p className="mb-6 text-sm">
            Already have an account?{" "}
            <Link to="/" className="text-blue-600">
              Login
            </Link>
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block mb-1">Course</label>
              <select
                name="course" // Changed from courseId to course
                value={formData.course} // Changed from courseId to course
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full !bg-[#7E57C2] !text-white font-semibold py-3 rounded-md transition-colors hover:!bg-[#5E35B1]"
            >
              REGISTER
            </button>
          </form>
        </div>
      </div>
      <div className="min-h-screen w-[50%] flex items-center justify-center">
        <img
          src="/src/assets/Login_Image.png"
          alt="Registration illustration"
          className="w-[90%] h-[90%]"
        />
      </div>
    </div>
  );
}

export default Register;
