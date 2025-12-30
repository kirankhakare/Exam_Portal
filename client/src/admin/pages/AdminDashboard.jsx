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

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    let mounted = true;

    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API}/admin/dashboard-stats`);
        if (mounted) setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
    return () => (mounted = false);
  }, []);

  /* ================= LOADING ================= */
  if (!stats) {
    return (
      <AdminLayout>
        <div className="p-6 text-gray-500 text-base sm:text-lg">
          Loading dashboard...
        </div>
      </AdminLayout>
    );
  }

  /* ================= CHART DATA ================= */
  const barData = Object.entries(stats.scoreDistribution || {}).map(
    ([range, count]) => ({ range, count })
  );

  const pieData = [
    { name: "Students", value: stats.totalUsers || 0 },
    { name: "Exams", value: stats.totalExams || 0 },
    { name: "Submissions", value: stats.totalResults || 0 },
  ];

  return (
    <AdminLayout>
      <div className="space-y-10 px-2 sm:px-4 md:px-6 py-6 bg-[#f2f6fc] min-h-full">

        {/* ================= TITLE ================= */}
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#004AAD]">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            Overview of exams & student performance
          </p>
        </div>

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <StatCard title="Total Students" value={stats.totalUsers} />
          <StatCard title="Total Exams" value={stats.totalExams} />
          <StatCard title="Total Submissions" value={stats.totalResults} />
        </div>

        {/* ================= CHARTS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">

          {/* BAR CHART */}
          <div className="bg-white border border-gray-200 shadow p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">
              Score Distribution
            </h2>

            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="range" fontSize={12} />
                  <YAxis fontSize={12} />
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

          {/* PIE CHART */}
          <div className="bg-white border border-gray-200 shadow p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">
              Exam Summary
            </h2>

            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
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

        {/* ================= TOP STUDENTS ================= */}
        <div className="bg-white border border-gray-200 shadow p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            Top 10 Students
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-[700px] w-full text-sm sm:text-base">
              <thead className="bg-[#e7edf7]">
                <tr>
                  <th className="p-3 text-left">Rank</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Score</th>
                  <th className="p-3 text-left">Exam</th>
                </tr>
              </thead>
              <tbody>
                {stats.topStudents.map((s, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-semibold">{i + 1}</td>
                    <td className="p-3">{s.studentId?.name}</td>
                    <td className="p-3">{s.studentId?.email}</td>
                    <td className="p-3 font-bold text-[#004AAD]">
                      {s.score}/{s.total}
                    </td>
                    <td className="p-3">{s.examId?.title}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= RECENT RESULTS ================= */}
        <div className="bg-white border border-gray-200 shadow p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            Recent Results
          </h2>

          <ul className="space-y-3">
            {stats.recentResults.map((r, i) => (
              <li
                key={i}
                className="
                  flex flex-col sm:flex-row
                  justify-between
                  gap-2
                  bg-[#f4f6fb]
                  px-4 py-3
                  border border-gray-200
                "
              >
                <div>
                  <p className="font-semibold">{r.studentId?.name}</p>
                  <p className="text-sm text-gray-600">{r.examId?.title}</p>
                </div>

                <p className="font-bold text-green-600 text-lg">
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
    <div className="bg-white border border-gray-200 shadow p-4 sm:p-6">
      <p className="text-gray-500 text-xs font-semibold uppercase">
        {title}
      </p>
      <p className="mt-2 text-2xl sm:text-3xl font-bold text-[#004AAD]">
        {value}
      </p>
    </div>
  );
}
