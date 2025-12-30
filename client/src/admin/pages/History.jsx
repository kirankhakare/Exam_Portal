// frontend/src/admin/pages/History.jsx

import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../components/AdminLayout";
import * as XLSX from "xlsx";

export default function History() {
  const API = import.meta.env.VITE_API_URL;

  const [results, setResults] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedResult, setSelectedResult] = useState(null);

  /* ================= FETCH RESULTS ================= */
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

  /* ================= FILTER ================= */
  const filtered = results.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.email.toLowerCase().includes(search.toLowerCase()) ||
    item.examTitle?.toLowerCase().includes(search.toLowerCase())
  );

  /* ================= VIEW RESULT ================= */
  const openResult = async (studentId) => {
    try {
      const res = await axios.get(`${API}/admin/result/${studentId}`);
      setSelectedResult(res.data);
    } catch {
      alert("No result available.");
    }
  };

  /* ================= EXPORT ================= */
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
      <div className="space-y-6 px-2 sm:px-4 md:px-6 py-6 bg-[#f2f6fc] min-h-full">

        {/* ================= TITLE ================= */}
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#004AAD]">
            Student Results
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1">
            Complete exam history and performance records
          </p>
        </div>

        {/* ================= SEARCH ================= */}
        <div className="bg-white border border-gray-200 shadow p-4 sm:p-6">
          <input
            type="text"
            placeholder="Search by name, email, or exam..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* ================= ACTIONS ================= */}
        <div>
          <button
            onClick={downloadExcel}
            className="px-5 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded transition"
          >
            Download Excel
          </button>
        </div>

        {/* ================= TABLE ================= */}
        <div className="bg-white border border-gray-200 shadow overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm sm:text-base">
            <thead className="bg-blue-50 border-b">
              <tr className="text-left">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Exam</th>
                <th className="p-3">Score</th>
                <th className="p-3">%</th>
                <th className="p-3">Date</th>
                <th className="p-3">Type</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-6 text-gray-500">
                    No results found
                  </td>
                </tr>
              ) : (
                filtered.map((r, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="p-3">{r.name}</td>
                    <td className="p-3">{r.email}</td>
                    <td className="p-3">{r.examTitle || "—"}</td>
                    <td className="p-3 font-semibold">{r.score}/{r.total}</td>
                    <td className="p-3 font-semibold">{r.percentage}%</td>
                    <td className="p-3">{new Date(r.date).toLocaleString()}</td>
                    <td className="p-3 capitalize">
                      {r.submissionType.replaceAll("_", " ")}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => openResult(r.studentId)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ================= RESULT MODAL ================= */}
        {selectedResult && (
          <div className="fixed inset-0 bg-black/40 flex items-start justify-center p-4 pt-20 z-50">
            <div className="bg-white max-w-2xl w-full rounded shadow-xl p-5 overflow-y-auto max-h-[85vh]">

              <h2 className="text-xl font-bold mb-2">Student Result</h2>

              <div className="bg-gray-50 border p-4 mb-4 text-sm">
                <p><b>Name:</b> {selectedResult.studentId?.name}</p>
                <p><b>Email:</b> {selectedResult.studentId?.email}</p>
                <p><b>Exam:</b> {selectedResult.examId?.title}</p>
                <p className="mt-2 font-semibold text-green-700">
                  Score: {selectedResult.score}/{selectedResult.total}
                </p>
              </div>

              <h3 className="font-bold mb-2">Detailed Answers</h3>

              {selectedResult.answers?.map((a, i) => (
                <div key={i} className="border p-3 mb-3 text-sm">
                  <p className="font-semibold">
                    Q{i + 1}: {a.question}
                  </p>
                  <p>
                    Your Answer:{" "}
                    <span className={a.isCorrect ? "text-green-700" : "text-red-700"}>
                      {a.selectedAnswerText || "Not Attempted"}
                    </span>
                  </p>
                  <p className="text-blue-700">
                    Correct: {a.correctAnswerText}
                  </p>
                </div>
              ))}

              <div className="text-right">
                <button
                  onClick={() => setSelectedResult(null)}
                  className="mt-3 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
