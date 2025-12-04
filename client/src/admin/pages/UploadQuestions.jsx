import { useState, useEffect, useRef } from "react";
import axios from "axios";
import AdminLayout from "../components/AdminLayout";

export default function UploadQuestions() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [newExamTitle, setNewExamTitle] = useState("");

  // NEW: exam config fields
  const [duration, setDuration] = useState(30); // minutes default
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableTo, setAvailableTo] = useState("");
  const [marksCorrect, setMarksCorrect] = useState(4);
  const [marksWrong, setMarksWrong] = useState(0);
  const [marksNotAttempted, setMarksNotAttempted] = useState(0);
  const API = import.meta.env.VITE_API_URL;

  const [loadingExams, setLoadingExams] = useState(false);
  const [creatingExam, setCreatingExam] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [examQuestions, setExamQuestions] = useState([]);
  const [editingQ, setEditingQ] = useState(null);

  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const fileInputRef = useRef(null);

  // FETCH EXAMS
  const fetchExams = async () => {
    try {
      setLoadingExams(true);
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API}/admin/exams`, {
        headers,
      });
      setExams(res.data || []);
    } catch (err) {
      console.error("Error loading exams", err);
      setMessage("Failed to load exams");
    } finally {
      setLoadingExams(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  // LOAD QUESTIONS
  const loadExamQuestions = async (examId) => {
    if (!examId) return;

    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.get(
        `${API}/admin/exam-questions/${examId}`,
        { headers }
      );

      setExamQuestions(res.data.questions || []);
      setSelectedQuestions([]);
      setSelectAll(false);
    } catch (err) {
      console.error("Error loading exam questions", err);
      setMessage("Failed to load exam questions");
    }
  };

  // CREATE EXAM (UPDATED: include timer / availability / marks)
  const createExam = async () => {
    if (newExamTitle.trim() === "") {
      alert("Enter exam title");
      return;
    }

    // basic validation for availability
    if (availableFrom && availableTo && new Date(availableFrom) >= new Date(availableTo)) {
      alert("Available To must be later than Available From");
      return;
    }

    try {
      setCreatingExam(true);
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Convert datetime-local to ISO if present
      const payload = {
        title: newExamTitle.trim(),
        duration: Number(duration) || 0, // minutes
        marksCorrect: Number(marksCorrect) || 0,
        marksWrong: Number(marksWrong) || 0,
        marksNotAttempted: Number(marksNotAttempted) || 0,
      };

      if (availableFrom) payload.availableFrom = new Date(availableFrom).toISOString();
      if (availableTo) payload.availableTo = new Date(availableTo).toISOString();

      const res = await axios.post(
        `${API}/admin/create-exam`,
        payload,
        { headers }
      );

      const created = res.data?.exam || res.data;

      await fetchExams();
      if (created && created._id) {
        setSelectedExam(created._id);
        loadExamQuestions(created._id);
      }

      // reset create form (but keep sensible defaults)
      setNewExamTitle("");
      setDuration(30);
      setAvailableFrom("");
      setAvailableTo("");
      setMarksCorrect(4);
      setMarksWrong(0);
      setMarksNotAttempted(0);

      setMessage("Exam created successfully");
    } catch (err) {
      console.error("Create exam error:", err);
      setMessage(err.response?.data?.message || "Failed to create exam");
    } finally {
      setCreatingExam(false);
    }
  };

  // UPLOAD FILE
  const handleUpload = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!file) return setMessage("Please select an Excel file");
    if (!selectedExam) return setMessage("Please select an exam");

    try {
      setUploading(true);

      const token = localStorage.getItem("token");
      const headers = token
        ? { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
        : { "Content-Type": "multipart/form-data" };

      const formData = new FormData();
      formData.append("file", file);
      formData.append("examId", selectedExam);

      const res = await axios.post(
        `${API}/admin/upload-questions`,
        formData,
        { headers }
      );

      setMessage(`Uploaded ${res.data.count} questions successfully!`);

      await fetchExams();
      await loadExamQuestions(selectedExam);

      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // UPDATE QUESTION
  const updateQuestion = async (q) => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.patch(
        `${API}/admin/update-question/${q._id}`,
        q,
        { headers }
      );

      setEditingQ(null);
      loadExamQuestions(selectedExam);
      setMessage("Question updated successfully!");
    } catch (err) {
      console.error("Update question error:", err);
      setMessage("Failed to update question");
    }
  };

  // DELETE QUESTION
  const deleteQuestion = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.delete(
        `${API}/admin/delete-question/${id}`,
        { headers }
      );

      loadExamQuestions(selectedExam);
      setMessage("Question deleted");
    } catch (err) {
      console.error("Delete question error:", err);
      setMessage("Failed to delete");
    }
  };

  // TOGGLE SELECT QUESTION
  const toggleSelect = (id) => {
    setSelectedQuestions((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  // BULK DELETE
  const handleBulkDelete = async () => {
    if (!window.confirm("Delete selected questions?")) return;

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.post(
        `${API}/admin/bulk-delete`,
        { ids: selectedQuestions },
        { headers }
      );

      loadExamQuestions(selectedExam);
      setSelectedQuestions([]);
      setSelectAll(false);

      setMessage("Selected questions deleted successfully!");
    } catch (err) {
      console.error("Bulk delete error:", err);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Upload Exam Questions
      </h1>

      {/* Upload Section */}
      <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200 mb-8">
        <form onSubmit={handleUpload} className="grid md:grid-cols-3 gap-4">

          {/* Select Exam */}
          <div className="md:col-span-1">
            <label className="block font-semibold mb-2 text-gray-700">Select Exam</label>
            <select
              className="border p-3 w-full rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
              value={selectedExam}
              onChange={(e) => {
                setSelectedExam(e.target.value);
                loadExamQuestions(e.target.value);
              }}
            >
              <option value="">-- Select Exam --</option>
              {exams.map((exam) => (
                <option key={exam._id} value={exam._id}>
                  {exam.title}
                </option>
              ))}
            </select>
          </div>

          {/* File */}
          <div className="md:col-span-1">
            <label className="block font-semibold mb-2 text-gray-700">Excel File</label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls"
              onChange={(e) => setFile(e.target.files[0])}
              className="border p-3 w-full rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Button */}
          <div className="md:col-span-1 flex items-end">
            <button
              className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg py-3 font-semibold transition"
              type="submit"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>

        {message && (
          <p className="mt-4 text-blue-600 text-lg font-semibold">{message}</p>
        )}
      </div>

      {/* Create Exam */}
      <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200 mb-8">
        <h2 className="text-xl font-bold mb-3 text-gray-800">Create New Exam</h2>

        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Enter exam title"
            className="border p-3 rounded-lg w-full bg-gray-50 focus:ring-2 focus:ring-blue-500 md:col-span-1"
            value={newExamTitle}
            onChange={(e) => setNewExamTitle(e.target.value)}
          />

          {/* Duration */}
          <input
            type="number"
            min="1"
            placeholder="Duration (minutes)"
            className="border p-3 rounded-lg w-full bg-gray-50 focus:ring-2 focus:ring-blue-500"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />

          {/* Marks - correct/wrong/not attempted */}
          <div className="flex gap-2 md:col-span-1">
            <input
              type="number"
              placeholder="Marks Correct"
              className="border p-3 rounded-lg w-1/3 bg-gray-50 focus:ring-2 focus:ring-blue-500"
              value={marksCorrect}
              onChange={(e) => setMarksCorrect(e.target.value)}
            />
            <input
              type="number"
              placeholder="Marks Wrong"
              className="border p-3 rounded-lg w-1/3 bg-gray-50 focus:ring-2 focus:ring-blue-500"
              value={marksWrong}
              onChange={(e) => setMarksWrong(e.target.value)}
            />
            <input
              type="number"
              placeholder="Not Attempted"
              className="border p-3 rounded-lg w-1/3 bg-gray-50 focus:ring-2 focus:ring-blue-500"
              value={marksNotAttempted}
              onChange={(e) => setMarksNotAttempted(e.target.value)}
            />
          </div>

          {/* Available From */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Available From</label>
            <input
              type="datetime-local"
              className="border p-3 rounded-lg w-full bg-gray-50 focus:ring-2 focus:ring-blue-500"
              value={availableFrom}
              onChange={(e) => setAvailableFrom(e.target.value)}
            />
          </div>

          {/* Available To */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Available To</label>
            <input
              type="datetime-local"
              className="border p-3 rounded-lg w-full bg-gray-50 focus:ring-2 focus:ring-blue-500"
              value={availableTo}
              onChange={(e) => setAvailableTo(e.target.value)}
            />
          </div>

          {/* Create button (span full width on md) */}
          <div className="flex items-end">
            <button
              onClick={(e) => {
                e.preventDefault();
                createExam();
              }}
              disabled={creatingExam}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition w-full"
            >
              {creatingExam ? "Creating..." : "Create Exam"}
            </button>
          </div>
        </div>

      </div>

      {/* Manage Questions (unchanged) */}
      {selectedExam && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Manage Questions
          </h2>

          {/* SELECT ALL + BULK DELETE */}
          {examQuestions.length > 0 && (
            <div className="flex justify-between items-center mb-4 bg-white p-4 rounded-xl shadow border border-gray-200">
              <label className="flex items-center gap-2 text-gray-700 font-semibold">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={(e) => {
                    setSelectAll(e.target.checked);
                    if (e.target.checked) {
                      setSelectedQuestions(examQuestions.map((q) => q._id));
                    } else {
                      setSelectedQuestions([]);
                    }
                  }}
                />
                Select All
              </label>

              {selectedQuestions.length > 0 && (
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold transition"
                  onClick={handleBulkDelete}
                >
                  Delete Selected ({selectedQuestions.length})
                </button>
              )}
            </div>
          )}

          {/* Question Cards */}
          {examQuestions.length === 0 ? (
            <p>No questions available.</p>
          ) : (
            examQuestions.map((q) => (
              <div
                key={q._id}
                className="bg-white p-5 border border-gray-200 rounded-xl shadow-sm mb-4 flex items-start gap-4 hover:shadow-md transition"
              >
                <input
                  type="checkbox"
                  checked={selectedQuestions.includes(q._id)}
                  onChange={() => toggleSelect(q._id)}
                />

                <div className="flex-1">
                  <p className="font-semibold text-gray-800 mb-1">
                    {q.question}
                  </p>
                </div>

                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  onClick={() => setEditingQ(q)}
                >
                  Edit
                </button>

                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  onClick={() => deleteQuestion(q._id)}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* EDIT QUESTION MODAL (unchanged) */}
      {editingQ && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center p-6">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-[500px] border border-gray-200">

            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              Edit Question
            </h3>

            <input
              type="text"
              className="border p-3 w-full rounded-lg bg-gray-50 mb-3 focus:ring-2 focus:ring-blue-500"
              value={editingQ.question}
              onChange={(e) => setEditingQ({ ...editingQ, question: e.target.value })}
            />

            {["A", "B", "C", "D"].map((opt) => (
              <input
                key={opt}
                type="text"
                className="border p-3 w-full rounded-lg bg-gray-50 mb-2 focus:ring-2 focus:ring-blue-500"
                value={editingQ["option" + opt]}
                onChange={(e) =>
                  setEditingQ({ ...editingQ, ["option" + opt]: e.target.value })
                }
              />
            ))}

            <select
              className="border p-3 w-full rounded-lg bg-gray-50 mb-4 focus:ring-2 focus:ring-blue-500"
              value={editingQ.correctAnswer}
              onChange={(e) => setEditingQ({ ...editingQ, correctAnswer: e.target.value })}
            >
              <option value="A">Correct Answer: A</option>
              <option value="B">Correct Answer: B</option>
              <option value="C">Correct Answer: C</option>
              <option value="D">Correct Answer: D</option>
            </select>

            <div className="flex justify-end gap-3">
              <button
                className="px-5 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
                onClick={() => setEditingQ(null)}
              >
                Cancel
              </button>

              <button
                className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                onClick={() => updateQuestion(editingQ)}
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