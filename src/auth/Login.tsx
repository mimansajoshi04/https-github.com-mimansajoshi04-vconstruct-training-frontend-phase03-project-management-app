// mui imports
import { TextField, Button, Box } from "@mui/material";

// import icons
import EmailIcon from "@mui/icons-material/Email";
import PasswordIcon from "@mui/icons-material/Password";

// react imports
import { useContext, useState } from "react";
import { useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";

// import values
import { loginUser } from "../../database/model/user.ts";
import type { UserType } from "../../database/model/user.ts";
import UserContext, { type UserContextType } from "../contexts/UserContext.tsx";

import ErrorModal from "../modals/ErrorModal.tsx";
import DBContext from "../contexts/DBContext.tsx";

export default function Login() {
  const { user, setUser }: UserContextType = useContext(UserContext);
  const db = useContext(DBContext);
  const navigate = useNavigate();

  useLayoutEffect(() => {
    if (user) navigate("/dashboard");
  }, []);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
    const data = {
      email: formData.email,
      password: formData.password.trim(),
    };
    try {
      const response: UserType | null | string = await loginUser(data);
      localStorage.setItem("user", JSON.stringify(response));
      setUser(response);
      navigate("/dashboard");
    } catch (error: any) {
      const message: any = error;
      setErrorMessage(message);
    }
  };

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
            errorMessage={errorMessage}
            callFunction={() => setErrorMessage("")}
            openValue={true}
          />
        )}

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
        {/* Submit Button */}
        <Button type="submit" variant="contained" size="large">
          Login
        </Button>
      </Box>
    </>
  );
}
