// External Libraries
import { useContext, useMemo, useState, type ReactNode } from "react";

import { PROJECT_STATUS } from "../constants/app.constants";

// mui imports
import {
  Box,
  Stack,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
} from "@mui/material";

// mui icons
import SearchIcon from "@mui/icons-material/Search";
import { AllProjectContext } from "../context/contexts/AppContext";

// components
import NewProjectFormDialog from "../common/projects/NewProjectFormDialog";
import ProjectCardsView from "../common/projects/ProjectCards";

// Types
import { type ProjectType } from "../../database/model/project";
import { useAuthCheck } from "../hooks";
export default function UserProjects(): ReactNode {
  useAuthCheck({
    when: "unauthenticated",
    redirectTo: "/login",
  });

  const { projects, setProjects } = useContext(AllProjectContext);

  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [addProjectOpen, setAddProjectOpen] = useState(false);

  const filteredCreatedProjects = useMemo(() => {
    if (!projects || (!Array.isArray(projects) && !projects.createdProjects))
      return [];

    if (Array.isArray(projects)) return [];

    return projects.createdProjects.filter((project: ProjectType) => {
      const isOverdue =
        new Date(project.deadline_date) < new Date()
          ? PROJECT_STATUS.OVERDUE
          : PROJECT_STATUS.ACTIVE;

      const matchesQuery = project.name
        .toLowerCase()
        .includes(query.toLowerCase());

      const matchesStatus =
        selectedStatus === "" ||
        selectedStatus === "all" ||
        isOverdue === selectedStatus;

      return matchesQuery && matchesStatus;
    });
  }, [projects, selectedStatus, query]);

  const filteredAssignedProjects = useMemo(() => {
    if (!projects || (!Array.isArray(projects) && !projects.assignedProjects))
      return [];

    if (Array.isArray(projects)) return [];

    return projects.assignedProjects.filter((project: ProjectType) => {
      const isOverdue =
        new Date(project.deadline_date) < new Date()
          ? PROJECT_STATUS.OVERDUE
          : PROJECT_STATUS.ACTIVE;

      const matchesQuery = project.name
        .toLowerCase()
        .includes(query.toLowerCase());

      const matchesStatus =
        selectedStatus === "" ||
        selectedStatus === "all" ||
        isOverdue === selectedStatus;

      return matchesQuery && matchesStatus;
    });
  }, [projects, selectedStatus, query]);

  const handleChange = (event: any) => {
    setQuery(event.target.value);
  };

  const resetFilters = () => {
    setQuery("");
    setSelectedStatus("");
  };

  return (
    <Box>
      {addProjectOpen && (
        <NewProjectFormDialog
          setAddProjectOpen={setAddProjectOpen}
          setProjects={setProjects}
        />
      )}
      

      <Typography variant="h6" sx={{ m: 2 }}>
        Project Details
      </Typography>

      <Stack
        direction="row-reverse"
        spacing={2}
        alignItems="center"
        sx={{ marginBottom: "0.5rem" }}
      >
        <Button variant="contained" onClick={() => setAddProjectOpen(true)}>
          Add New Project
        </Button>

        <Button variant="outlined" onClick={() => resetFilters()}>
          Reset Filters
        </Button>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="status-select-label">Status</InputLabel>
          <Select
            labelId="status-select-label"
            value={selectedStatus}
            label="Status"
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value={PROJECT_STATUS.ACTIVE}>Active</MenuItem>
            <MenuItem value={PROJECT_STATUS.OVERDUE}>Overdue</MenuItem>
          </Select>
        </FormControl>

        <TextField
          value={query}
          onChange={handleChange}
          placeholder="Search projects..."
          variant="outlined"
          size="small"
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Stack>
      <Stack direction="column" sx={{ gap: "0.5rem" }}>
        <ProjectCardsView
          projects={filteredCreatedProjects}
          title="Created By You"
        />
        <ProjectCardsView
          projects={filteredAssignedProjects}
          title="Assigned to You"
        />
      </Stack>
    </Box>
  );
}
