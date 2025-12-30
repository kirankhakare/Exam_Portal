import axios from "axios";
import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";

export default function CreateUser() {
  const API = import.meta.env.VITE_API_URL;

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

  const [examList, setExamList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  /* ================= INPUT HANDLER ================= */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setErr("");

    try {
      await axios.post(`${API}/admin/create-user`, form);
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

  /* ================= FETCH EXAMS ================= */
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axios.get(`${API}/exams/all`);
        setExamList(res.data);
      } catch (err) {
        console.error("Failed to load exams", err);
      }
    };

    fetchExams();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6 px-2 sm:px-4 md:px-6 py-6 bg-[#f2f6fc] min-h-full">

        {/* ================= TITLE ================= */}
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#004AAD]">
            Create New User
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1">
            Register a student and assign an exam
          </p>
        </div>

        {/* ================= FORM CARD ================= */}
        <div className="bg-white border border-gray-200 shadow p-4 sm:p-6 max-w-4xl">

          {/* Messages */}
          {msg && (
            <div className="mb-4 rounded border border-green-200 bg-green-100 p-3 text-green-700 text-sm">
              {msg}
            </div>
          )}

          {err && (
            <div className="mb-4 rounded border border-red-200 bg-red-100 p-3 text-red-700 text-sm">
              {err}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
          >
            <InputField
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter full name"
            />

            <InputField
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email"
            />

            <InputField
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />

            {/* Gender */}
            <SelectField
              label="Gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              options={["Male", "Female", "Other"]}
            />

            {/* Assign Exam */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Assign Exam
              </label>
              <select
                name="assignedExam"
                value={form.assignedExam}
                required
                onChange={handleChange}
                className="w-full rounded border border-gray-300 px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Exam</option>
                {examList.map((exam) => (
                  <option key={exam._id} value={exam._id}>
                    {exam.title}
                  </option>
                ))}
              </select>
            </div>

            <InputField
              label="Date of Birth"
              type="date"
              name="dob"
              value={form.dob}
              onChange={handleChange}
            />

            <InputField
              label="City"
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="Enter city"
            />

            <InputField
              label="State"
              name="state"
              value={form.state}
              onChange={handleChange}
              placeholder="Enter state"
            />

            {/* Address */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Full Address
              </label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows="3"
                placeholder="Enter full address"
                className="w-full rounded border border-gray-300 px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit */}
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="
                  w-full sm:w-auto
                  px-6 py-3
                  rounded
                  bg-blue-600
                  hover:bg-blue-700
                  text-white
                  font-semibold
                  transition
                "
              >
                {loading ? "Creating User..." : "Create User"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function InputField({ label, type = "text", name, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        required
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded border border-gray-300 px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded border border-gray-300 px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
