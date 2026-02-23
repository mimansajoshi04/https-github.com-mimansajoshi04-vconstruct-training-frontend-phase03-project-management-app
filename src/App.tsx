// CSS Files
import "./App.css";

// Contexts
import UserContext from "./contexts/UserContext.tsx";

// react imports
import { useContext, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

// import functions

// import types
import type { UserContextType } from "./contexts/UserContext.tsx";

import Login from "./auth/Login.tsx";
import Register from "./auth/Register.tsx";
import Dashboard from "./Views/DashBoard.tsx";

function App() {
  const { user, setUser }: UserContextType = useContext(UserContext);

  useEffect(() => {
    const userDetails = localStorage.getItem("user");
    if (userDetails) {
      setUser(JSON.parse(userDetails));
    }
  }, []);

  return (
    <Routes>
      <Route
        path="/dashboard"
        element={user ? <Dashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" /> : <Login />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/dashboard" /> : <Register />}
      />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
