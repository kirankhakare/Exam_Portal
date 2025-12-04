import { useEffect, useState } from "react";

export default function ThankYou() {
  const [resultId, setResultId] = useState(null);
  const API = import.meta.env.VITE_API_URL;
  // Disable back button + backspace navigation
  useEffect(() => {
    window.history.pushState(null, null, window.location.href);
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
    return () => document.removeEventListener("keydown", preventBackspace);
  }, []);

  // Load resultId
  useEffect(() => {
    const id = localStorage.getItem("resultId");
    setResultId(id);
  }, []);

return (
  <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center px-4 py-10">

    <div className="bg-white shadow-2xl border border-gray-200 rounded-3xl p-10 max-w-lg w-full text-center animate-fadeIn">

      {/* Success Icon */}
      <div className="flex justify-center mb-6">
        <div className="bg-green-100 text-green-600 w-24 h-24 flex items-center justify-center 
          rounded-full shadow-lg animate-bounce">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-14 w-14"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-4xl font-extrabold text-green-700 mb-4 tracking-wide drop-shadow-sm">
        Thank You!
      </h1>

      <p className="text-lg text-gray-600 mb-6">
        Your exam has been submitted successfully.
      </p>

      {/* Download PDF Button */}

      {/* Divider */}
      <div className="mt-10 mb-6 border-t border-gray-300"></div>

      {/* Footer note */}
      <p className="text-gray-500 text-sm italic">
        You may safely close this window now.
      </p>
    </div>
  </div>
);

}
