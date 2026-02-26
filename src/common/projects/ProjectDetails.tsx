import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { AllProjectContext } from "../../context/contexts/AppContext";
import { UserContext } from "../../context/contexts/UserContext";
import DBContext from "../../context/contexts/DBContext";
import { getUsersForProject } from "../../../database/model/assignment";

import { useAuthCheck } from "../../hooks";

import ProjectMembers from "./ProjectMembers";

import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Divider,
  Chip,
  Stack,
} from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import EditProjectFormDialog from "./EditProjectFormDialog";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventIcon from "@mui/icons-material/Event";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

export default function ProjectDetails() {
  useAuthCheck({
    redirectTo: "/login",
    when: "unauthenticated",
  });
  const navigate = useNavigate();
  const { id, type } = useParams();

  const { projects } = useContext(AllProjectContext);
  const { user } = useContext(UserContext);
  const db = useContext(DBContext);

  const [members, setMembers] = useState<any[]>([]);
  const [editProject, setEditProject] = useState(false);

  const isAdmin = user?.role === "admin";

  const projectId = Number(id);

  const project = useMemo(() => {
    if (!id || !projects) return null;

    switch (type) {
      case "admin": // putting null in else because it said to me: fallthrough case
        if (Array.isArray(projects)) {
          return isAdmin
            ? projects?.find((proj: any) => proj?.id === projectId)
            : null;
        } else {
          return null;
        }

      case "created":
        if (!Array.isArray(projects)) {
          return projects?.createdProjects?.find(
            (proj: any) => proj.id === projectId,
          );
        } else {
          return null;
        }

      case "assigned":
        if (!Array.isArray(projects)) {
          return projects?.assignedProjects?.find(
            (proj: any) => proj.id === projectId,
          );
        } else {
          return null;
        }

      default:
        return null;
    }
  }, [id, type, projects, isAdmin, projectId]);

  useEffect(() => {
    if (!project) {
      navigate("/dashboard/projects", { replace: true });
    }
  }, [project, navigate]);

  useEffect(() => {
    if (!project?.id) return;

    async function fetchMembers() {
      try {
        if (!db) return;
        const response = await getUsersForProject(db, project?.id ?? -1);
        setMembers(response || []);
      } catch (error) {
        console.error(error);
      }
    }

    fetchMembers();
  }, [project?.id, db]);

  if (!project) return null;

  const isOverdue = new Date(project.deadline_date) < new Date();
  let isAssigned = type === "assigned";

  return (
    <Box>
      {editProject && (
        <EditProjectFormDialog
          setEditProjectOpen={setEditProject}
          project={project}
          type={type}
        />
      )}
      <Stack direction="row" sx={{ justifyContent: "space-between" }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate("/dashboard/projects")}
        >
          See All Projects
        </Button>
        {!isAssigned && (
          <Button
            variant="outlined"
            startIcon={<EditRoundedIcon />}
            onClick={() => setEditProject(true)}
          >
            Edit Project
          </Button>
        )}
      </Stack>

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
            <Stack
              spacing={1}
              sx={{
                p: 1.5,
                borderRadius: 2,
              }}
            >
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <AccessTimeIcon
                    sx={{ fontSize: 16, color: "primary.main" }}
                  />
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>
                    Start: {new Date(project.start_date).toLocaleDateString()}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <EventIcon sx={{ fontSize: 16, color: "error.main" }} />
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>
                    Deadline:{" "}
                    {new Date(project.deadline_date).toLocaleDateString()}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <CalendarTodayIcon
                    sx={{ fontSize: 16, color: "text.secondary" }}
                  />
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>
                    Created: {new Date(project.created_at).toLocaleDateString()}
                  </Typography>
                </Stack>

                {isAssigned && project.assignedAt && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarTodayIcon
                      sx={{ fontSize: 16, color: "text.secondary" }}
                    />
                    <Typography variant="caption" sx={{ fontWeight: 500 }}>
                      Assigned:{" "}
                      {new Date(project.assignedAt).toLocaleDateString()}
                    </Typography>
                  </Stack>
                )}

                <Stack direction="row" spacing={1} alignItems="center">
                  <AccessTimeIcon
                    sx={{ fontSize: 16, color: "primary.main" }}
                  />

                  <Typography variant="caption" sx={{ fontWeight: 500 }}>
                    Last Updated:{" "}
                    {new Date(project.updated_at).toLocaleDateString()}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <ProjectMembers members={members} />
    </Box>
  );
}
