export default function ExamSidebar({
  questions,
  currentIndex,
  answers,
  jumpTo,
  isOpen,
  onClose
}) {
  const attemptedCount = Object.keys(answers).length;
  const progress = Math.round((attemptedCount / questions.length) * 100);

  return (
    <>
      {/* MOBILE OVERLAY */}
      <div
        onClick={onClose}
        className={`
          fixed inset-0 bg-black/40 z-30
          transition-opacity
          lg:hidden
          ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}
        `}
      />

      {/* SIDEBAR / DRAWER */}
      <div
        className={`
          fixed lg:static
          bottom-0 lg:bottom-auto
          left-0
          w-full lg:w-80
          h-[75vh] lg:h-full
          bg-white
          border-t lg:border-t-0 lg:border-r
          border-gray-200
          flex flex-col
          z-40
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-y-0" : "translate-y-full"}
          lg:translate-y-0
        `}
      >
        {/* HEADER */}
        <div className="p-4 lg:p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg lg:text-xl font-bold text-gray-900">
              Questions
            </h2>
            <p className="text-xs lg:text-sm text-gray-600">
              {questions.length} questions • {attemptedCount} answered
            </p>
          </div>

          {/* CLOSE (Mobile Only) */}
          <button
            onClick={onClose}
            className="lg:hidden text-gray-500 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* PROGRESS */}
        <div className="p-4 lg:p-6 bg-blue-50 border-b border-blue-100">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-blue-800">
              Progress
            </span>
            <span className="text-sm font-bold text-blue-700">
              {progress}%
            </span>
          </div>

          <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* QUESTIONS GRID */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-5 gap-3">
            {questions.map((q, idx) => {
              const ans = answers[q._id];
              const isCurrent = idx === currentIndex;

              let base =
                "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200";
              if (ans)
                base =
                  "bg-green-100 text-green-700 border-green-300 hover:bg-green-200";
              if (isCurrent)
                base =
                  "bg-blue-600 text-white border-blue-600 hover:bg-blue-700";

              return (
                <button
                  key={q._id}
                  onClick={() => {
                    jumpTo(idx);
                    onClose?.();
                  }}
                  className={`
                    w-10 h-10 lg:w-12 lg:h-12
                    rounded-lg border-2
                    flex items-center justify-center
                    font-medium text-sm lg:text-base
                    transition
                    ${base}
                    ${isCurrent ? "ring-2 ring-blue-300 ring-offset-1" : ""}
                  `}
                >
                  <div className="relative">
                    {idx + 1}
                    {ans && !isCurrent && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* FOOTER SUMMARY */}
        <div className="p-4 lg:p-6 border-t bg-gray-50">
          <div className="grid grid-cols-3 gap-3 text-center text-xs lg:text-sm">
            <Summary label="Current" color="bg-blue-600" value={currentIndex + 1} />
            <Summary label="Answered" color="bg-green-500" value={attemptedCount} />
            <Summary
              label="Remaining"
              color="bg-gray-300"
              value={questions.length - attemptedCount}
            />
          </div>

          <p className="mt-4 text-center text-xs text-gray-500">
            Tap any number to jump
          </p>
        </div>
      </div>
    </>
  );
}

/* ================= HELPER ================= */

function Summary({ label, color, value }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-3 h-3 rounded-full ${color}`} />
      <span className="text-gray-700 font-medium">{label}</span>
      <span className="font-bold text-gray-900">{value}</span>
    </div>
  );
}
