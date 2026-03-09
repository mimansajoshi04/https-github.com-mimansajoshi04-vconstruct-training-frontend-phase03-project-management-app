import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { AllProjectContext } from "../../context/contexts/AppContext";
import { UserContext } from "../../context/contexts/UserContext";
import { getUsersForProject } from "../../../database/model/assignment";

import { useAuthCheck } from "../../hooks";

import ProjectMembers from "./ProjectMembers";
import StorySummary from "./StorySummary";
import AboutProject from "./AboutProject";

import { Box, Button, Stack } from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import EditProjectFormDialog from "./EditProjectFormDialog";

export default function ProjectDetails() {
  useAuthCheck({
    redirectTo: "/login",
    when: "unauthenticated",
  });

  const navigate = useNavigate();
  const { id, type } = useParams();

  const { projects } = useContext(AllProjectContext);
  const { user } = useContext(UserContext);

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
      navigate("/dashboard/projects/all", { replace: true });
    }
  }, [project, navigate]);

  useEffect(() => {
    if (!project?.id) return;

    async function fetchMembers() {
      try {
        const response = await getUsersForProject(project?.id ?? -1);
        setMembers(response || []);
      } catch (error) {
        console.error(error);
      }
    }

    fetchMembers();
  }, [projects, project?.id]);

  if (!project) return null;

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
          onClick={() => navigate("/dashboard/projects/all")}
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

      <AboutProject project={project} isAssigned={isAssigned} />

      <StorySummary projectId={projectId} type={type ?? ""} />

      <ProjectMembers
        members={members}
        projectId={project?.id ?? -1}
        showAssignMembers={!isAssigned || isAdmin}
      />
    </Box>
  );
}
