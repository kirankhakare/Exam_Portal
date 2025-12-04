import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../components/AdminLayout";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

export default function AdminDashboard() {
  const API = import.meta.env.VITE_API_URL;

  const [stats, setStats] = useState(null);
  const COLORS = ["#EF4444", "#F97316", "#EAB308", "#22C55E", "#3B82F6"];

  // ---------------- FETCH DASHBOARD DATA ----------------
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const res = await axios.get(`${API}/admin/dashboard-stats`);
        if (isMounted) setStats(res.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };

    fetchData();
    return () => (isMounted = false);
  }, []);

  // ---------------- LOADING STATE ----------------
  if (!stats) {
    return (
      <AdminLayout>
        <p className="p-6 text-gray-500 text-lg">Loading dashboard...</p>
      </AdminLayout>
    );
  }

  // ---------------- SAFE BAR CHART DATA ----------------
  const barData = Object.entries(stats?.scoreDistribution || {}).map(
    ([range, count]) => ({
      range,
      count,
    })
  );

  // ---------------- PIE CHART DATA ----------------
  const pieData = [
    { name: "Total Students", value: stats?.totalUsers || 0 },
    { name: "Total Exams", value: stats?.totalExams || 0 },
    { name: "Total Submissions", value: stats?.totalResults || 0 }
  ];

  return (
    <AdminLayout>
      <div className="p-10 space-y-10 bg-[#f2f6fc] min-h-screen">

        {/* =================== TITLE =================== */}
        <div>
          <h1 className="text-3xl font-bold text-[#004AAD] tracking-wide">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Complete overview of exam activity and student performance
          </p>
        </div>

        {/* =================== STATS CARDS =================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <StatCard title="Total Students" value={stats.totalUsers} />
          <StatCard title="Total Exams" value={stats.totalExams} />
          <StatCard title="Total Submissions" value={stats.totalResults} />
        </div>

        {/* =================== CHART SECTION =================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* ===== BAR CHART ===== */}
          <div className="bg-white border border-gray-300 shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Score Distribution
            </h2>

            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="range" fontSize={14} />
                  <YAxis fontSize={14} />
                  <Tooltip />
                  <Bar dataKey="count">
                    {barData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ===== PIE CHART ===== */}
          <div className="bg-white border border-gray-300 shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Exam Summary
            </h2>

            <div className="flex justify-center">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    dataKey="value"
                    label
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* =================== TOP STUDENTS TABLE =================== */}
        <div className="bg-white border border-gray-300 shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Top 10 Students
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-lg">
              <thead className="bg-[#e7edf7] border-b border-gray-300">
                <tr className="text-gray-900">
                  <th className="p-4 text-left font-semibold">Rank</th>
                  <th className="p-4 text-left font-semibold">Name</th>
                  <th className="p-4 text-left font-semibold">Email</th>
                  <th className="p-4 text-left font-semibold">Score</th>
                  <th className="p-4 text-left font-semibold">Exam</th>
                </tr>
              </thead>

              <tbody>
                {stats.topStudents.map((s, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-100 transition"
                  >
                    <td className="p-4 font-bold">{index + 1}</td>
                    <td className="p-4">{s.studentId?.name}</td>
                    <td className="p-4">{s.studentId?.email}</td>
                    <td className="p-4 font-bold text-[#004AAD]">
                      {s.score}/{s.total}
                    </td>
                    <td className="p-4">{s.examId?.title}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* =================== RECENT RESULTS =================== */}
        <div className="bg-white border border-gray-300 shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Recent Results
          </h2>

          <ul className="space-y-4">
            {stats.recentResults.map((r, i) => (
              <li
                key={i}
                className="bg-[#f4f6fb] px-6 py-4 border border-gray-300 flex justify-between items-center text-lg"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {r.studentId?.name}
                  </p>
                  <p className="text-gray-600 text-base">{r.examId?.title}</p>
                </div>

                <p className="font-bold text-green-600 text-xl">
                  {r.score}/{r.total}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}


/* ================= STAT CARD ================= */

function StatCard({ title, value }) {
  return (
    <div className="bg-white border border-gray-300 shadow-lg p-8">
      <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">
        {title}
      </p>
      <p className="mt-3 text-4xl font-extrabold text-[#004AAD]">
        {value}
      </p>
    </div>
  );
}
