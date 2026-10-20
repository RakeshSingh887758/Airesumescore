import { Navigate, Route, Routes } from "react-router-dom";

import Sidebar from "./component/Sidebar/Sidebar";
import Dashboard from "./component/pages/Dashboard/Dashboard";
import History from "./component/pages/History/History";
import Admin from "./component/pages/Admin/Admin";

import { useAuth } from "./context/AuthContext";
import {
  GuestRoute,
  ProtectedRoute,
} from "./routes/AuthRoutes";
import LoginPage from "./component/Login/Login";
import RegisterPage from "./component/Register/Register";
import ForgotPasswordPage from "./component/ForgotPassword/ForgotPassword";
import ResetPasswordPage from "./component/ResetPassword/ResetPassword";

function App() {
  const { token, loading } = useAuth();

  if (loading) {
    return <p className="auth-loading">Checking your session...</p>;
  }

  return (
    <div className="App">
      {token && <Sidebar />}

      <Routes>
        {/* Public routes: only accessible when logged out */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/forgot-password"
            element={<ForgotPasswordPage />}
          />
          <Route
            path="/reset-password"
            element={<ResetPasswordPage />}
          />
        </Route>

        {/* Private routes: only accessible when logged in */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/admin" element={<Admin />} />
        </Route>

        {/* Default and unknown routes */}
        <Route
          path="/"
          element={
            <Navigate
              to={token ? "/dashboard" : "/login"}
              replace
            />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to={token ? "/dashboard" : "/login"}
              replace
            />
          }
        />
      </Routes>
    </div>
  );
}

export default App;