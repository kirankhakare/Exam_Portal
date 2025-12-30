import { useState, useEffect, useRef } from "react";
import axios from "axios";
import AdminLayout from "../components/AdminLayout";

export default function UploadQuestions() {
  const API = import.meta.env.VITE_API_URL;

  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [newExamTitle, setNewExamTitle] = useState("");

  const [duration, setDuration] = useState(30);
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableTo, setAvailableTo] = useState("");
  const [marksCorrect, setMarksCorrect] = useState(4);
  const [marksWrong, setMarksWrong] = useState(0);
  const [marksNotAttempted, setMarksNotAttempted] = useState(0);

  const [loadingExams, setLoadingExams] = useState(false);
  const [creatingExam, setCreatingExam] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [examQuestions, setExamQuestions] = useState([]);
  const [editingQ, setEditingQ] = useState(null);

  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const fileInputRef = useRef(null);

  /* ================= FETCH EXAMS ================= */
  const fetchExams = async () => {
    try {
      setLoadingExams(true);
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API}/admin/exams`, { headers });
      setExams(res.data || []);
    } catch {
      setMessage("Failed to load exams");
    } finally {
      setLoadingExams(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  /* ================= LOAD QUESTIONS ================= */
  const loadExamQuestions = async (examId) => {
    if (!examId) return;
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API}/admin/exam-questions/${examId}`, { headers });
      setExamQuestions(res.data.questions || []);
      setSelectedQuestions([]);
      setSelectAll(false);
    } catch {
      setMessage("Failed to load questions");
    }
  };

  /* ================= CREATE EXAM ================= */
  const createExam = async () => {
    if (!newExamTitle.trim()) return alert("Enter exam title");
    if (availableFrom && availableTo && new Date(availableFrom) >= new Date(availableTo)) {
      return alert("Invalid availability range");
    }

    try {
      setCreatingExam(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const payload = {
        title: newExamTitle.trim(),
        duration: Number(duration),
        marksCorrect: Number(marksCorrect),
        marksWrong: Number(marksWrong),
        marksNotAttempted: Number(marksNotAttempted),
      };

      if (availableFrom) payload.availableFrom = new Date(availableFrom).toISOString();
      if (availableTo) payload.availableTo = new Date(availableTo).toISOString();

      const res = await axios.post(`${API}/admin/create-exam`, payload, { headers });
      const created = res.data?.exam || res.data;

      await fetchExams();
      if (created?._id) {
        setSelectedExam(created._id);
        loadExamQuestions(created._id);
      }

      setNewExamTitle("");
      setDuration(30);
      setAvailableFrom("");
      setAvailableTo("");
      setMarksCorrect(4);
      setMarksWrong(0);
      setMarksNotAttempted(0);

      setMessage("Exam created successfully");
    } catch {
      setMessage("Failed to create exam");
    } finally {
      setCreatingExam(false);
    }
  };

  /* ================= UPLOAD FILE ================= */
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !selectedExam) return setMessage("Select exam and file");

    try {
      setUploading(true);
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      };

      const formData = new FormData();
      formData.append("file", file);
      formData.append("examId", selectedExam);

      const res = await axios.post(`${API}/admin/upload-questions`, formData, { headers });
      setMessage(`Uploaded ${res.data.count} questions successfully`);

      await loadExamQuestions(selectedExam);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      setMessage("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  /* ================= BULK DELETE ================= */
  const handleBulkDelete = async () => {
    if (!window.confirm("Delete selected questions?")) return;

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.post(`${API}/admin/bulk-delete`, { ids: selectedQuestions }, { headers });
      loadExamQuestions(selectedExam);
      setSelectedQuestions([]);
      setSelectAll(false);
      setMessage("Selected questions deleted");
    } catch {
      setMessage("Bulk delete failed");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 px-2 sm:px-4 md:px-6 py-6 bg-[#f2f6fc] min-h-full">

        {/* ================= TITLE ================= */}
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#004AAD]">
            Upload Exam Questions
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1">
            Create exams, upload questions, and manage question banks
          </p>
        </div>

        {/* ================= UPLOAD ================= */}
        <Card>
          <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Select Exam"
              value={selectedExam}
              onChange={(e) => {
                setSelectedExam(e.target.value);
                loadExamQuestions(e.target.value);
              }}
              options={exams.map((e) => ({ value: e._id, label: e.title }))}
            />

            <Input
              label="Excel File"
              type="file"
              accept=".xlsx,.xls"
              ref={fileInputRef}
              onChange={(e) => setFile(e.target.files[0])}
            />

            <Button type="submit" loading={uploading}>
              Upload
            </Button>
          </form>
          {message && <p className="mt-3 text-blue-600 font-semibold">{message}</p>}
        </Card>

        {/* ================= CREATE EXAM ================= */}
        <Card>
          <h2 className="text-lg font-semibold mb-3">Create New Exam</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Exam title"
              value={newExamTitle}
              onChange={(e) => setNewExamTitle(e.target.value)}
            />
            <Input type="number" placeholder="Duration (min)" value={duration} onChange={(e) => setDuration(e.target.value)} />
            <Input type="number" placeholder="Marks Correct" value={marksCorrect} onChange={(e) => setMarksCorrect(e.target.value)} />
            <Input type="number" placeholder="Marks Wrong" value={marksWrong} onChange={(e) => setMarksWrong(e.target.value)} />
            <Input type="number" placeholder="Not Attempted" value={marksNotAttempted} onChange={(e) => setMarksNotAttempted(e.target.value)} />
            <Input type="datetime-local" value={availableFrom} onChange={(e) => setAvailableFrom(e.target.value)} />
            <Input type="datetime-local" value={availableTo} onChange={(e) => setAvailableTo(e.target.value)} />

            <Button onClick={createExam} loading={creatingExam}>
              Create Exam
            </Button>
          </div>
        </Card>

        {/* ================= MANAGE QUESTIONS ================= */}
        {selectedExam && (
          <Card>
            <div className="flex justify-between items-center mb-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={(e) => {
                    setSelectAll(e.target.checked);
                    setSelectedQuestions(
                      e.target.checked ? examQuestions.map((q) => q._id) : []
                    );
                  }}
                />
                Select All
              </label>

              {selectedQuestions.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  Delete Selected ({selectedQuestions.length})
                </button>
              )}
            </div>

            {examQuestions.length === 0 ? (
              <p>No questions available.</p>
            ) : (
              examQuestions.map((q) => (
                <div
                  key={q._id}
                  className="border p-3 mb-3 rounded flex items-center gap-3 bg-white"
                >
                  <input
                    type="checkbox"
                    checked={selectedQuestions.includes(q._id)}
                    onChange={() =>
                      setSelectedQuestions((prev) =>
                        prev.includes(q._id)
                          ? prev.filter((x) => x !== q._id)
                          : [...prev, q._id]
                      )
                    }
                  />
                  <p className="flex-1">{q.question}</p>
                  <button
                    onClick={() => setEditingQ(q)}
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                  >
                    Edit
                  </button>
                </div>
              ))
            )}
          </Card>
        )}

      </div>
    </AdminLayout>
  );
}

/* ================= UI HELPERS ================= */

function Card({ children }) {
  return (
    <div className="bg-white border border-gray-200 shadow p-4 sm:p-6">
      {children}
    </div>
  );
}

const Input = ({ label, ...props }) => (
  <div>
    {label && <label className="block text-sm font-semibold mb-1">{label}</label>}
    <input
      {...props}
      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div>
    <label className="block text-sm font-semibold mb-1">{label}</label>
    <select
      {...props}
      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500"
    >
      <option value="">Select</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
);

const Button = ({ children, loading, ...props }) => (
  <button
    {...props}
    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 font-semibold"
  >
    {loading ? "Please wait..." : children}
  </button>
);
