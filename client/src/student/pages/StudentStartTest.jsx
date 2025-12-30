import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import useFullscreenProtection from "../hooks/useFullscreenProtection";

export default function StudentStartTest() {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;
  const studentId = localStorage.getItem("studentId");

  const [loading, setLoading] = useState(false);
  const [examTitle, setExamTitle] = useState("");
  const [duration, setDuration] = useState(null);

  const logoutLock = useRef(false);

  const forceLogout = (message) => {
    if (logoutLock.current) return;
    logoutLock.current = true;
    alert(message || "You have been logged out.");
    localStorage.clear();
    window.location.href = "/";
  };

  /* ================= FULLSCREEN PROTECTION ================= */
  useFullscreenProtection({
    mode: "logout",
    onLogout: () =>
      forceLogout("⚠ Fullscreen violation detected. Logging out."),
  });

  /* ================= BLOCK BACK ================= */
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handleBack = () => {
      forceLogout("❌ Back navigation is blocked during exam.");
      window.history.go(1);
    };
    window.onpopstate = handleBack;
    return () => (window.onpopstate = null);
  }, []);

  /* ================= BLOCK REFRESH ================= */
  useEffect(() => {
    const beforeUnload = (e) => {
      forceLogout("❌ Page refresh / close detected. Logging out.");
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () =>
      window.removeEventListener("beforeunload", beforeUnload);
  }, []);

  /* ================= TAB SWITCH ================= */
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        forceLogout("❌ Tab switch or minimize detected. Logging out.");
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  /* ================= FETCH EXAM ================= */
  useEffect(() => {
    const fetchExamInfo = async () => {
      try {
        const res = await axios.get(
          `${API}/student/get-questions`,
          { params: { studentId } }
        );
        setExamTitle(res.data.examTitle);
        setDuration(res.data.duration);
      } catch {
        forceLogout("❌ No exam found or exam disabled. Logging out.");
      }
    };
    fetchExamInfo();
  }, [studentId]);

  /* ================= START EXAM ================= */
  const startExam = async () => {
    if (!duration) {
      alert("Exam not available right now.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API}/student/start`,
        {
          studentId,
          durationSeconds: duration * 60,
        },
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : undefined,
        }
      );

      if (res.data.endTime) {
        localStorage.setItem("examStarted", "true");
        localStorage.setItem("examEndTime", res.data.endTime);
      }

      navigate("/student/exam");
    } catch (err) {
      alert(err.response?.data?.message || "Could not start exam.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f2f6fc] flex flex-col">

      {/* ===== HEADER ===== */}
      <header className="bg-[#004AAD] py-4 shadow-md">
        <h1 className="text-white text-center text-lg sm:text-2xl font-semibold tracking-wide">
          Start Examination
        </h1>
      </header>

      {/* ===== CONTENT ===== */}
      <div className="flex-1 flex items-center justify-center px-3 sm:px-6 py-6">
        <div className="bg-white border border-gray-300 shadow-md rounded-md w-full max-w-xl p-5 sm:p-8">

          {/* EXAM TITLE */}
          <div className="text-center mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-[#004AAD]">
              {examTitle || "Fetching Exam Details..."}
            </h2>

            <div className="mt-3 inline-flex items-center px-4 py-1 border border-blue-300 bg-blue-50 text-blue-700 rounded text-sm">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {duration ? `${duration} Minutes` : "Loading..."}
            </div>
          </div>

          {/* IMPORTANT INFO */}
          <div className="border border-blue-200 bg-blue-50 p-4 sm:p-5 rounded-md mb-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3">
              Important Instructions
            </h3>

            <ul className="space-y-3 text-sm sm:text-base text-gray-700">
              {[
                "Ensure a stable internet connection.",
                "Close all background applications.",
                "The exam timer starts immediately and cannot be paused.",
              ].map((text, i) => (
                <li key={i} className="flex gap-2">
                  <svg
                    className="w-4 h-4 mt-1 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* START BUTTON */}
          <div className="border-t border-gray-300 pt-5">
            <button
              onClick={startExam}
              disabled={loading || !duration}
              className={`w-full py-3 font-semibold rounded-md text-white transition ${
                loading || !duration
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#004AAD] hover:bg-[#003A88]"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Starting Exam...</span>
                </div>
              ) : (
                "Start Exam"
              )}
            </button>

            {!duration && (
              <p className="text-center text-sm text-gray-500 mt-3">
                Please wait… fetching exam details
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
