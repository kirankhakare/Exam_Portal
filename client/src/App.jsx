import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.jsx";

// Common Pages
import Login from "./common/pages/Login.jsx";

// Admin Pages
import AdminDashboard from "./admin/pages/AdminDashboard.jsx";
import CreateUser from "./admin/pages/CreateUser.jsx";
import SetExam from "./admin/pages/SetExam.jsx";
import History from "./admin/pages/History.jsx";
import UsersList from "./admin/pages/UsersList.jsx";
import UploadQuestions from "./admin/pages/UploadQuestions.jsx";
import ViewQuestions from "./admin/pages/ViewQuestions.jsx";
import CreateExam from "./admin/pages/CreateExam.jsx";


// Student Pages
import StudentStartTest from "./student/pages/StudentStartTest.jsx";
import ExamPage from "./student/pages/ExamPage.jsx";
import StudentInstructions from "./student/pages/StudentInstructions.jsx";
import ThankYou from "./student/pages/ThankYou.jsx";

function App() {
  return (
    <Routes>

      {/* PUBLIC LOGIN */}
      <Route path="/" element={<Login />} />

      {/* ---------------------------- */}
      {/*        ADMIN ROUTES         */}
      {/* ---------------------------- */}

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/create-user"
        element={
          <ProtectedRoute allowedRole="admin">
            <CreateUser />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRole="admin">
            <UsersList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/upload-questions"
        element={
          <ProtectedRoute allowedRole="admin">
            <UploadQuestions />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/set-exam"
        element={
          <ProtectedRoute allowedRole="admin">
            <SetExam />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/history"
        element={
          <ProtectedRoute allowedRole="admin">
            <History />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/questions"
        element={
          <ProtectedRoute allowedRole="admin">
            <ViewQuestions />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/create-exam"
        element={
          <ProtectedRoute allowedRole="admin">
            <CreateExam />
          </ProtectedRoute>
        }
      />

      {/* ---------------------------- */}
      {/*       STUDENT ROUTES        */}
      {/* ---------------------------- */}

      <Route
        path="/student/start-test"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentStartTest />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/exam"
        element={
          <ProtectedRoute allowedRole="student">
            <ExamPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/instructions"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentInstructions />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/thank-you"
        element={
          <ProtectedRoute allowedRole="student">
            <ThankYou />
          </ProtectedRoute>
        }
      />


    </Routes>
  );
}

export default App;
