// import functions from database
import { useContext, useMemo, useState, type ReactNode } from "react";

// MUI Components
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
} from "@mui/material";

// MUI Icons
import SearchIcon from "@mui/icons-material/Search";

// Constants
import { PROJECT_STATUS } from "../../../constants/app.constants";

// Contexts
import { AllProjectContext } from "../../../context/contexts/AppContext";

// Components
import NewProjectFormDialog from "../../../common/projects/NewProjectFormDialog";
import ProjectCards from "../../../common/projects/ProjectCards";
import type { ProjectType } from "../../../../database/model/project"

import { useAuthCheck } from "../../../hooks";

export default function AdminProjects(): ReactNode {
  useAuthCheck({
    redirectTo: "/login",
    when: "unauthenticated",
  });
  const { projects, setProjects } = useContext(AllProjectContext);

  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [addProjectOpen, setAddProjectOpen] = useState(false);

  const filteredProjects = useMemo(() => {
    if (!projects || !Array.isArray(projects)) return [];

    const projectArray = Array.isArray(projects) ? projects : [];

    return projectArray.filter((project: ProjectType) => {
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
    const value = event.target.value;
    setQuery(value);
  };

  return (
    <Box>
      {addProjectOpen && (
        <NewProjectFormDialog
          setAddProjectOpen={setAddProjectOpen}
          setProjects={setProjects}
        />
      )}

      <Stack
        direction="row-reverse"
        spacing={2}
        alignItems="center"
        sx={{ marginBottom: "0.5rem" }}
      >
        <Button variant="contained" onClick={() => setAddProjectOpen(true)}>
          Add New Project
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

      <ProjectCards projects={filteredProjects} title="All Projects" />
    </Box>
  );
}
