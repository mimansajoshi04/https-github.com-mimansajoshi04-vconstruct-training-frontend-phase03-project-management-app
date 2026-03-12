import React, { useContext, useState } from "react";
import {
  AllProjectContext,
  AllUserContext,
} from "../context/contexts/AppContext";

import type { ProjectType } from "../../database/model/project";
import type { UserType } from "../../database/model/user";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  InputBase,
  Stack,
  Typography,
  useTheme,
  Avatar,
} from "@mui/material";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

export default function EntireSearchBar() {
  const { users } = useContext(AllUserContext);
  const { projects } = useContext(AllProjectContext);
  const { user } = useUserHook();

  const theme = useTheme();

  const [query, setQuery] = useState("");
  const [data, setData] = useState<{
    filteredUsers: UserType[];
    filteredProjects: ProjectType[];
  }>({
    filteredUsers: [],
    filteredProjects: [],
  });
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);

  const showData = () => {
    let filteredUsers: UserType[] = [];
    let filteredProjects: ProjectType[] = [];
    if (users) {
      filteredUsers = users.filter((u) =>
        u.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
      );
    }

    if (projects) {
      if (Array.isArray(projects)) {
        filteredProjects = projects.filter((p) =>
          p.name.toLowerCase().includes(query.toLowerCase()),
        );
      } else {
        let filterCreatedProjects = projects.createdProjects.filter((p) =>
          p.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
        );

        let filterAssignedProjects = projects.assignedProjects.filter((p) =>
          p.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
        );

        filteredProjects = [
          ...filterCreatedProjects,
          ...filterAssignedProjects,
        ];
      }
    }

    return {
      filteredUsers: filteredUsers,
      filteredProjects: filteredProjects,
    };
  };

  const handleSearch = () => {
    if (query.length > 0) {
      let filteredData = showData();
      setData(filteredData);
      setSearchDialogOpen(true);
    }
  };

  return (
    <Box>
      {searchDialogOpen && (
        <SearchFoundDialog
          query={query}
          data={data}
          setSearchDialogOpen={setSearchDialogOpen}
        />
      )}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 1,
          m: 1,
          borderRadius: 1,
          border: `1px solid ${theme.palette.grey[300]}`,
        }}
      >
        <SearchRoundedIcon sx={{ mr: 1 }} />

        <InputBase
          placeholder="Search projects, users..."
          sx={{ flex: 1 }}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />
        <Button
          onClick={() => {
            handleSearch();
          }}
        >
          Search
        </Button>
      </Box>
      <Divider sx={{ mb: 3 }} />
    </Box>
  );
}

import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import { useNavigate } from "react-router-dom";
import { getInitials } from "../../database/createAvatar";
import { PROJECT_TYPES, USER_ROLES } from "../constants/app.constants";
import { useUserHook } from "../hooks";

function SearchFoundDialog({
  query,
  data,
  setSearchDialogOpen,
}: {
  query: string;
  data: {
    filteredUsers: UserType[];
    filteredProjects: ProjectType[];
  };
  setSearchDialogOpen: Function;
}) {
  const [open, setOpen] = useState(true);
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useUserHook();

  const [selected, setSelected] = useState(-1);
  let len = data.filteredProjects.length;

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      if (selected === -1) {
        setSearchDialogOpen(false);
        return;
      }
      event.preventDefault();
      const projectSelected = data.filteredProjects[selected];
      let type =
        user?.role === USER_ROLES.ADMIN
          ? PROJECT_TYPES.ADMIN
          : projectSelected.created_by === user?.id
            ? PROJECT_TYPES.CREATED
            : PROJECT_TYPES.ASSIGNED;
      setSearchDialogOpen(false);
      navigate(`/dashboard/projects/${type}/${projectSelected.id}`);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();

      if (selected == -1) {
        setSelected(0);
      } else {
        setSelected((prev) => (prev == 0 ? len - 1 : prev - 1));
      }
    } else if (event.key === "ArrowDown") {
      event.preventDefault();

      setSelected((prev) => (prev + 1) % len);
    }
  };

  return (
    <React.Fragment>
      <Dialog open={open} onKeyDown={(e) => handleKeyPress(e)}>
        <DialogTitle variant="overline">Search Found for "{query}"</DialogTitle>
        <DialogContent sx={{ width: "100%" }}>
          <Stack direction={"row"} gap={3}>
            {data.filteredProjects.length > 0 && (
              <Box>
                <Stack direction="row" gap={2}>
                  <FolderRoundedIcon />
                  <Typography variant="body1">PROJECTS</Typography>
                </Stack>
                {data.filteredProjects.map((p: ProjectType, index) => {
                  let type =
                    user?.role === USER_ROLES.ADMIN
                      ? PROJECT_TYPES.ADMIN
                      : user?.id === p.created_by
                        ? PROJECT_TYPES.CREATED
                        : PROJECT_TYPES.ASSIGNED;
                  return (
                    <Box
                      key={`project-${type}-${p?.id}`}
                      sx={{
                        border: `1px solid ${theme.palette.grey[300]}`,
                        borderRadius: 1,
                        padding: 1,
                        mt: 1,
                        mb: 1,
                        backgroundColor:
                          index === selected
                            ? theme.palette.primary.light
                            : "transparent",
                      }}
                    >
                      <Stack
                        direction={"row-reverse"}
                        sx={{ justifyContent: "space-between" }}
                      >
                        <VisibilityRoundedIcon
                          onClick={() => {
                            setSearchDialogOpen(false);
                            navigate(`/dashboard/projects/${type}/${p.id}`);
                          }}
                        />
                        <Typography>{p.name}</Typography>
                      </Stack>
                      <Typography variant="caption">{p.description}</Typography>
                    </Box>
                  );
                })}
              </Box>
            )}

            {data.filteredUsers.length > 0 && (
              <Box>
                <Stack direction="row" gap={2}>
                  <PeopleAltRoundedIcon />
                  <Typography variant="body1">USERS</Typography>
                </Stack>
                {data.filteredUsers.map((u: UserType) => {
                  return (
                    <Box
                      key={`user-${u?.id}`}
                      sx={{
                        border: `1px solid ${theme.palette.grey[300]}`,
                        borderRadius: 1,
                        padding: 1,
                        mt: 1,
                        mb: 1,
                      }}
                    >
                      <Stack
                        direction={"row-reverse"}
                        sx={{
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                        gap={3}
                      >
                        <Avatar sx={{ backgroundColor: u.avatar_color }}>
                          {getInitials(u.name)}
                        </Avatar>
                        <Typography>{u.name}</Typography>
                      </Stack>
                      <Typography variant="caption">{u.role}</Typography>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setOpen(false);
              setSearchDialogOpen(false);
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
