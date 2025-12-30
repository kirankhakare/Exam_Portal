import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useFullscreenProtection from "../hooks/useFullscreenProtection";

export default function StudentInstructions() {
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const logoutLock = useRef(false);

  const forceLogout = (msg) => {
    if (logoutLock.current) return;
    logoutLock.current = true;
    if (msg) alert(msg);
    try {
      localStorage.clear();
    } catch {}
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
      forceLogout("❌ Back navigation blocked. Logging out.");
      window.history.go(1);
    };
    window.onpopstate = handleBack;
    return () => (window.onpopstate = null);
  }, []);

  /* ================= BLOCK REFRESH ================= */
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!logoutLock.current) {
        forceLogout("❌ Page refresh / tab close blocked. Logging out.");
      }
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () =>
      window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  /* ================= TAB SWITCH ================= */
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && !logoutLock.current) {
        forceLogout("❌ Tab switch detected. Logging out.");
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  /* ================= CONTINUE ================= */
  const handleContinue = () => {
    if (!accepted) {
      setError("Please confirm you have read the instructions.");
      return;
    }
    setError("");
    navigate("/student/start-test");
  };

  return (
    <div className="min-h-screen bg-[#f2f6fc] flex flex-col">

      {/* ===== HEADER ===== */}
      <header className="bg-[#004AAD] py-4 shadow-md">
        <h1 className="text-white text-center text-lg sm:text-2xl font-semibold tracking-wide">
          Examination Instructions
        </h1>
      </header>

      {/* ===== CONTENT ===== */}
      <div className="flex-1 flex items-center justify-center px-3 sm:px-6 py-6">
        <div className="bg-white border border-gray-200 shadow-lg rounded-md w-full max-w-3xl p-5 sm:p-8">

          {/* TITLE */}
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-[#004AAD]">
              Please Read Carefully
            </h2>
            <p className="text-gray-700 text-sm sm:text-base mt-1">
              All candidates must strictly follow the instructions below.
            </p>
          </div>

          {/* ===== EXAM PATTERN ===== */}
          <div className="border border-gray-300 rounded-md bg-[#f8faff] p-4 sm:p-5 mb-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3">
              📌 Exam Pattern
            </h3>

            <ul className="space-y-2 text-sm sm:text-base text-gray-800">
              <li>1. <strong>Basic Math / Vedic Math</strong> — 30 Questions</li>
              <li>2. <strong>HTML</strong> — 10 Questions</li>
              <li>3. <strong>CSS</strong> — 10 Questions</li>
              <li>4. <strong>Basic C Programming</strong> — 10 Questions</li>
            </ul>

            <div className="mt-4 border-t pt-3 text-sm sm:text-base space-y-2">
              <p><strong>Total Questions:</strong> 60</p>
              <p><strong>Total Duration:</strong> 1 Hour</p>

              <p className="text-red-600 font-semibold leading-relaxed">
                ⚠ Negative Marking: 1 mark for every correct answer and{" "}
                <span className="underline">0.33 marks deducted</span> for
                every wrong answer. No deduction for unanswered questions.
              </p>
            </div>
          </div>

          {/* ===== GUIDELINES ===== */}
          <div className="border border-blue-200 bg-blue-50 p-4 sm:p-5 rounded-md mb-6">
            <h3 className="text-base sm:text-lg font-semibold mb-4">
              Exam Guidelines
            </h3>

            <ul className="space-y-4 text-sm sm:text-base text-gray-700">
              {[
                "The exam starts in fullscreen mode. Exiting it will cause automatic logout.",
                "Do not refresh, go back, minimize, or switch tabs during the exam.",
                "Any violation will terminate the exam immediately.",
              ].map((text, i) => (
                <li key={i} className="flex gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-700 flex items-center justify-center font-semibold">
                    {i + 1}
                  </div>
                  <p>{text}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* ===== ACCEPT ===== */}
          <div className="border-t pt-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1 h-5 w-5"
              />
              <div>
                <p className="font-medium text-gray-900">
                  I have read and understood all instructions
                </p>
                <p className="text-sm text-gray-600">
                  I agree to follow all exam rules.
                </p>
              </div>
            </label>

            {error && (
              <p className="mt-3 text-sm font-medium text-red-600">
                {error}
              </p>
            )}
          </div>

          {/* ===== CONTINUE ===== */}
          <div className="mt-6">
            <button
              onClick={handleContinue}
              disabled={!accepted}
              className={`w-full py-3 rounded-md font-semibold text-white transition ${
                accepted
                  ? "bg-[#004AAD] hover:bg-[#003A88]"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              Continue to Exam
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
