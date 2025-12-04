import axios from "axios";
import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState(null);
  const API = import.meta.env.VITE_API_URL;
  // For Reassign Exam
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedExam, setSelectedExam] = useState("");
  const [exams, setExams] = useState([]);

  const handleReassign = (user) => {
    setSelectedUser(user);
    setShowReassignModal(true);
  };

  // Load Exams
  useEffect(() => {
    loadExams();
  }, []);

const loadExams = async () => {
  try {
    const response = await axios.get(`${API}/admin/exams`);

    console.log("EXAMS RESPONSE:", response.data);

    if (Array.isArray(response.data)) {
      setExams(response.data);
    } else {
      setExams([]);
    }
  } catch (err) {
    console.log("Error loading exams", err);
    setExams([]);
  }
};

  // Reassign Exam Submit
  const submitReassign = async () => {
    if (!selectedExam) return alert("Please select an exam.");

    try {
      await axios.put(`${API}/admin/reassign-exam/${selectedUser._id}`, {
        assignedExam: selectedExam,
      });

      alert("Exam reassigned successfully!");
      setShowReassignModal(false);
      fetchUsers();
    } catch (err) {
      console.log(err);
      alert("Failed to reassign exam.");
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/admin/users`);
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Toggle Active/Inactive
  const handleToggle = async (id) => {
    try {
      setUsers((prev) =>
        prev.map((u) =>
          u._id === id ? { ...u, isActive: !u.isActive } : u
        )
      );

      await axios.patch(`${API}/admin/toggle-user/${id}`);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user", error);
      fetchUsers();
      alert("Failed to update user status.");
    }
  };

  // Delete User
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`${API}/admin/user/${id}`);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user", error);
    }
  };

  // UPDATE USER
  const handleUpdate = async () => {
    try {
      await axios.put(
        `${API}/admin/user/${editUser._id}`,
        {
          name: editUser.name,
          email: editUser.email,
          phone: editUser.phone,
        }
      );

      setEditUser(null);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user", error);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <p className="text-center text-lg font-medium text-gray-600 mt-10">
          Loading users...
        </p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Registered Users</h1>

      <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-200 overflow-hidden">

        <table className="w-full border-separate border-spacing-y-2">
          <thead>
            <tr className="bg-blue-50 text-gray-700 font-semibold">
              <th className="p-3 rounded-l-xl">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Status</th>
              <th className="p-3 rounded-r-xl">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-4 text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user._id}
                  className="bg-gray-50 hover:bg-gray-100 transition rounded-xl shadow-sm"
                >
                  <td className="p-3 font-medium">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.phone || "---"}</td>

                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        user.isActive
                          ? "bg-green-100 text-green-700 border border-green-200"
                          : "bg-red-100 text-red-700 border border-red-200"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="p-3 flex justify-center gap-2">

                    {/* REASSIGN EXAM */}
                    <button 
                      className="px-4 py-2 bg-purple-600 text-white rounded-md"
                      onClick={() => handleReassign(user)}
                    >
                      Reassign
                    </button>

                    {/* EDIT BUTTON */}
                    <button
                      onClick={() => setEditUser(user)}
                      className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-sm transition"
                    >
                      Edit
                    </button>

                    {/* DELETE BUTTON */}
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-sm transition"
                    >
                      Delete
                    </button>

                    {/* TOGGLE STATUS */}
                    <button
                      onClick={() => handleToggle(user._id)}
                      className={`px-4 py-1.5 rounded-lg text-white shadow-sm transition ${
                        user.isActive
                          ? "bg-yellow-600 hover:bg-yellow-700"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {user.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* EDIT USER MODAL */}
      {editUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur flex justify-center items-center p-4">
          <div className="bg-white w-96 p-6 rounded-2xl shadow-xl border border-gray-200">

            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Edit User
            </h2>

            <input
              type="text"
              className="w-full border p-3 mb-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
              value={editUser.name}
              onChange={(e) =>
                setEditUser({ ...editUser, name: e.target.value })
              }
            />

            <input
              type="email"
              className="w-full border p-3 mb-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
              value={editUser.email}
              onChange={(e) =>
                setEditUser({ ...editUser, email: e.target.value })
              }
            />

            <input
              type="text"
              className="w-full border p-3 mb-4 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
              value={editUser.phone || ""}
              onChange={(e) =>
                setEditUser({ ...editUser, phone: e.target.value })
              }
            />

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg"
                onClick={() => setEditUser(null)}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                onClick={handleUpdate}
              >
                Save
              </button>
            </div>

          </div>
        </div>
      )}

      {/* REASSIGN EXAM MODAL */}
      {showReassignModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur flex justify-center items-center p-4">
          <div className="bg-white w-96 p-6 rounded-2xl shadow-xl border border-gray-200">

            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Reassign Exam
            </h2>

            <select
              className="w-full border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-500 mb-4"
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
            >
              <option value="">Select Exam</option>
              {exams.map((exam) => (
                <option key={exam._id} value={exam._id}>
                  {exam.title}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg"
                onClick={() => setShowReassignModal(false)}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                onClick={submitReassign}
              >
                Save
              </button>
            </div>

          </div>
        </div>
      )}

    </AdminLayout>
  );
}
