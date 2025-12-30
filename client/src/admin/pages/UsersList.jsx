import axios from "axios";
import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";

export default function UsersList() {
  const API = import.meta.env.VITE_API_URL;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editUser, setEditUser] = useState(null);

  // Reassign exam
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedExam, setSelectedExam] = useState("");
  const [exams, setExams] = useState([]);

  /* ================= FETCH USERS ================= */
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/admin/users`);
      setUsers(res.data);
    } catch (err) {
      console.error("Fetch users error", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH EXAMS ================= */
  const loadExams = async () => {
    try {
      const res = await axios.get(`${API}/admin/exams`);
      setExams(Array.isArray(res.data) ? res.data : []);
    } catch {
      setExams([]);
    }
  };

  useEffect(() => {
    fetchUsers();
    loadExams();
  }, []);

  /* ================= TOGGLE ACTIVE ================= */
  const handleToggle = async (id) => {
    try {
      setUsers((prev) =>
        prev.map((u) =>
          u._id === id ? { ...u, isActive: !u.isActive } : u
        )
      );

      await axios.patch(`${API}/admin/toggle-user/${id}`);
      fetchUsers();
    } catch {
      fetchUsers();
      alert("Failed to update user status");
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await axios.delete(`${API}/admin/user/${id}`);
      fetchUsers();
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  /* ================= UPDATE USER ================= */
  const handleUpdate = async () => {
    try {
      await axios.put(`${API}/admin/user/${editUser._id}`, {
        name: editUser.name,
        email: editUser.email,
        phone: editUser.phone,
      });

      setEditUser(null);
      fetchUsers();
    } catch (err) {
      console.error("Update error", err);
    }
  };

  /* ================= REASSIGN EXAM ================= */
  const handleReassign = (user) => {
    setSelectedUser(user);
    setSelectedExam("");
    setShowReassignModal(true);
  };

  const submitReassign = async () => {
    if (!selectedExam) return alert("Select an exam");

    try {
      await axios.put(`${API}/admin/reassign-exam/${selectedUser._id}`, {
        assignedExam: selectedExam,
      });

      alert("Exam reassigned successfully!");
      setShowReassignModal(false);
      fetchUsers();
    } catch {
      alert("Failed to reassign exam");
    }
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 text-center text-gray-600">
          Loading users...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 px-2 sm:px-4 md:px-6 py-6 bg-[#f2f6fc] min-h-full">

        {/* ================= TITLE ================= */}
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#004AAD]">
            Registered Users
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1">
            Manage students, exams, and account status
          </p>
        </div>

        {/* ================= TABLE ================= */}
        <div className="bg-white border border-gray-200 shadow overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm sm:text-base">
            <thead className="bg-blue-50 border-b">
              <tr className="text-left">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{user.name}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.phone || "—"}</td>

                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="p-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleReassign(user)}
                        className="px-3 py-1 bg-purple-600 text-white rounded"
                      >
                        Reassign
                      </button>

                      <button
                        onClick={() => setEditUser(user)}
                        className="px-3 py-1 bg-blue-600 text-white rounded"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(user._id)}
                        className="px-3 py-1 bg-red-600 text-white rounded"
                      >
                        Delete
                      </button>

                      <button
                        onClick={() => handleToggle(user._id)}
                        className={`px-3 py-1 text-white rounded ${
                          user.isActive
                            ? "bg-yellow-600"
                            : "bg-green-600"
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
      </div>

      {/* ================= EDIT USER MODAL ================= */}
      {editUser && (
        <Modal onClose={() => setEditUser(null)} title="Edit User">
          <Input
            value={editUser.name}
            onChange={(e) =>
              setEditUser({ ...editUser, name: e.target.value })
            }
          />
          <Input
            type="email"
            value={editUser.email}
            onChange={(e) =>
              setEditUser({ ...editUser, email: e.target.value })
            }
          />
          <Input
            value={editUser.phone || ""}
            onChange={(e) =>
              setEditUser({ ...editUser, phone: e.target.value })
            }
          />

          <ModalActions
            onCancel={() => setEditUser(null)}
            onSave={handleUpdate}
          />
        </Modal>
      )}

      {/* ================= REASSIGN MODAL ================= */}
      {showReassignModal && (
        <Modal onClose={() => setShowReassignModal(false)} title="Reassign Exam">
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50"
          >
            <option value="">Select Exam</option>
            {exams.map((e) => (
              <option key={e._id} value={e._id}>
                {e.title}
              </option>
            ))}
          </select>

          <ModalActions
            onCancel={() => setShowReassignModal(false)}
            onSave={submitReassign}
            saveLabel="Save"
          />
        </Modal>
      )}
    </AdminLayout>
  );
}

/* ================= REUSABLE UI ================= */

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-md rounded shadow-xl p-5">
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        <div className="space-y-3">{children}</div>
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function ModalActions({ onCancel, onSave, saveLabel = "Save" }) {
  return (
    <div className="flex justify-end gap-2 mt-4">
      <button
        onClick={onCancel}
        className="px-4 py-2 bg-gray-400 text-white rounded"
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        {saveLabel}
      </button>
    </div>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500"
    />
  );
}
