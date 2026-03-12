import { memo, useContext, useMemo, type ReactNode } from "react";

// Contexts
import { UserContext } from "../../context/contexts/UserContext";
import type { UserContextType } from "../../context/contexts/UserContext";

import { useAuthCheck } from "../../hooks";
import type { ProjectContextValue } from "../../types";
import type { UserContextValue } from "../../types";

import {
  AllProjectContext,
  AllUserContext,
} from "../../context/contexts/AppContext";
import type { UserType } from "../../../database/model/user";
import { Avatar, Box, Stack, Typography, useTheme } from "@mui/material";

import { PieChart } from "@mui/x-charts/PieChart";
import { USER_ROLES } from "../../constants/app.constants";
import { getInitials } from "../../../database/createAvatar";

const UserAnalytics = memo(function UserAnalytics({
  users,
}: {
  users: UserType[];
}) {
  const theme = useTheme();
  const { data, totalCount } = useMemo(() => {
    const userRoleAnalytics: Record<string, number> = {
      admin: 0,
      developer: 0,
      manager: 0,
      tester: 0,
    };

    users.forEach((user) => {
      const role = user?.role ?? USER_ROLES.ADMIN;
      userRoleAnalytics[role] += 1;
    });

    const dataArray = Object.entries(userRoleAnalytics).map(
      ([role, count]) => ({
        id: role,
        value: count,
        percentage: (count / users.length) * 100,
      }),
    );

    return { data: dataArray, totalCount: users.length };
  }, [users]);

  return (
    <Box
      sx={{
        width: "100%",
        height: { xs: 250, sm: 350, md: 400 },
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography>Division By Role</Typography>

      <Box sx={{ flex: 1 }}>
        <PieChart
          sx={{ width: "100%", height: "100%", arcLabelMinAngle: 15 }}
          series={[
            {
              innerRadius: "25%",
              outerRadius: "90%",
              data,
              arcLabel: (item) =>
                `${item.id} (${(item as any).percentage.toFixed(0)}%)`,
              valueFormatter: ({ value }) =>
                `${value} out of ${totalCount} (${((value / totalCount) * 100).toFixed(0)}%)`,
              highlightScope: { fade: "global", highlight: "item" },
              highlighted: { additionalRadius: 2 },
              cornerRadius: 3,
            },
          ]}
          hideLegend
        >
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fontSize: 20,
              fontWeight: 600,
              fill:
                theme.palette.mode === "dark"
                  ? theme.palette.text.primary
                  : theme.palette.grey[700],
            }}
          >
            {totalCount}
          </text>

          <text
            x="50%"
            y="55%"
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fontSize: 12, fill: "#888" }}
          >
            Users
          </text>
        </PieChart>
      </Box>
    </Box>
  );
});

export default function AdminDashboard(): ReactNode {
  useAuthCheck({
    redirectTo: "/login",
    when: "unauthenticated",
  });
  const { user }: UserContextType = useContext(UserContext);
  const { projects }: ProjectContextValue = useContext(AllProjectContext);
  const { users }: UserContextValue = useContext(AllUserContext);

  if (typeof user === "string") return <h3>Dashboard</h3>;

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
      <UserAnalytics users={users ? users : []} />
    </>
  );
}
