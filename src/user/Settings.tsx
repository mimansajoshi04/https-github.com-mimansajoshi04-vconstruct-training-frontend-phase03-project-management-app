import {
  Box,
  FormControl,
  Button,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import { MuiColorInput } from "mui-color-input";

import { useState, type ReactNode } from "react";
import { useUserHook } from "../hooks";
import { USER_ROLES } from "../constants/app.constants";
import { updateUserById } from "../../database/model/user";

export default function Settings(): ReactNode {
  const { user, setUser } = useUserHook();

  const [userData, setUserData] = useState({
    name: user?.name,
    role: user?.role,
    avatar_color: user?.avatar_color,
  });

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleEdit = async () => {
    let name = userData.name?.trim() ?? user?.name;
    if (!name || name?.length == 0) {
      setMessage("Invalid name");
      setSuccess(false);
      return;
    }

    try {
      const response = await updateUserById(user?.id ?? -1, {
        name: userData.name,
        role: userData.role,
        avatar_color: userData.avatar_color,
      });
      if (typeof response === "string") {
        setMessage(response);
        setSuccess(false);
        return;
      }
      setMessage("Edited user details successfully!");
      setSuccess(true);
      setUser(response);
    } catch (error: any) {
      //handle error
      // setMessage(error instanceof Error ? error.message : error);
      setSuccess(false);
    }
  };

  const handleChange = (event: any) => {
    setUserData({
      ...userData,
      [event.target.name]: event.target.value,
    });
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 550 }}>
        Settings
      </Typography>
      <Box width={"75%"}>
        <Box sx={{ mt: 2, display: "flex", justifyContent: "left", gap: 3 }}>
          <TextField
            value={userData.name}
            onChange={(event) => handleChange(event)}
            label="Name"
            name="name"
            fullWidth
          />
          {user?.role !== USER_ROLES.ADMIN && (
            <FormControl fullWidth>
              <InputLabel id="role-label">Role</InputLabel>

              <Select
                labelId="role-label"
                label="Role"
                name="role"
                value={userData.role}
                onChange={(event) => handleChange(event)}
                displayEmpty
              >
                <MenuItem value={USER_ROLES.DEVELOPER}>Developer</MenuItem>
                <MenuItem value={USER_ROLES.MANAGER}>Manager</MenuItem>
                <MenuItem value={USER_ROLES.TESTER}>Tester</MenuItem>
              </Select>
            </FormControl>
          )}
        </Box>

        <MuiColorInput
          format="hex"
          value={userData?.avatar_color ?? ""}
          name="avatar_color"
          label="Avatar Color"
          sx={{ mt: 3 }}
          onChange={(val) =>
            handleChange({ target: { name: "avatar_color", value: val } })
          }
        />

        {message && (
          <Typography color={success ? "success" : "error"} sx={{ mt: 2 }}>
            {message}
          </Typography>
        )}

        <Box sx={{ display: "flex", mt: 2, gap: 3 }}>
          <Button variant="outlined" onClick={() => handleEdit()}>
            Edit
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setUserData({
                name: user?.name,
                role: user?.role,
                avatar_color: user?.avatar_color,
              });
              setMessage("");
            }}
            color="error"
          >
            Reset
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
