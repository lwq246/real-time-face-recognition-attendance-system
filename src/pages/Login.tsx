import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/admin/login", {
        email: formData.email,
        password: formData.password,
      });

      if (response.data.token) {
        localStorage.setItem("adminToken", response.data.token);
        console.log("Login successful:", response.data);
        navigate("/home");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="min-h-screen w-full flex">
      <div className="min-h-screen w-[50%] flex items-center justify-center bg-[#EEE4FF]">
        <div>
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          <h1 className="text-3xl font-bold text-[#1a2b3c] mb-2">
            Welcome back
          </h1>
          <p className="mb-6 text-sm">
            New Student?{" "}
            <Link to="/register" className="text-blue-600">
              Sign Up
            </Link>
          </p>

          <form onSubmit={handleSubmit}>
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

            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <label>Password</label>
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full !bg-[#7E57C2] !text-white font-semibold py-3 rounded-md transition-colors hover:!bg-[#5E35B1]"
            >
              LOGIN
            </button>
          </form>
        </div>
      </div>
      <div className="min-h-screen w-[50%] flex items-center justify-center">
        <img
          src="/src/assets/Login_Image.png"
          alt="Woman working at desk"
          className="w-[90%] h-[90%]"
        />
      </div>
    </div>
  );
}

export default Login;
