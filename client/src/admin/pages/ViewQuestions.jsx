import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../components/AdminLayout";

export default function ViewQuestions() {
  const [questions, setQuestions] = useState([]);
  const [editQ, setEditQ] = useState(null);
  const API = import.meta.env.VITE_API_URL;
  const fetchQuestions = async () => {
    const res = await axios.get(`${API}/questions`);
    setQuestions(res.data);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this question?")) return;

    await axios.delete(`${API}/questions/${id}`);
    fetchQuestions();
  };

  const handleUpdate = async () => {
    await axios.put(`${API}/questions/${editQ._id}`, editQ);
    setEditQ(null);
    fetchQuestions();
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-semibold mb-4">All Questions</h1>

      <table className="w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Question</th>
            <th className="p-2 border">A</th>
            <th className="p-2 border">B</th>
            <th className="p-2 border">C</th>
            <th className="p-2 border">D</th>
            <th className="p-2 border">Correct</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>

        <tbody>
          {questions.map((q) => (
            <tr key={q._id} className="text-center">
              <td className="p-2 border">{q.question}</td>
              <td className="p-2 border">{q.optionA}</td>
              <td className="p-2 border">{q.optionB}</td>
              <td className="p-2 border">{q.optionC}</td>
              <td className="p-2 border">{q.optionD}</td>
              <td className="p-2 border font-bold">{q.correctAnswer}</td>
              <td className="p-2 border flex justify-center gap-2">
                <button
                  onClick={() => setEditQ(q)}
                  className="px-3 py-1 bg-blue-500 text-white rounded"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(q._id)}
                  className="px-3 py-1 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editQ && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded w-96 shadow">
            <h2 className="text-xl mb-3 font-semibold">Edit Question</h2>

            <input
              className="border p-2 w-full mb-2"
              value={editQ.question}
              onChange={(e) => setEditQ({ ...editQ, question: e.target.value })}
            />

            <input
              className="border p-2 w-full mb-2"
              value={editQ.optionA}
              onChange={(e) => setEditQ({ ...editQ, optionA: e.target.value })}
            />

            <input
              className="border p-2 w-full mb-2"
              value={editQ.optionB}
              onChange={(e) => setEditQ({ ...editQ, optionB: e.target.value })}
            />

            <input
              className="border p-2 w-full mb-2"
              value={editQ.optionC}
              onChange={(e) => setEditQ({ ...editQ, optionC: e.target.value })}
            />

            <input
              className="border p-2 w-full mb-2"
              value={editQ.optionD}
              onChange={(e) => setEditQ({ ...editQ, optionD: e.target.value })}
            />

            <input
              className="border p-2 w-full mb-4"
              value={editQ.correctAnswer}
              onChange={(e) =>
                setEditQ({ ...editQ, correctAnswer: e.target.value })
              }
            />

            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 bg-gray-500 text-white rounded"
                onClick={() => setEditQ(null)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 bg-green-600 text-white rounded"
                onClick={handleUpdate}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
