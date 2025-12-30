import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../components/AdminLayout";

export default function CreateExam() {
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(30);
  const [totalMarks, setTotalMarks] = useState(100);
  const [passMarks, setPassMarks] = useState(40);

  const API = import.meta.env.VITE_API_URL;

  /* ================= FETCH QUESTIONS ================= */
  useEffect(() => {
    axios.get(`${API}/questions`).then((res) => setQuestions(res.data));
  }, []);

  /* ================= CHECKBOX HANDLER ================= */
  const handleCheckbox = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    );
  };

  /* ================= CREATE EXAM ================= */
  const handleCreate = async () => {
    if (!title.trim()) {
      alert("Exam title is required");
      return;
    }

    if (selected.length === 0) {
      alert("Select at least one question!");
      return;
    }

    try {
      await axios.post(`${API}/exams/create`, {
        title,
        duration,
        totalMarks,
        passMarks,
        questions: selected,
      });

      alert("Exam created successfully!");
      setSelected([]);
      setTitle("");
    } catch (err) {
      console.error(err);
      alert("Failed to create exam");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 px-2 sm:px-4 md:px-6 py-6 bg-[#f2f6fc] min-h-full">

        {/* ================= TITLE ================= */}
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#004AAD]">
            Create Exam
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1">
            Configure exam details and select questions
          </p>
        </div>

        {/* ================= FORM ================= */}
        <div className="bg-white border border-gray-200 shadow p-4 sm:p-6 space-y-5">

          {/* Exam Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Exam Title
            </label>
            <input
              type="text"
              placeholder="Enter exam title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Exam Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label="Duration (minutes)"
              type="number"
              value={duration}
              onChange={setDuration}
            />
            <Input
              label="Total Marks"
              type="number"
              value={totalMarks}
              onChange={setTotalMarks}
            />
            <Input
              label="Pass Marks"
              type="number"
              value={passMarks}
              onChange={setPassMarks}
            />
          </div>

          {/* ================= QUESTIONS ================= */}
          <div>
            <h2 className="text-lg sm:text-xl font-semibold mb-2">
              Select Questions
            </h2>

            <div className="max-h-80 overflow-y-auto border border-gray-200 rounded p-3 space-y-2 bg-gray-50">
              {questions.map((q) => (
                <label
                  key={q._id}
                  className="
                    flex items-start gap-3
                    bg-white
                    p-3
                    border border-gray-200
                    rounded
                    cursor-pointer
                    hover:bg-gray-50
                  "
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(q._id)}
                    onChange={() => handleCheckbox(q._id)}
                    className="mt-1"
                  />
                  <span className="text-sm sm:text-base font-medium">
                    {q.question}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* ================= SUBMIT ================= */}
          <button
            onClick={handleCreate}
            className="
              w-full sm:w-auto
              px-6 py-3
              bg-green-600
              text-white
              font-semibold
              rounded
              hover:bg-green-700
              transition
            "
          >
            Create Exam
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

/* ================= REUSABLE INPUT ================= */

function Input({ label, type, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
