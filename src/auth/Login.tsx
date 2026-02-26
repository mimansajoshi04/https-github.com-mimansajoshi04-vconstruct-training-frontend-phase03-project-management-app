// External Libraries
import { useContext, useState, useCallback, type ReactNode } from "react";

// MUI Components
import { TextField, Button, Box } from "@mui/material";

// import icons
import EmailIcon from "@mui/icons-material/Email";
import PasswordIcon from "@mui/icons-material/Password";

// Custom Hooks
import { useAuthCheck } from "../hooks/useAuthCheck";

// Constants
import {
  ROUTE_PATHS,
  STORAGE_KEYS,
  ERROR_TITLES,
} from "../constants/app.constants";

// Contexts
import { UserContext } from "../context/contexts/UserContext";
import type { UserContextType } from "../context/contexts/UserContext";

// Database
import { loginUser } from "../../database/model/user";

// Components
import ErrorModal from "../modals/ErrorModal";

// Types
import type { LoginFormData } from "../types";

export default function Login(): ReactNode {
  useAuthCheck({
    when: "authenticated",
    redirectTo: ROUTE_PATHS.DASHBOARD,
  });

  const { setUser }: UserContextType = useContext(UserContext);

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = useCallback((event: any) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (event: any) => {
      event.preventDefault();

      const data = {
        email: formData.email.trim(),
        password: formData.password.trim(),
      };

      try {
        const response = await loginUser(data);
        if (typeof response !== "string") {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response));
          setUser(response);
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        setErrorMessage(message);
      }
    },
    [formData, setUser],
  );

  return (
    <>
      <header>
        <h2>LOGIN</h2>
      </header>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          width: 350,
          mx: "auto",
          mt: 5,
          p: 3,
          border: "1px solid #ccc",
          borderRadius: 2,
          boxShadow: 2,
        }}
      >
        {errorMessage && (
          <ErrorModal
            messageTitle={ERROR_TITLES.LOGIN_FAILED}
            errorMessage={errorMessage}
            callFunction={() => setErrorMessage("")}
            openValue={true}
          />
        )}

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

        <Button type="submit" variant="contained" size="large">
          Login
        </Button>

        <a style={{ textDecoration: "none" }} href={ROUTE_PATHS.REGISTER}>
          Do not have an account? Register here
        </a>
      </Box>
    </>
  );
}
