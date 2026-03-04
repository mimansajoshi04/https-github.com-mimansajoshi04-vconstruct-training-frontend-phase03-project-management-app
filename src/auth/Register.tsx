// External Libraries
import { useState, type ReactNode } from "react";

// MUI Components
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

// import icons
import AccountCircle from "@mui/icons-material/AccountCircle";
import EmailIcon from "@mui/icons-material/Email";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import PasswordIcon from "@mui/icons-material/Password";

// Custom Hooks
import { useAuthCheck } from "../hooks/useAuthCheck";

// Constants
import {
  ROUTE_PATHS,
  MIN_PASSWORD_LENGTH,
  MIN_NAME_LENGTH,
  VALIDATION_MESSAGES,
  ERROR_TITLES,
} from "../constants/app.constants";

// Database
import { createUser } from "../../database/model/user";
import schemaValues from "../../database/schema/schemaValues";

// Components
import ErrorModal from "../modals/ErrorModal";

// Types
import type { RegisterFormData } from "../types";

export default function Register(): ReactNode {
  useAuthCheck({
    when: "authenticated",
    redirectTo: ROUTE_PATHS.DASHBOARD,
  });

  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (event: any) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    const trimmedName = formData.name.trim();
    const trimmedPassword = formData.password.trim();
    const trimmedConfirmPassword = formData.confirmPassword.trim();

    if (trimmedName.length < MIN_NAME_LENGTH) {
      setErrorMessage(VALIDATION_MESSAGES.INVALID_NAME);
      return false;
    }

    if (trimmedPassword.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage(VALIDATION_MESSAGES.INVALID_PASSWORD_LENGTH);
      return false;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      setErrorMessage(VALIDATION_MESSAGES.PASSWORD_MISMATCH);
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const data = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role,
      password: formData.password.trim(),
    };

    try {
      await createUser(data);
      window.location.href = ROUTE_PATHS.LOGIN;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setErrorMessage(message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "background.default",
        px: 2,
      }}
    >
      <Typography variant="h5" sx={{ mb: 4, fontWeight: 600 }}>
        Register
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          width: "100%",
          maxWidth: 400,
          p: 4,
          borderRadius: 2,
          boxShadow: 3,
          bgcolor: "background.paper",
        }}
      >
        {errorMessage && (
          <ErrorModal
            messageTitle={ERROR_TITLES.REGISTRATION_FAILED}
            errorMessage={errorMessage}
            callFunction={() => setErrorMessage("")}
            openValue={true}
          />
        )}

        <Box sx={{ display: "flex", alignItems: "flex-end" }}>
          <AccountCircle sx={{ color: "action.active", mr: 1, my: 0.5 }} />
          <TextField
            id="name"
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            variant="standard"
            fullWidth
            required
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "flex-end" }}>
          <EmailIcon sx={{ color: "action.active", mr: 1, my: 0.5 }} />
          <TextField
            id="email"
            type="email"
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            variant="standard"
            fullWidth
            required
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "flex-end" }}>
          <SupervisorAccountIcon
            sx={{ color: "action.active", mr: 1, my: 0.5 }}
          />
          <FormControl variant="standard" fullWidth required>
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              displayEmpty
            >
              <MenuItem value={schemaValues.users.roles.developer}>
                Developer
              </MenuItem>
              <MenuItem value={schemaValues.users.roles.manager}>
                Manager
              </MenuItem>
              <MenuItem value={schemaValues.users.roles.tester}>
                Tester
              </MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: "flex", alignItems: "flex-end" }}>
          <PasswordIcon sx={{ color: "action.active", mr: 1, my: 0.5 }} />
          <TextField
            id="password"
            type="password"
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            variant="standard"
            fullWidth
            required
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "flex-end" }}>
          <PasswordIcon sx={{ color: "action.active", mr: 1, my: 0.5 }} />
          <TextField
            id="confirmPassword"
            type="password"
            label="Confirm Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            variant="standard"
            fullWidth
            required
          />
        </Box>

        <Button type="submit" variant="contained" size="large" sx={{ mt: 1 }}>
          Register
        </Button>

        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          <Link href={ROUTE_PATHS.LOGIN} underline="hover">
            Already have an account? Login here
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
