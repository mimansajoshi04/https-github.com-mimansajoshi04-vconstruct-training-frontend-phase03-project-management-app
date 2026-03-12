// External Libraries
import { useContext, type ReactNode } from "react";

// Contexts
import { UserContext } from "../context/contexts/UserContext";
import type { UserContextType } from "../context/contexts/UserContext";

import { useAuthCheck, useUserHook } from "../hooks/index";

import KanbanBoard from "../common/story/KanbanBoard";
import { Avatar, Stack, Typography } from "@mui/material";
import { getInitials } from "../../database/createAvatar";

export default function UserDashboard(): ReactNode {
  useAuthCheck({
    redirectTo: "/login",
    when: "unauthenticated",
  });

  const { user } = useUserHook();

  return (
    <>
      <Stack
        direction={"row"}
        sx={{ alignItems: "center", justifyContent: "space-between" }}
      >
        <Typography variant="h6" sx={{ fontWeight: 550 }}>
          {user?.name}'s Dashboard
        </Typography>
        <Avatar sx={{ backgroundColor: user?.avatar_color }}>
          {getInitials(user?.name ?? "")}
        </Avatar>
      </Stack>

      <KanbanBoard />
    </>
  );
}
