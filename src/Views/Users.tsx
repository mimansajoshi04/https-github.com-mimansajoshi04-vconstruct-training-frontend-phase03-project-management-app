// External Libraries
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
  Typography,
} from "@mui/material";

// mui icons
import SearchIcon from "@mui/icons-material/Search";
import { AllUserContext } from "../context/contexts/AppContext";

// Components
import UserCards from "../admin/components/users/UserCards";
import NewUserFormDialog from "../admin/components/users/NewUserFormDialog";

// Types
import type { UserType } from "../../database/model/user";

// constants
import { USER_ROLES } from "../constants/app.constants";

import { useAuthCheck } from "../hooks/index";

export default function Users(): ReactNode {
  useAuthCheck({
    redirectTo: "/login",
    when: "unauthenticated",
  });

  const { users, setUsers } = useContext(AllUserContext);

  const [query, setQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const [addUserOpen, setAddUserOpen] = useState(false);

  const filteredUsers = useMemo(() => {
    if (!users) return [];

    return users.filter((user: UserType) => {
      const matchesQuery =
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase());

      const matchesRole =
        selectedRole === "" ||
        selectedRole === "all" ||
        user.role === selectedRole;

      return matchesQuery && matchesRole;
    });
  }, [users, query, selectedRole]);

  const handleChange = (event: any) => {
    setQuery(event.target.value);
  };

  const resetFilters = () => {
    setQuery("");
    setSelectedRole("");
  };

  return (
    <Box>
      {addUserOpen && (
        <NewUserFormDialog
          setAddUserOpen={setAddUserOpen}
          setUsers={setUsers}
        />
      )}

      <Typography variant="h6" sx={{ m: 2 }}>
        User Details
      </Typography>

      <Stack direction="row-reverse" spacing={2} alignItems="center">
        <Button variant="contained" onClick={() => setAddUserOpen(true)}>
          Add New User
        </Button>

        <Button variant="outlined" onClick={() => resetFilters()}>
          Reset Filters
        </Button>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="role-select-label">Role</InputLabel>
          <Select
            labelId="role-select-label"
            value={selectedRole}
            label="Role"
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value={USER_ROLES.ADMIN}>Admin</MenuItem>
            <MenuItem value={USER_ROLES.MANAGER}>Manager</MenuItem>
            <MenuItem value={USER_ROLES.DEVELOPER}>Developer</MenuItem>
            <MenuItem value={USER_ROLES.TESTER}>Tester</MenuItem>
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

      <UserCards users={filteredUsers} />
    </Box>
  );
}
