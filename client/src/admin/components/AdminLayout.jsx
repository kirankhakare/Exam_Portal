import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayout({ children }) {
  return (
    <div className="h-screen w-screen flex overflow-hidden bg-gray-100">

      {/* FIXED SIDEBAR */}
      <div className="fixed left-0 top-0 h-full w-64 z-20 shadow-xl">
        <AdminSidebar />
      </div>

      {/* MAIN AREA */}
      <div className="ml-64 flex flex-col flex-1 h-full">

        {/* HEADER (optional fixed) */}
        <div className="h-16 bg-white shadow-md flex items-center z-10">
          <AdminHeader />
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>

      </div>

    </div>
  );
}
