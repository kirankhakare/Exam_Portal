import axios from "axios";
import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";

export default function CreateUser() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    gender: "",
    dob: "",
    city: "",
    state: "",
    assignedExam: "",
  });
  const API = import.meta.env.VITE_API_URL;
  const [examList, setExamList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    setMsg("");

    try {
      const res = await axios.post(
        `${API}/admin/create-user`,
        form
      );

      setMsg("User created successfully!");
      setForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        gender: "",
        dob: "",
        city: "",
        state: "",
        assignedExam: "",
      });
    } catch (err) {
      setErr(err.response?.data?.message || "Something went wrong");
    }

    setLoading(false);
  };

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axios.get(`${API}/exams/all`);
        setExamList(res.data);
      } catch (err) {
        console.error("Error loading exams", err);
      }
    };

    fetchExams();
  }, []);

  return (
    <AdminLayout>
      <h1 className="text-4xl font-bold mb-8 text-gray-800 tracking-tight">
        Create New User
      </h1>

      <div className="bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-8 border border-gray-200 max-w-4xl">

        {/* Messages */}
        {msg && (
          <div className="bg-green-100 text-green-700 p-3 mb-4 rounded-xl shadow-sm border border-green-200">
            {msg}
          </div>
        )}

        {err && (
          <div className="bg-red-100 text-red-700 p-3 mb-4 rounded-xl shadow-sm border border-red-200">
            {err}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Name */}
          <InputField
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter full name"
          />

          {/* Email */}
          <InputField
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter email"
          />

          {/* Phone */}
          <InputField
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
          />

          {/* Gender */}
          <div>
            <label className="block text-gray-700 mb-2 font-semibold">
              Gender
            </label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition bg-gray-50"
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Assign Exam */}
          <div>
            <label className="block text-gray-700 mb-2 font-semibold">
              Assign Exam
            </label>
            <select
              name="assignedExam"
              required
              value={form.assignedExam}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition bg-gray-50"
            >
              <option value="">Select Exam</option>
              {examList.map((exam) => (
                <option key={exam._id} value={exam._id}>
                  {exam.title}
                </option>
              ))}
            </select>
          </div>

          {/* DOB */}
          <InputField
            label="Date of Birth"
            type="date"
            name="dob"
            value={form.dob}
            onChange={handleChange}
          />

          {/* City */}
          <InputField
            label="City"
            name="city"
            value={form.city}
            onChange={handleChange}
            placeholder="Enter city"
          />

          {/* State */}
          <InputField
            label="State"
            name="state"
            value={form.state}
            onChange={handleChange}
            placeholder="Enter state"
          />

          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 mb-2 font-semibold">
              Full Address
            </label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Enter full address"
              rows="3"
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition bg-gray-50"
            ></textarea>
          </div>

          {/* Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg transition shadow-lg"
            >
              {loading ? "Creating User..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

/* Reusable input component for cleaner UI */
function InputField({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>
      <label className="block text-gray-700 mb-2 font-semibold">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        required
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 transition bg-gray-50"
      />
    </div>
  );
}
