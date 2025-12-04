import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Login() {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API}/auth/login`, {
        email: form.email.trim().toLowerCase(),
        password: form.password.trim(),
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("studentId", res.data.user._id);

      if (res.data.role === "admin") navigate("/admin");
      else navigate("/student/instructions");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong!");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f2f6fc] flex flex-col">
      
      {/* Top Header (TCS Style) */}
      <header className="w-full bg-[#004AAD] py-4 shadow-md">
        <h1 className="text-white text-center text-2xl font-semibold tracking-wide">
          Online Assessment Portal
        </h1>
      </header>

      {/* Center content */}
      <div className="flex flex-1 items-center justify-center p-4">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white shadow-lg rounded-xl p-8 border border-gray-200"
        >
          <h2 className="text-2xl font-bold text-[#004AAD] text-center mb-4">
            Candidate Login
          </h2>

          {error && (
            <p className="text-red-600 text-center bg-red-100 py-2 rounded mb-4">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Registered Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="Enter email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Enter password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            {/* Login Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="bg-[#004AAD] text-white w-full py-3 rounded-lg font-semibold text-lg hover:bg-[#003A88] transition"
            >
              {loading ? "Authenticating..." : "Login"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
