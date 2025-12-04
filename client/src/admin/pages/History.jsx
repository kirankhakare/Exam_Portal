// frontend/src/admin/pages/History.jsx

import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../components/AdminLayout";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function History() {
  const [results, setResults] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedResult, setSelectedResult] = useState(null);
  const API = import.meta.env.VITE_API_URL;
  // Fetch results
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get(`${API}/history/all-results`);
        setResults(res.data);
      } catch (err) {
        console.error("Error fetching results:", err);
      }
    };
    fetchResults();
  }, []);

  // 🔥 Filter (Now includes examTitle)
  const filtered = results.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.email.toLowerCase().includes(search.toLowerCase()) ||
    item.examTitle?.toLowerCase().includes(search.toLowerCase())
  );

  // Modal Fetch
  const openResult = async (studentId) => {
    try {
      const res = await axios.get(`${API}/admin/result/${studentId}`);
      setSelectedResult(res.data);
    } catch (err) {
      console.error("Fetch result error", err);
      alert("No result available.");
    }
  };

  // 🔥 Updated Excel Export (includes examName)
  const downloadExcel = () => {
    const excelData = filtered.map((r) => ({
      Name: r.name,
      Email: r.email,
      Exam: r.examTitle || "N/A",
      Score: `${r.score}/${r.total}`,
      Percentage: `${r.percentage}%`,
      Date: new Date(r.date).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Results");

    XLSX.writeFile(workbook, "StudentResults.xlsx");
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Student Results</h1>

      {/* SEARCH BAR */}
      <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-5 mb-6">
        <input
          type="text"
          placeholder="Search by name, email, or exam..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* EXPORT BUTTONS */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={downloadExcel}
          className="bg-green-600 hover:bg-green-700 transition text-white px-5 py-3 rounded-xl shadow-md font-semibold"
        >
          Download Excel
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
        <table className="w-full table-auto">
          <thead className="bg-blue-50 border-b border-gray-200">
            <tr className="text-gray-700 text-left">
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Email</th>

              {/* ⭐ NEW EXAM COLUMN */}
              <th className="p-4 font-semibold">Exam</th>

              <th className="p-4 font-semibold">Score</th>
              <th className="p-4 font-semibold">Percentage</th>
              <th className="p-4 font-semibold">Date</th>
              <th className="p-4 font-semibold">Submission Type</th>
              <th className="p-4 font-semibold">Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-6 text-gray-500">
                  No results found
                </td>
              </tr>
            ) : (
              filtered.map((r, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-50 transition border-b border-gray-100"
                >
                  <td className="p-4">{r.name}</td>
                  <td className="p-4">{r.email}</td>

                  {/* ⭐ SHOW EXAM NAME */}
                  <td className="p-4">{r.examTitle || "—"}</td>
                    
                  <td className="p-4 font-semibold">{r.score}/{r.total}</td>
                  <td className="p-4 font-semibold">{r.percentage}%</td>

                  <td className="p-4">
                    {new Date(r.date).toLocaleString()}
                  </td>
                  <td className="p-4 capitalize">
  {r.submissionType.replaceAll("_"," ")}
</td>

                  <td className="p-4">
                    <button
                      onClick={() => openResult(r.studentId)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition"
                    >
                      View Result
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ======== RESULT MODAL ======== */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center p-4 pt-28">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-[650px] max-h-[90vh] overflow-y-auto border border-gray-200">

            <h2 className="text-2xl font-bold mb-3 text-gray-800">Student Result</h2>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-4">
              <p><b>Name:</b> {selectedResult.studentId?.name}</p>
              <p><b>Email:</b> {selectedResult.studentId?.email}</p>

              {/* ⭐ SHOW EXAM NAME HERE TOO */}
              <p><b>Exam:</b> {selectedResult.examId?.title}</p>

              <p className="mt-3 text-lg">
                <strong>Score:</strong>{" "}
                <span className="text-green-700 font-bold">
                  {selectedResult.score}
                </span>{" "}
                / {selectedResult.total}
              </p>

              <p className="text-sm mt-2">
                <strong>Submitted At: </strong>
                {new Date(selectedResult.submittedAt).toLocaleString()}
              </p>
            </div>

            {/* ANSWER DETAILS (no changes here) */}
            <h3 className="text-xl font-bold mt-4 mb-3 text-gray-800">
              Detailed Answers
            </h3>

            {selectedResult.answers?.length > 0 ? (
              selectedResult.answers.map((item, index) => {
                const getAnswerText = (valKey, textField) => {
                  if (textField) return textField;
                  if (!valKey || valKey === "Not Attempted") return "Not Attempted";

                  if (/^[ABCD]$/i.test(valKey)) {
                    const key = "option" + valKey.toUpperCase();
                    return item[key] || valKey;
                  }
                  return valKey;
                };

                const userAns = getAnswerText(item.selectedAnswer, item.selectedAnswerText);
                const correctAns = getAnswerText(item.correctAnswer, item.correctAnswerText);

                return (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm mb-3"
                  >
                    <p className="font-semibold text-gray-800">
                      Q{index + 1}: {item.question}
                    </p>

                    <p className="mt-1">
                      <b>Your Answer:</b>{" "}
                      <span
                        className={`${
                          item.selectedAnswer === "Not Attempted"
                            ? "text-gray-500"
                            : item.isCorrect
                            ? "text-green-700 font-bold"
                            : "text-red-700 font-bold"
                        }`}
                      >
                        {userAns}
                      </span>
                    </p>

                    <p>
                      <b>Correct Answer:</b>{" "}
                      <span className="text-blue-700 font-semibold">
                        {correctAns}
                      </span>
                    </p>

                    <p className="mt-1">
                      <b>Marks Awarded:</b>{" "}
                      <span
                        className={`font-bold ${
                          item.marksGiven > 0
                            ? "text-green-700"
                            : item.marksGiven < 0
                            ? "text-red-700"
                            : "text-gray-700"
                        }`}
                      >
                        {item.marksGiven}
                      </span>
                    </p>

                    <p
                      className={`mt-2 font-semibold ${
                        item.isCorrect
                          ? "text-green-600"
                          : item.selectedAnswer === "Not Attempted"
                          ? "text-gray-500"
                          : "text-red-600"
                      }`}
                    >
                      {item.selectedAnswer === "Not Attempted"
                        ? "Not Attempted"
                        : item.isCorrect
                        ? "Correct"
                        : "Wrong"}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500">No answer details found.</p>
            )}

            {/* CLOSE BUTTON */}
            <div className="text-right">
              <button
                onClick={() => setSelectedResult(null)}
                className="mt-4 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow transition"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </AdminLayout>
  );
}
