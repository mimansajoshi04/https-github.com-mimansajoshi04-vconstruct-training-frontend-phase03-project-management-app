// External Libraries
import { memo, useContext, type ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";

// MUI Components
import {
  Box,
  CardActions,
  Divider,
  Stack,
  Button,
  Chip,
  Card,
  CardContent,
  Typography,
} from "@mui/material";

// MUI Icons
import EditRoundedIcon from "@mui/icons-material/EditRounded";

// Constants
import { PROJECT_STATUS, USER_ROLES } from "../../constants/app.constants";

// Contexts
import { UserContext } from "../../context/contexts/UserContext";
import type { ProjectType } from "../../../database/model/project";
import EditProjectFormDialog from "./EditProjectFormDialog";

interface ProjectCardsProps {
  projects: ProjectType[];
  title: string;
}

import { useAuthCheck } from "../../hooks";

const ProjectCards = memo(function ProjectCardsComponent({
  projects,
  title,
}: ProjectCardsProps): ReactNode {
  useAuthCheck({
    redirectTo: "/login",
    when: "unauthenticated",
  });

  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const isAdmin = user?.role === USER_ROLES.ADMIN;

  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(
    null,
  );
  const [openEditForm, setOpenEditForm] = useState(false);

  const handleOpenEditForm = (project: ProjectType | null) => {
    setSelectedProject(project);
    setOpenEditForm(!!project);
  };

  const handleCloseEditForm = () => {
    setOpenEditForm(false);
    setSelectedProject(null);
  };

  const isProjectOverdue = (project: ProjectType): boolean => {
    return new Date(project.deadline_date) < new Date();
  };

  const isProjectAssigned = (project: ProjectType): boolean => {
    return "assignedAt" in project;
  };

  const handleViewProject = (project: ProjectType) => {
    if (isAdmin) {
      navigate(`/dashboard/projects/admin/${project.id}`);
    } else if (isProjectAssigned(project)) {
      navigate(`/dashboard/projects/assigned/${project.id}`);
    } else {
      navigate(`/dashboard/projects/created/${project.id}`);
    }
  };

  if (!projects || projects.length === 0) {
    return (
      <Stack direction="column" sx={{ gap: "0.3rem", marginTop: "0.5rem" }}>
        <Typography sx={{ color: "text.primary" }} variant="h6">{title}</Typography>
        <Divider />
        <Box>
          <Typography sx={{ color: "text.secondary" }}>
            No projects found
          </Typography>
        </Box>
      </Stack>
    );
  }

  return (
    <Box>
      {openEditForm && selectedProject && (
        <EditProjectFormDialog
          setEditProjectOpen={handleCloseEditForm}
          project={selectedProject}
          type={isAdmin ? "admin" : "created"}
        />
      )}

      <Stack direction="column" sx={{ gap: "0.8rem", mt: 1 }}>
        <Typography sx={{ color: "text.primary" }} variant="h6">
          {title}
        </Typography>

        <Divider />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 3,
            width: "100%",
            mt: 2,
          }}
        >
          {projects.map((project: ProjectType) => {
            const overdue = isProjectOverdue(project);
            const assigned = isProjectAssigned(project);

            return (
              <Card
                key={project.id}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "0.2s",
                  borderRadius: 3,
                  "&:hover": {
                    boxShadow: 6,
                    transform: "translateY(-4px)",
                  },
                }}
              >
                <CardContent>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <Typography
                        variant="h6"
                        sx={{
                          flex: 1,
                          wordBreak: "break-word",
                        }}
                      >
                        {project.name}
                      </Typography>

                      <Chip
                        label={
                          overdue
                            ? PROJECT_STATUS.OVERDUE
                            : PROJECT_STATUS.ACTIVE
                        }
                        color={overdue ? "error" : "success"}
                        size="small"
                        sx={{ flexShrink: 0, mt: "4px" }}
                      />
                    </Stack>

                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      {project.description}
                    </Typography>

                    <Divider />

                    <Typography variant="caption">
                      Start: {new Date(project.start_date).toLocaleDateString()}
                    </Typography>

                    <Typography variant="caption">
                      Deadline:{" "}
                      {new Date(project.deadline_date).toLocaleDateString()}
                    </Typography>

                    {assigned && project.assignedAt && (
                      <Typography variant="caption">
                        Assigned:{" "}
                        {new Date(project.assignedAt).toLocaleDateString()}
                      </Typography>
                    )}

                    <Typography variant="caption">
                      Created:{" "}
                      {new Date(project.created_at).toLocaleDateString()}
                    </Typography>
                  </Stack>
                </CardContent>

                {/* Actions */}
                <CardActions
                  sx={{
                    justifyContent: "space-between",
                    px: 2,
                    pb: 2,
                  }}
                >
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleViewProject(project)}
                  >
                    View
                  </Button>

                  {(isAdmin || !assigned) && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditRoundedIcon />}
                      onClick={() => handleOpenEditForm(project)}
                    >
                      Edit
                    </Button>
                  )}
                </CardActions>
              </Card>
            );
          })}
        </Box>
      </Stack>
    </Box>
  );
});

export default ProjectCards;
