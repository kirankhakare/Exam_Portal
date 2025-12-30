import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../components/AdminLayout";

export default function ViewQuestions() {
  const API = import.meta.env.VITE_API_URL;

  const [questions, setQuestions] = useState([]);
  const [editQ, setEditQ] = useState(null);

  /* ================= FETCH QUESTIONS ================= */
  const fetchQuestions = async () => {
    try {
      const res = await axios.get(`${API}/questions`);
      setQuestions(res.data || []);
    } catch (err) {
      console.error("Fetch questions error", err);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this question?")) return;

    try {
      await axios.delete(`${API}/questions/${id}`);
      fetchQuestions();
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  /* ================= UPDATE ================= */
  const handleUpdate = async () => {
    try {
      await axios.put(`${API}/questions/${editQ._id}`, editQ);
      setEditQ(null);
      fetchQuestions();
    } catch (err) {
      console.error("Update error", err);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 px-2 sm:px-4 md:px-6 py-6 bg-[#f2f6fc] min-h-full">

        {/* ================= TITLE ================= */}
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#004AAD]">
            All Questions
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1">
            View, edit, and manage question bank
          </p>
        </div>

        {/* ================= TABLE ================= */}
        <div className="bg-white border border-gray-200 shadow overflow-x-auto">
          <table className="min-w-[1000px] w-full text-sm sm:text-base">
            <thead className="bg-blue-50 border-b">
              <tr className="text-left">
                <th className="p-3">Question</th>
                <th className="p-3">A</th>
                <th className="p-3">B</th>
                <th className="p-3">C</th>
                <th className="p-3">D</th>
                <th className="p-3">Correct</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {questions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-500">
                    No questions found
                  </td>
                </tr>
              ) : (
                questions.map((q) => (
                  <tr key={q._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{q.question}</td>
                    <td className="p-3">{q.optionA}</td>
                    <td className="p-3">{q.optionB}</td>
                    <td className="p-3">{q.optionC}</td>
                    <td className="p-3">{q.optionD}</td>
                    <td className="p-3 font-semibold">
                      {q.correctAnswer}
                    </td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => setEditQ(q)}
                        className="px-3 py-1 bg-blue-600 text-white rounded"
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= EDIT MODAL ================= */}
      {editQ && (
        <Modal title="Edit Question" onClose={() => setEditQ(null)}>
          <Input
            value={editQ.question}
            onChange={(e) =>
              setEditQ({ ...editQ, question: e.target.value })
            }
          />

          {["A", "B", "C", "D"].map((opt) => (
            <Input
              key={opt}
              value={editQ["option" + opt]}
              onChange={(e) =>
                setEditQ({
                  ...editQ,
                  ["option" + opt]: e.target.value,
                })
              }
            />
          ))}

          <Input
            value={editQ.correctAnswer}
            onChange={(e) =>
              setEditQ({ ...editQ, correctAnswer: e.target.value })
            }
          />

          <ModalActions
            onCancel={() => setEditQ(null)}
            onSave={handleUpdate}
          />
        </Modal>
      )}
    </AdminLayout>
  );
}

/* ================= REUSABLE UI ================= */

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-md rounded shadow-xl p-5 relative">
        <h2 className="text-lg font-bold mb-4">{title}</h2>

        <div className="space-y-3">{children}</div>

        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function ModalActions({ onCancel, onSave }) {
  return (
    <div className="flex justify-end gap-2 mt-4">
      <button
        onClick={onCancel}
        className="px-4 py-2 bg-gray-400 text-white rounded"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Save
      </button>
    </div>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500"
    />
  );
}
