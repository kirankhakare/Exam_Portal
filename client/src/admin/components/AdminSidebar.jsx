import { Link, useLocation } from "react-router-dom";
import { Home, UserPlus, Users, Upload, History, LogOut, X } from "lucide-react";

export default function AdminSidebar({ isOpen, onClose }) {
  const location = useLocation();

  const menuItems = [
    { label: "Dashboard", to: "/admin", icon: <Home size={20} /> },
    { label: "Create User", to: "/admin/create-user", icon: <UserPlus size={20} /> },
    { label: "Users List", to: "/admin/users", icon: <Users size={20} /> },
    { label: "Upload Questions", to: "/admin/upload-questions", icon: <Upload size={20} /> },
    { label: "History", to: "/admin/history", icon: <History size={20} /> },
  ];

  return (
    <div
      className={`
        fixed lg:fixed
        top-0 left-0
        h-screen
        w-64 max-w-[80vw]
        bg-gradient-to-b from-gray-900 to-gray-950
        text-white
        flex flex-col
        border-r border-gray-800
        z-30
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
    >
      {/* HEADER */}
      <div className="p-6 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-lg">
            <Home size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <p className="text-xs text-gray-400">Control Center</p>
          </div>
        </div>

        {/* Close button (mobile only) */}
        <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
          <X size={22} />
        </button>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.to;

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all group
                  ${
                    isActive
                      ? "bg-blue-900/30 text-blue-100 border-l-4 border-blue-500"
                      : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                  }
                `}
              >
                <div className={isActive ? "text-blue-400" : "group-hover:text-white text-gray-400"}>
                  {item.icon}
                </div>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* LOGOUT */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => {
            if (window.confirm("Are you sure you want to logout?")) {
              localStorage.clear();
              window.location.href = "/";
            }
          }}
          className="
            w-full flex items-center justify-center gap-2
            p-3 rounded-lg font-medium transition-all
            bg-gradient-to-r from-red-900/20 to-red-800/10
            hover:from-red-900/30 hover:to-red-800/20
            text-red-300 hover:text-white
            border border-red-900/30
          "
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
}
