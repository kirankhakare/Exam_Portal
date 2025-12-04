import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useFullscreenProtection from "../hooks/useFullscreenProtection";

export default function StudentInstructions() {
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const logoutLock = useRef(false);
  const API = import.meta.env.VITE_API_URL;
  const forceLogout = (msg) => {
    if (logoutLock.current) return;
    logoutLock.current = true;
    if (msg) alert(msg);
    try { localStorage.clear(); } catch (err) {}
    window.location.href = "/";
  };

  useFullscreenProtection({
    mode: "logout",
    onLogout: () => forceLogout("⚠ Fullscreen violation detected. Logging out.")
  });

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handleBack = () => {
      forceLogout("❌ Back navigation blocked. Logging out.");
      window.history.go(1);
    };
    window.onpopstate = handleBack;
    return () => (window.onpopstate = null);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!logoutLock.current) {
        forceLogout("❌ Page refresh / tab close blocked. Logging out.");
      }
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && !logoutLock.current) {
        forceLogout("❌ Tab switch detected. Logging out.");
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const handleContinue = () => {
    if (!accepted) {
      setError("Please confirm you have read instructions.");
      return;
    }
    setError("");
    navigate("/student/start-test");
  };

  return (
  <div className="min-h-screen bg-[#f2f6fc] flex flex-col">

    {/* ====== Top Header (TCS Style) ====== */}
    <header className="w-full bg-[#004AAD] py-4 shadow-md">
      <h1 className="text-white text-center text-2xl font-semibold tracking-wide">
        Examination Instructions
      </h1>
    </header>

    {/* ====== Main Layout ====== */}
    <div className="flex flex-1 items-center justify-center p-6">

      <div className="bg-white shadow-lg border border-gray-200 rounded-md p-8 max-w-3xl w-full">

        {/* Title Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#004AAD]">Please Read Carefully</h2>
          <p className="text-gray-700 mt-1">
            All candidates must follow the below exam rules strictly.
          </p>
        </div>

        {/* ====== Exam Pattern Card ====== */}
       {/* ====== Exam Pattern Card ====== */}
<div className="border border-gray-300 rounded-md bg-[#f8faff] p-5 mb-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-3">
    📌 Exam Pattern
  </h3>

  <ul className="space-y-2 text-gray-800">
    <li>1. <strong>Basic Math / Vedic Math</strong> — 30 Questions</li>
    <li>2. <strong>HTML</strong> — 10 Questions</li>
    <li>3. <strong>CSS</strong> — 10 Questions</li>
    <li>4. <strong>Basic C Programming</strong> — 10 Questions</li>
  </ul>

  <div className="mt-4 border-t pt-3 text-gray-900 font-medium space-y-2">
    <p>📝 <strong>Total Questions:</strong> 60</p>
    <p>⏰ <strong>Total Duration:</strong> 1 Hour</p>

    {/* ⭐ Final Negative Marking Line (Professional) */}
    <p className="text-red-600 font-semibold leading-relaxed">
      ⚠ Negative Marking: 1 mark will be awarded for every correct answer, 
      and <span className="underline">0.33 marks will be deducted</span> for every wrong answer. 
      No marks will be deducted for unanswered questions.
    </p>
  </div>
</div>


        {/* ====== Guidelines ====== */}
        <div className="border border-blue-200 bg-blue-50 p-5 rounded-md mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Exam Guidelines
          </h3>

          <ul className="space-y-4 text-gray-700">
            <li className="flex gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-sm flex items-center justify-center font-semibold">1</div>
              <p>The exam starts in <strong>fullscreen mode</strong>. Exiting it will result in immediate logout.</p>
            </li>

            <li className="flex gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-sm flex items-center justify-center font-semibold">2</div>
              <p>Do not refresh, go back, switch tabs, or minimize the browser during the exam.</p>
            </li>

            <li className="flex gap-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-sm flex items-center justify-center font-semibold">3</div>
              <p>Any violation will trigger <strong>automatic logout</strong> and exam termination.</p>
            </li>
          </ul>
        </div>

        {/* ====== Accept Agreement ====== */}
        <div className="border-t border-gray-300 pt-4">
          <div className="flex items-start">
            <input
              id="accept"
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="h-5 w-5 text-blue-600 border-gray-400"
            />

            <div className="ml-3">
              <label htmlFor="accept" className="font-medium text-gray-900">
                I have read and understood all the above instructions
              </label>
              <p className="text-sm text-gray-600">
                I agree to follow all rules throughout the examination.
              </p>
            </div>
          </div>

          {error && (
            <p className="mt-3 text-sm font-medium text-red-600">
              {error}
            </p>
          )}
        </div>

        {/* ====== Continue Button ====== */}
        <div className="mt-6">
          <button
            onClick={handleContinue}
            disabled={!accepted}
            className={`w-full py-3 rounded-md font-semibold text-white transition-all ${
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
