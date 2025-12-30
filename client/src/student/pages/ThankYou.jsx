import { useEffect, useState } from "react";

export default function ThankYou() {
  const [resultId, setResultId] = useState(null);

  /* ================= BLOCK BACK + BACKSPACE ================= */
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = () => window.history.go(1);

    const preventBackspace = (e) => {
      if (
        e.key === "Backspace" &&
        e.target.tagName !== "INPUT" &&
        e.target.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("keydown", preventBackspace);
    return () =>
      document.removeEventListener("keydown", preventBackspace);
  }, []);

  /* ================= LOAD RESULT ID ================= */
  useEffect(() => {
    const id = localStorage.getItem("resultId");
    setResultId(id);
  }, []);

  return (
    <div className="min-h-screen bg-[#f2f6fc] flex items-center justify-center px-4 py-10">

      <div className="bg-white border border-gray-300 shadow-xl rounded-xl p-8 sm:p-10 max-w-lg w-full text-center">

        {/* SUCCESS ICON */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-green-100 flex items-center justify-center shadow-md">
            <svg
              className="w-12 h-12 sm:w-14 sm:h-14 text-green-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* TITLE */}
        <h1 className="text-2xl sm:text-3xl font-bold text-green-700 mb-3">
          Exam Submitted Successfully
        </h1>

        <p className="text-gray-600 text-sm sm:text-base mb-6">
          Your responses have been recorded and submitted securely.
        </p>

        {/* INFO CARD */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
          <p className="font-medium">
            ✔ Submission completed
          </p>
          <p className="mt-1">
            ✔ Exam session closed
          </p>
          <p className="mt-1">
            ✔ You are now logged out
          </p>
        </div>

        {/* OPTIONAL RESULT ID */}
        {resultId && (
          <div className="mt-5 text-sm text-gray-500">
            Reference ID:
            <span className="ml-1 font-semibold text-gray-700">
              {resultId}
            </span>
          </div>
        )}

        {/* DIVIDER */}
        <div className="my-8 border-t border-gray-300"></div>

        {/* FOOTER */}
        <p className="text-gray-500 text-xs sm:text-sm italic">
          You may safely close this window.
        </p>

      </div>
    </div>
  );
}
