// mui imports
import { TextField, Button, Box } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

// import icons
import AccountCircle from "@mui/icons-material/AccountCircle";
import EmailIcon from "@mui/icons-material/Email";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import PasswordIcon from "@mui/icons-material/Password";

// react imports
import { useContext, useState } from "react";
import { useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";

// import values
import schemaValues from "../../database/schema/schemaValues.ts";
import { createUser } from "../../database/model/user.ts";
import type { UserType } from "../../database/model/user.ts";
import UserContext, { type UserContextType } from "../contexts/UserContext.tsx";

import ErrorModal from "../modals/ErrorModal.tsx";

export default function Register() {
  const { user, setUser }: UserContextType = useContext(UserContext);
  const navigate = useNavigate();

  useLayoutEffect(() => {
    if (user) navigate("/dashboard");
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }
    >,
  ) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    // Here you can call your API to register the user
    const pwd = formData.password.trim();

    if (!(formData.name.trim().length > 0)) {
      setErrorMessage("Invalid Name");
      return;
    }

    if (pwd.length < 6) {
      setErrorMessage("Password must be atleast 6 characters long");
      return;
    }

    if (pwd !== formData.confirmPassword.trim()) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    const data = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      password: formData.password,
    };
    try {
      const response: UserType | null = await createUser(data);
      localStorage.setItem("user", JSON.stringify(response));
      setUser(response);
      navigate("/dashboard");
    } catch (error: any) {
      const message: any = error;
      console.log(typeof error);
      setErrorMessage(message);
    }
  };

  return (
    <>
      <header>
        <h2>REGISTER</h2>
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
            errorMessage={errorMessage}
            callFunction={() => setErrorMessage("")}
            openValue={true}
          />
        )}
        {/* Name Field */}
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

        {/* Email Field */}
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

        {/* Role Select */}
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
              sx={{ textAlign: "left" }}
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

        {/* Password Field */}
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

        {/* Confirm Password Field */}
        <Box sx={{ display: "flex", alignItems: "flex-end" }}>
          <PasswordIcon sx={{ color: "action.active", mr: 1, my: 0.5 }} />
          <TextField
            id="confirmPassword "
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

        {/* Submit Button */}
        <Button type="submit" variant="contained" size="large">
          Register
        </Button>
      </Box>
    </>
  );
}
