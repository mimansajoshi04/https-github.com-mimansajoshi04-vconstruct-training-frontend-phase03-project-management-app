import { getInitials } from "../../../database/createAvatar";
// mui imports
import {
  Box,
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
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";

import { useState } from "react";
import { useMemo } from "react";

import type { UserType } from "../../../database/model/user";

import {useAuthCheck} from "../../hooks/index"

export default function ProjectMembers({ members }: { members: UserType[] }) {
  useAuthCheck({
    redirectTo: "/login",
    when: "unauthenticated",
  });

  const [query, setQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

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

  return (
    <Box sx={{ mt: 5 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Project Members
      </Typography>

      <Stack
        direction="row-reverse"
        spacing={2}
        alignItems="center"
        marginBottom="0.5rem"
      >
        {/* <Button variant="contained" onClick={() => setAddUserOpen(true)}>
          Add New User
        </Button> */}

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
