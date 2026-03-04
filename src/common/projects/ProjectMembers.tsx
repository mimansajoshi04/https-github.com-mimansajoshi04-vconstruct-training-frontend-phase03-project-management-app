import { getInitials } from "../../../database/createAvatar";
// mui imports
import {
  Box,
  Button,
  Stack,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Typography,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";

import { useState, useContext } from "react";
import { useMemo } from "react";

import type { UserType } from "../../../database/model/user";
import {
  AllProjectContext,
  AllUserContext,
} from "../../context/contexts/AppContext";

import { useAuthCheck } from "../../hooks/index";

export default function ProjectMembers({
  members,
  projectId,
  showAssignMembers,
}: {
  members: UserType[];
  projectId: number;
  showAssignMembers: boolean;
}) {
  useAuthCheck({
    redirectTo: "/login",
    when: "unauthenticated",
  });

  if (projectId == -1) return <></>;

  const [query, setQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const { setProjects } = useContext(AllProjectContext);

  const [assignMembersOpen, setAssignMembersOpen] = useState(false);

  const filteredUsers = useMemo(() => {
    if (!members) return [];

    return members?.filter((user: any) => {
      const matchesQuery =
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase());

      const matchesRole =
        selectedRole === "" ||
        selectedRole === "all" ||
        user.role === selectedRole;

      return matchesQuery && matchesRole;
    });
  }, [members, query, selectedRole]);

  const handleChange = (event: any) => {
    const value = event.target.value;
    setQuery(value);
  };

  const getIds = (): number[] => {
    let res: number[] = [];
    if (members.length == 0) return res;
    return members.map((m) => m?.id ?? -2);
  };

  return (
    <Box sx={{ mt: 5 }}>
      {showAssignMembers && assignMembersOpen && (
        <AssignNewMembers
          setAssignMembersOpen={setAssignMembersOpen}
          memberIds={getIds()}
          projectId={projectId}
          setProjects={setProjects}
        />
      )}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Project Members
      </Typography>

      <Stack
        direction="row-reverse"
        spacing={2}
        alignItems="center"
        marginBottom="0.5rem"
      >
        {showAssignMembers && (
          <Button
            variant="contained"
            onClick={() => setAssignMembersOpen(true)}
          >
            Assign New Members
          </Button>
        )}

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="role-select-label">Role</InputLabel>
          <Select
            labelId="role-select-label"
            value={selectedRole}
            label="Role"
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="manager">Manager</MenuItem>
            <MenuItem value="developer">Developer</MenuItem>
            <MenuItem value="tester">Tester</MenuItem>
          </Select>
        </FormControl>

        <TextField
          value={query}
          onChange={handleChange}
          placeholder="Search users..."
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

      {filteredUsers.length === 0 ? (
        <Typography color="text.secondary">No members assigned</Typography>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: 3,
          }}
        >
          {filteredUsers.map((member: any) => (
            <Card
              key={member.id}
              sx={{
                borderRadius: 3,
                transition: "0.2s",
                "&:hover": {
                  boxShadow: 4,
                  transform: "translateY(-3px)",
                },
              }}
            >
              <CardContent>
                <Stack
                  direction="row-reverse"
                  sx={{ justifyContent: "space-between" }}
                >
                  <Avatar sx={{ backgroundColor: member.avatar_color }}>
                    {getInitials(member.name)}
                  </Avatar>
                  <Typography variant="h6">{member.name}</Typography>
                </Stack>

                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {member.email}
                </Typography>

                <Chip
                  label={member.role}
                  size="small"
                  sx={{ mt: 1 }}
                  color={member.role === "admin" ? "error" : "primary"}
                />
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}

import { MultipleSelectCheckmarks } from "./NewProjectFormDialog";

import DBContext from "../../context/contexts/DBContext";
import { createProjectUserRelation } from "../../../database/model/assignment";
import { getAllDataForAdminUser } from "../../admin/services/getData";
import { getAllDataForUser } from "../../user/services/getData";
import { UserContext } from "../../context/contexts/UserContext";

export function AssignNewMembers({
  setAssignMembersOpen,
  memberIds,
  projectId,
  setProjects,
}: {
  setAssignMembersOpen: Function;
  memberIds: number[];
  projectId: number;
  setProjects: Function;
}) {
  const db = useContext(DBContext);
  const { user } = useContext(UserContext);
  const { users } = useContext(AllUserContext);

  const [members, setMembers] = useState<number[]>(memberIds || []);
  const [errorMessage, setErrorMessage] = useState("");
  const [open, setOpen] = useState(true);

  // Filter to show only unassigned members
  const unassignedUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((user) => !memberIds.includes(user?.id ?? -1));
  }, [users, memberIds]);

  const handleClose = () => {
    setOpen(false);
    setAssignMembersOpen(false);
  };

  const handleChange = (value: number[]) => {
    setMembers(value);
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    try {
      if (!db) return;

      const date = new Date();

      const newMembers = members.filter((id) => !memberIds.includes(id));

      for (const memberId of newMembers) {
        await createProjectUserRelation(db, {
          projectId: Number(projectId),
          userId: Number(memberId),
          assignedAt: date,
        });
      }

      let data;
      if (user?.role !== "admin") {
        data = await getAllDataForUser(db, user?.id ?? -1);
      } else {
        data = await getAllDataForAdminUser(db);
      }

      setProjects(data.projectData || {});
      handleClose();
    } catch (error) {
      setErrorMessage("Failed to assign members.");
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Assign Members</DialogTitle>

      <DialogContent>
        {errorMessage && (
          <DialogContentText sx={{ color: "red" }}>
            {errorMessage}
          </DialogContentText>
        )}

        <form onSubmit={handleSubmit} id="assign-members-form">
          <MultipleSelectCheckmarks
            users={unassignedUsers}
            onChange={handleChange}
          />
        </form>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit" form="assign-members-form" variant="contained">
          Add Members
        </Button>
      </DialogActions>
    </Dialog>
  );
}
