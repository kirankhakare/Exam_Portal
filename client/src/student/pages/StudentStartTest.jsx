import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import useFullscreenProtection from "../hooks/useFullscreenProtection";

export default function StudentStartTest() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [examTitle, setExamTitle] = useState("");
  const [duration, setDuration] = useState(null);
  const API = import.meta.env.VITE_API_URL;
  const studentId = localStorage.getItem("studentId");
  const logoutLock = useRef(false);

  const forceLogout = (message) => {
    if (logoutLock.current) return;
    logoutLock.current = true;
    alert(message || "You have been logged out.");
    localStorage.clear();
    window.location.href = "/";
  };

  useFullscreenProtection({
    mode: "logout",
    onLogout: () => forceLogout("⚠ Fullscreen violation detected. Logging out.")
  });

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handleBack = () => {
      forceLogout("❌ Back navigation is blocked during exam.");
      window.history.go(1);
    };
    window.onpopstate = handleBack;
    return () => (window.onpopstate = null);
  }, []);

  useEffect(() => {
    const beforeUnload = (e) => {
      forceLogout("❌ Page refresh / close detected. Logging out.");
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        forceLogout("❌ Tab switch or minimize detected. Logging out.");
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    const fetchExamInfo = async () => {
      try {
        const res = await axios.get(
          `${API}/student/get-questions`,
          { params: { studentId } }
        );
        setExamTitle(res.data.examTitle);
        setDuration(res.data.duration);
      } catch (err) {
        forceLogout("❌ No exam found or exam disabled. Logging out.");
      }
    };
    fetchExamInfo();
  }, [studentId]);

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
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
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

    {/* ====== Top Header (TCS Style) ====== */}
    <header className="w-full bg-[#004AAD] py-4 shadow-md">
      <h1 className="text-white text-center text-2xl font-semibold tracking-wide">
        Start Examination
      </h1>
    </header>

    {/* ====== Main Body ====== */}
    <div className="flex flex-1 items-center justify-center p-6">

      {/* TCS Style Card */}
      <div className="bg-white border border-gray-300 shadow-md rounded-md p-8 max-w-xl w-full">

        {/* Exam Title */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-[#004AAD]">
            {examTitle || "Fetching Exam Details..."}
          </h2>

          {/* Duration */}
          <div className="mt-3 inline-flex items-center px-4 py-1 border border-blue-300 bg-blue-50 text-blue-700 rounded">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {duration ? `${duration} Minutes` : "Loading..."}
          </div>
        </div>

        {/* ====== Important Information ====== */}
        <div className="border border-blue-200 bg-blue-50 p-5 rounded-md mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Important Instructions
          </h3>

          <ul className="space-y-3 text-gray-700 text-sm">
            <li className="flex gap-2">
              <svg className="w-4 h-4 mt-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
              </svg>
              Ensure a stable internet connection throughout the exam.
            </li>

            <li className="flex gap-2">
              <svg className="w-4 h-4 mt-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
              </svg>
              Close all background applications before starting the test.
            </li>

            <li className="flex gap-2">
              <svg className="w-4 h-4 mt-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
              </svg>
              The exam timer will start immediately and cannot be paused.
            </li>
          </ul>
        </div>

        {/* ====== Start Exam Button ====== */}
        <div className="border-t border-gray-300 pt-5">
          <button
            onClick={startExam}
            disabled={loading || !duration}
            className={`w-full py-3 font-semibold rounded-md text-white transition-all ${
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
              Please wait... fetching exam details
            </p>
          )}
        </div>
      </div>
    </div>
  </div>
);

}