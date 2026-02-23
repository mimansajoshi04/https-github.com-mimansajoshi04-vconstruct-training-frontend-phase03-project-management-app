import { useContext } from "react";
import UserContext from "../contexts/UserContext";
import type { UserContextType } from "../contexts/UserContext";

import UserDashboard from "../user/UserDashboard";
import AdminDashboard from "../admin/AdminDashboard";
import { Button } from "@mui/material";

import { useNavigate } from "react-router-dom";

export default function DashBoard() {
  const { user, setUser }: UserContextType = useContext(UserContext);

  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/dashboard");
  };

  return (
    <>
      {user?.role === "user" ? <UserDashboard /> : <AdminDashboard />}
      <Button onClick={logout}>Logout</Button>
    </>
  );
}
