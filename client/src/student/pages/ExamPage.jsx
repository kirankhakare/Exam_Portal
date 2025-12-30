import { useEffect, useState, useRef } from "react";
import axios from "axios";
import useFullscreenProtection from "../hooks/useFullscreenProtection";
import useAntiCheat from "../hooks/useAntiCheat";
import ExamSidebar from "../components/ExamSidebar";

export default function ExamPage() {
  const studentId = localStorage.getItem("studentId");
  const API = import.meta.env.VITE_API_URL;

  const [questions, setQuestions] = useState([]);
  const [examTitle, setExamTitle] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const protectionsActive = useRef(true);

  /* ================= SUBMIT ================= */
  const handleSubmit = async (reason = "manual_submit") => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    protectionsActive.current = false;

    try {
      await axios.post(`${API}/student/submit`, {
        studentId,
        answers,
        submissionType: reason,
      });
    } catch (err) {
      console.error("Submit error", err);
    }

    window.location.href = "/student/thank-you";
  };

  /* ================= PROTECTIONS ================= */
  useFullscreenProtection({
    mode: "exam-submit",
    onExamSubmit: () => handleSubmit("fullscreen_exit"),
  });

  useAntiCheat(protectionsActive, () =>
    handleSubmit("tab_switch_or_cheat")
  );

  /* ================= FETCH EXAM ================= */
  useEffect(() => {
    let mounted = true;

    const fetchExamData = async () => {
      try {
        const res = await axios.get(
          `${API}/student/get-questions`,
          { params: { studentId } }
        );

        if (!mounted) return;

        setExamTitle(res.data.examTitle);
        setQuestions(res.data.questions);
        setTimeLeft(res.data.duration * 60);
      } catch (err) {
        console.error(err);
        window.location.href = "/student/thank-you";
      }
    };

    fetchExamData();
    return () => (mounted = false);
  }, [studentId]);

  /* ================= TIMER ================= */
  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      handleSubmit("timer_expired");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  /* ================= HANDLERS ================= */
  const jumpTo = (i) => setCurrentIndex(i);

  const selectOption = (qId, opt) => {
    setAnswers((prev) => ({ ...prev, [qId]: opt }));
  };

  const clearAnswer = (qId) => {
    setAnswers((prev) => {
      const obj = { ...prev };
      delete obj[qId];
      return obj;
    });
  };

  /* ================= LOADING ================= */
  if (!questions.length || timeLeft === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading exam...</p>
        </div>
      </div>
    );
  }

  const q = questions[currentIndex];
  const formattedTime = `${Math.floor(timeLeft / 60)}:${String(
    timeLeft % 60
  ).padStart(2, "0")}`;

  return (
    <div className="flex h-screen bg-[#f2f6fc] overflow-hidden">

      {/* ========== SIDEBAR ========== */}
      <ExamSidebar
        questions={questions}
        currentIndex={currentIndex}
        answers={answers}
        jumpTo={jumpTo}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ========== MAIN AREA ========== */}
      <div className="flex-1 flex flex-col">

        {/* ===== HEADER ===== */}
        <div className="bg-white border-b border-gray-300 px-4 sm:px-6 py-3 shadow-sm">
          <div className="flex justify-between items-center">

            <div>
              <h1 className="text-base sm:text-lg font-bold text-[#004AAD]">
                {examTitle}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">
                Question {currentIndex + 1} of {questions.length}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm text-gray-600">
                Time Left
              </span>

              <div
                className={`px-4 py-1 text-sm sm:text-base font-bold border rounded ${
                  timeLeft < 300
                    ? "bg-red-50 text-red-700 border-red-300"
                    : "bg-blue-50 text-blue-800 border-blue-300"
                }`}
              >
                {formattedTime}
              </div>
            </div>
          </div>
        </div>

        {/* ===== QUESTION AREA ===== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">

          <div className="bg-white border border-gray-300 p-4 sm:p-6 shadow-sm">

            <div className="mb-4 border-b pb-3">
              <span className="bg-blue-100 border border-blue-300 text-blue-700 px-3 py-1 text-xs font-semibold">
                QUESTION {currentIndex + 1}
              </span>

              <p className="text-sm sm:text-lg text-gray-900 mt-3 leading-relaxed">
                {q.question}
              </p>
            </div>

            <div className="space-y-3">
              {["A", "B", "C", "D"].map((opt) => {
                const selected = answers[q._id] === opt;

                return (
                  <div
                    key={opt}
                    onClick={() => selectOption(q._id, opt)}
                    className={`flex items-center border px-3 sm:px-4 py-3 cursor-pointer transition ${
                      selected
                        ? "bg-blue-50 border-[#004AAD]"
                        : "bg-white border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 flex items-center justify-center border font-bold mr-3 ${
                        selected
                          ? "bg-[#004AAD] text-white border-[#004AAD]"
                          : "bg-white border-gray-400"
                      }`}
                    >
                      {opt}
                    </div>

                    <p className="text-sm text-gray-800">
                      {q["option" + opt]}
                    </p>
                  </div>
                );
              })}
            </div>

            {answers[q._id] && (
              <div className="mt-5 border-t pt-4">
                <button
                  onClick={() => clearAnswer(q._id)}
                  className="px-4 py-2 border border-red-300 text-red-700 hover:bg-red-50"
                >
                  Clear Answer
                </button>
              </div>
            )}
          </div>

          {/* ===== NAVIGATION ===== */}
          <div className="flex justify-between items-center mt-6 gap-3 flex-wrap">

            <button
              onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
              disabled={currentIndex === 0}
              className={`px-4 py-2 border rounded ${
                currentIndex === 0
                  ? "bg-gray-200 text-gray-400"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              Previous
            </button>

            {currentIndex === questions.length - 1 ? (
              <button
                onClick={() => handleSubmit("manual_submit")}
                className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Submit Exam
              </button>
            ) : (
              <button
                onClick={() => setCurrentIndex(currentIndex + 1)}
                className="px-5 py-2 bg-[#004AAD] text-white rounded hover:bg-[#003A88]"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===== MOBILE QUESTIONS BUTTON ===== */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 bg-blue-600 text-white px-5 py-3 rounded-full shadow-lg z-50"
      >
        Questions
      </button>
    </div>
  );
}
