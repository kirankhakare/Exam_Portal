import { Menu } from "lucide-react";

export default function AdminHeader({ onMenuClick }) {
  return (
    <div
      className="
        w-full
        bg-white/90 backdrop-blur-md
        shadow-md
        px-3 sm:px-4 md:px-6
        py-3 sm:py-4
        flex
        justify-between
        items-center
        border-b border-gray-200
      "
    >
      {/* LEFT */}
      <div className="flex items-center gap-3">
        {/* Hamburger (Mobile Only) */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100"
        >
          <Menu size={22} />
        </button>

        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 tracking-tight">
          Admin Dashboard
        </h2>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden sm:flex flex-col text-right leading-tight">
          <span className="text-gray-700 font-semibold">Admin</span>
          <span className="text-gray-500 text-xs sm:text-sm">Logged in</span>
        </div>

        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold shadow">
          A
        </div>
      </div>
    </div>
  );
}
