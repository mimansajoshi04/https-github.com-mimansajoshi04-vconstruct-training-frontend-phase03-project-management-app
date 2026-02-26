import { useContext, type ReactNode } from "react";

// Contexts
import { UserContext } from "../../context/contexts/UserContext";
import type { UserContextType } from "../../context/contexts/UserContext";

import { useAuthCheck } from "../../hooks";

export default function AdminDashboard(): ReactNode {
  useAuthCheck({
    redirectTo: "/login",
    when: "unauthenticated",
  });
  const { user }: UserContextType = useContext(UserContext);

  if (typeof user === "string") return <h3>Dashboard</h3>;

  return <h3>{user?.name}'s Dashboard</h3>;
}
