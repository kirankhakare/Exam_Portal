export default function ExamSidebar({
  questions,
  currentIndex,
  answers,
  jumpTo
}) {
  const attemptedCount = Object.keys(answers).length;

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Questions</h2>
        <p className="text-sm text-gray-600">
          {questions.length} questions • {attemptedCount} answered
        </p>
      </div>

      {/* Progress Stats */}
      <div className="p-6 bg-blue-50 border-b border-blue-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-blue-800">Progress</span>
          <span className="text-sm font-bold text-blue-700">
            {Math.round((attemptedCount / questions.length) * 100)}%
          </span>
        </div>
        <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${(attemptedCount / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Questions Grid */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-5 gap-3">
          {questions.map((q, idx) => {
            const ans = answers[q._id];
            const isCurrent = idx === currentIndex;
            
            let bgClass = "bg-gray-100 text-gray-700 hover:bg-gray-200";
            let borderClass = "border-gray-200";
            
            if (ans) {
              bgClass = "bg-green-100 text-green-700 hover:bg-green-200 border-green-300";
              borderClass = "border-green-300";
            }
            if (isCurrent) {
              bgClass = "bg-blue-600 text-white hover:bg-blue-700 border-blue-600";
              borderClass = "border-blue-600";
            } else if (ans && isCurrent) {
              bgClass = "bg-blue-600 text-white hover:bg-blue-700 border-blue-600";
              borderClass = "border-blue-600";
            }

            return (
              <button
                key={q._id}
                onClick={() => jumpTo(idx)}
                className={`
                  flex items-center justify-center
                  w-12 h-12 rounded-lg border-2
                  font-medium text-base
                  transition-all duration-200
                  ${bgClass} ${borderClass}
                  ${isCurrent ? 'ring-2 ring-blue-300 ring-offset-1' : ''}
                `}
              >
                <div className="relative">
                  {idx + 1}
                  {ans && !isCurrent && (
                    <div className="absolute -top-2 -right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <span className="text-sm font-medium text-gray-700">Current</span>
            </div>
            <span className="text-sm font-bold text-gray-900">{currentIndex + 1}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium text-gray-700">Answered</span>
            </div>
            <span className="text-sm font-bold text-gray-900">{attemptedCount}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-300"></div>
              <span className="text-sm font-medium text-gray-700">Remaining</span>
            </div>
            <span className="text-sm font-bold text-gray-900">{questions.length - attemptedCount}</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-center text-xs text-gray-500">
            Click any number to navigate
          </div>
        </div>
      </div>
    </div>
  );
}