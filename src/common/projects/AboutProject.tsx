import {
  Card,
  CardContent,
  Typography,
  Divider,
  Chip,
  Stack,
  Avatar,
} from "@mui/material";

import type { ProjectType } from "../../../database/model/project";
import type { UserType } from "../../../database/model/user";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventIcon from "@mui/icons-material/Event";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { getInitials } from "../../../database/createAvatar";

import { useContext, type ReactNode } from "react";
import { AllUserContext } from "../../context/contexts/AppContext";

import { formatDate } from "../../utils/formatDate";

export default function AboutProject({
  project,
  isAssigned,
}: {
  project: ProjectType;
  isAssigned: boolean;
}): ReactNode {
  const { users }: { users: UserType[] | null } = useContext(AllUserContext);

  const isOverdue = new Date(project.deadline_date) < new Date();

  let createdBy: UserType[] | null =
    users?.filter((u) => u.id === project.created_by) ?? null;

  return (
    <Card sx={{ mt: 4, borderRadius: 3 }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Typography variant="h5">{project.name}</Typography>

            <Chip
              label={isOverdue ? "Overdue" : "Active"}
              color={isOverdue ? "error" : "success"}
            />
          </Stack>
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            {project.description}
          </Typography>
          <Divider />
          {createdBy && createdBy?.length > 0 && (
            <>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Created by
                </Typography>

                <Chip
                  size="small"
                  variant="outlined"
                  avatar={
                    <Avatar
                      sx={{
                        bgcolor: createdBy[0].avatar_color,
                        width: 24,
                        height: 24,
                        fontSize: 12,
                      }}
                    >
                      {getInitials(createdBy[0].name)}
                    </Avatar>
                  }
                  label={`${createdBy[0].name}${
                    createdBy[0].role ? ` • ${createdBy[0].role}` : ""
                  }`}
                  sx={{
                    fontWeight: 500,
                    height: 28,
                  }}
                />
              </Stack>

              <Divider />
            </>
          )}
          <Stack
            spacing={1}
            sx={{
              p: 1.5,
              borderRadius: 2,
            }}
          >
            <Stack direction="row" sx={{ justifyContent: "space-between" }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <AccessTimeIcon sx={{ fontSize: 16, color: "primary.main" }} />
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Start: {formatDate(project.start_date)}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <EventIcon sx={{ fontSize: 16, color: "error.main" }} />
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Deadline: {formatDate(project.deadline_date)}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarTodayIcon
                  sx={{ fontSize: 16, color: "text.secondary" }}
                />
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Created: {formatDate(project.created_at)}
                </Typography>
              </Stack>

              {isAssigned && project.assignedAt && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CalendarTodayIcon
                    sx={{ fontSize: 16, color: "text.secondary" }}
                  />
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>
                    Assigned: {formatDate(project.assignedAt)}
                  </Typography>
                </Stack>
              )}

              <Stack direction="row" spacing={1} alignItems="center">
                <AccessTimeIcon sx={{ fontSize: 16, color: "primary.main" }} />

                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Last Updated: {formatDate(project.updated_at)}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
