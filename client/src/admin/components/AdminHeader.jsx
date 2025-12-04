export default function AdminHeader() {
  return (
    <div className="w-full bg-white/90 backdrop-blur-md shadow-md px-6 py-4 flex justify-between items-center border-b border-gray-200">

      {/* Left Title */}
      <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
        Admin Dashboard
      </h2>

      {/* Right Profile */}
      <div className="flex items-center gap-3">

        <div className="flex flex-col text-right leading-tight">
          <span className="text-gray-700 font-semibold">Admin</span>
          <span className="text-gray-500 text-sm">Logged in</span>
        </div>

        {/* Circle Avatar */}
        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold shadow">
          A
        </div>

      </div>
    </div>
  );
}
