import { useEffect, useState, useRef } from "react";
import axios from "axios";
import useFullscreenProtection from "../hooks/useFullscreenProtection";
import useAntiCheat from "../hooks/useAntiCheat";
import ExamSidebar from "../components/ExamSidebar";

export default function ExamPage() {
  const studentId = localStorage.getItem("studentId");
  const [questions, setQuestions] = useState([]);
  const [examTitle, setExamTitle] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const protectionsActive = useRef(true);
  const API = import.meta.env.VITE_API_URL;
  /* =====================================
     SUBMIT EXAM (CHEAT SAFE)
  ===================================== */
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

  /* =====================================
     FULLSCREEN EXIT → AUTO SUBMIT
  ===================================== */
  useFullscreenProtection({
    mode: "exam-submit",
    onExamSubmit: () => handleSubmit("fullscreen_exit"),
  });

  /* =====================================
     TAB SWITCH / ALT+TAB → AUTO SUBMIT
  ===================================== */
  useAntiCheat(protectionsActive, () =>
    handleSubmit("tab_switch_or_cheat")
  );

  /* =====================================
     FETCH EXAM DATA (FIXED USEEFFECT)
  ===================================== */
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
        console.error("Get-questions failed:", err);
        window.location.href = "/student/thank-you";
      }
    };

    fetchExamData();

    return () => {
      mounted = false;
    };
  }, [studentId]);

  /* =====================================
     EXAM TIMER (FIXED USEEFFECT)
  ===================================== */
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

  /* =====================================
     QUESTION HANDLERS
  ===================================== */
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

  /* =====================================
     LOADING SCREEN
  ===================================== */
  if (!questions.length || timeLeft === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading exam...</p>
        </div>
      </div>
    );
  }

  /* =====================================
     RENDER QUESTION
  ===================================== */
  const q = questions[currentIndex];
  const formattedTime = `${Math.floor(timeLeft / 60)}:${String(
    timeLeft % 60
  ).padStart(2, "0")}`;
return (
  <div className="flex h-screen bg-[#f2f6fc]">

    {/* ========== LEFT SIDEBAR ========== */}
    <ExamSidebar
      questions={questions}
      currentIndex={currentIndex}
      answers={answers}
      jumpTo={jumpTo}
    />

    {/* ========== MAIN PANEL ========== */}
    <div className="flex-1 flex flex-col">

      {/* ======== HEADER (TCS Style) ======== */}
      <div className="bg-white border-b border-gray-300 px-8 py-4 shadow-sm">
        <div className="flex justify-between items-center">

          {/* Exam Information */}
          <div>
            <h1 className="text-xl font-bold text-[#004AAD]">{examTitle}</h1>
            <p className="text-gray-600 text-sm mt-1">
              Question {currentIndex + 1} of {questions.length}
            </p>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-4">
            <span className="text-gray-600 font-medium flex items-center gap-2">
              <svg className="w-5 h-5 text-[#004AAD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Remaining Time:
            </span>

            <div
              className={`px-6 py-2 font-bold text-lg border rounded-md ${
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

      {/* ========== QUESTION AREA ========== */}
      <div className="flex-1 overflow-y-auto p-8">

        {/* ====== QUESTION BOX ====== */}
        <div className="bg-white border border-gray-300 p-6 shadow-sm">

          {/* Question Title */}
          <div className="mb-6 border-b pb-4">
            <span className="bg-blue-100 border border-blue-300 text-blue-700 px-3 py-1 text-sm font-semibold">
              QUESTION {currentIndex + 1}
            </span>

            <p className="text-lg text-gray-900 mt-4 leading-relaxed">
              {q.question}
            </p>
          </div>

          {/* ====== OPTIONS (TCS Style) ====== */}
          <div className="space-y-3">
            {["A", "B", "C", "D"].map((opt) => {
              const optionText = q["option" + opt];
              const selected = answers[q._id] === opt;

              return (
                <div
                  key={opt}
                  onClick={() => selectOption(q._id, opt)}
                  className={`flex items-center border px-4 py-3 cursor-pointer transition 
                    ${
                      selected
                        ? "bg-blue-50 border-[#004AAD] shadow-sm"
                        : "bg-white border-gray-300 hover:bg-gray-100"
                    }`}
                >
                  {/* Option Bubble */}
                  <div
                    className={`w-8 h-8 flex items-center justify-center border text-sm font-bold mr-4
                      ${
                        selected
                          ? "bg-[#004AAD] text-white border-[#004AAD]"
                          : "bg-white border-gray-400 text-gray-700"
                      }
                    `}
                  >
                    {opt}
                  </div>

                  {/* Option Text */}
                  <p className="text-gray-800 text-sm">{optionText}</p>

                  {/* Tick icon */}
                  {selected && (
                    <svg className="w-5 h-5 ml-auto text-[#004AAD]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0L4 11.414a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>

          {/* Clear Answer Button */}
          {answers[q._id] && (
            <div className="mt-6 border-t pt-4">
              <button
                onClick={() => clearAnswer(q._id)}
                className="px-4 py-2 border border-red-300 text-red-700 font-medium hover:bg-red-50 transition"
              >
                Clear Answer
              </button>
            </div>
          )}
        </div>

        {/* ========== NAVIGATION ========== */}
        <div className="flex justify-between items-center mt-8">

          {/* Previous */}
          <button
            onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
            disabled={currentIndex === 0}
            className={`px-6 py-2 border rounded-md ${
              currentIndex === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white border-gray-400 hover:bg-gray-100 text-gray-700"
            }`}
          >
            Previous
          </button>

          {/* Status */}
          <div className="text-sm text-gray-600">
            {answers[q._id] ? "Answered" : "Not Answered"}
          </div>

          {/* NEXT or SUBMIT */}
          {currentIndex === questions.length - 1 ? (
            <button
              onClick={() => handleSubmit("manual_submit")}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Submit Exam
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex(currentIndex + 1)}
              className="px-6 py-2 bg-[#004AAD] text-white rounded-md hover:bg-[#003A88]"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);

}
