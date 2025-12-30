import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen w-screen flex bg-gray-100 overflow-hidden">

      {/* MOBILE OVERLAY */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={`
          fixed inset-0 bg-black/40 z-20
          transition-opacity
          lg:hidden
          ${sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"}
        `}
      />

      {/* SIDEBAR */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* MAIN AREA */}
      <div className="flex flex-col flex-1 h-full w-full lg:ml-64">
        {/* HEADER */}
        <div className="shrink-0 bg-white shadow-md z-10">
          <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-5 md:px-8 py-4 bg-gray-50">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
