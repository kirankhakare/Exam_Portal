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
  
  useEffect(() => {
    axios.get(`${API}/questions`)
      .then(res => setQuestions(res.data));
  }, []);

  const handleCheckbox = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
  };

  const handleCreate = async () => {
    if (selected.length === 0) {
      alert("Select at least 1 question!");
      return;
    }

    try {
      await axios.post(`${API}/exams/create`, {
        title,
        duration,
        totalMarks,
        passMarks,
        questions: selected
      });

      alert("Exam created successfully!");
      setSelected([]);
      setTitle("");
    } catch (error) {
      console.log(error);
      alert("Failed to create exam");
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-semibold mb-4">Create Exam</h1>

      <div className="bg-white p-6 rounded shadow">
        <input
          placeholder="Exam Title"
          className="border p-2 w-full mb-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="flex gap-4 mb-4">
          <input
            type="number"
            className="border p-2"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Duration in mins"
          />

          <input
            type="number"
            className="border p-2"
            value={totalMarks}
            onChange={(e) => setTotalMarks(e.target.value)}
            placeholder="Total Marks"
          />

          <input
            type="number"
            className="border p-2"
            value={passMarks}
            onChange={(e) => setPassMarks(e.target.value)}
            placeholder="Pass Marks"
          />
        </div>

        <h2 className="text-xl font-semibold mb-2">Select Questions</h2>
        <div className="max-h-96 overflow-y-scroll border p-3">

          {questions.map(q => (
            <div key={q._id} className="border p-3 mb-2 rounded">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selected.includes(q._id)}
                  onChange={() => handleCheckbox(q._id)}
                />
                <span className="font-semibold">{q.question}</span>
              </label>
            </div>
          ))}

        </div>

        <button
          onClick={handleCreate}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
        >
          Create Exam
        </button>
      </div>
    </AdminLayout>
  );
}
