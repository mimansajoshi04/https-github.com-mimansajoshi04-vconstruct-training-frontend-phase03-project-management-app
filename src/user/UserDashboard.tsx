// External Libraries
import { useContext, type ReactNode } from "react";

// Contexts
import { UserContext } from "../context/contexts/UserContext";
import type { UserContextType } from "../context/contexts/UserContext";

import {useAuthCheck} from "../hooks/index"

import KanbanBoard from "../common/story/KanbanBoard";

export default function UserDashboard(): ReactNode {
  useAuthCheck({
    redirectTo: "/login",
    when: "unauthenticated",
  });

  const { user }: UserContextType = useContext(UserContext);

  return (
    <>
      <h3>Welcome {user?.name}</h3>
      <p>Role: {user?.role}</p>

      <KanbanBoard/>
    </>
  );
}
