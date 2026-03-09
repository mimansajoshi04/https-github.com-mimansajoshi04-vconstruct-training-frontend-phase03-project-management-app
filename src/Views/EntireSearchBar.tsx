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
import { UserContext } from "../context/contexts/UserContext";
import { getInitials } from "../../database/createAvatar";

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
  const { user } = useContext(UserContext);

  return (
    <React.Fragment>
      <Dialog open={open}>
        <DialogTitle variant="overline">Search Found for "{query}"</DialogTitle>
        <DialogContent sx={{ width: 400 }}>
          {data.filteredProjects.length > 0 && (
            <Box>
              <Stack direction="row" gap={2}>
                <FolderRoundedIcon />
                <Typography variant="body1">PROJECTS</Typography>
              </Stack>
              {data.filteredProjects.map((p: ProjectType) => {
                let type =
                  user?.role === "admin"
                    ? "admin"
                    : user?.id === p.created_by
                      ? "created"
                      : "assigned";
                return (
                  <Box
                    key={`project-${type}-${p?.id}`}
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
            <Box sx={{ mt: 2 }}>
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
