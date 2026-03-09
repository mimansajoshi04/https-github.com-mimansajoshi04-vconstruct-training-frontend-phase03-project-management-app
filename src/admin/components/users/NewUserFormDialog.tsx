import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";

import { useState } from "react";
import { useAuthCheck } from "../../../hooks";

import { createUser, getAllUsers } from "../../../../database/model/user";

export default function NewUserFormDialog({
  setAddUserOpen,
  setUsers,
}: {
  setAddUserOpen: Function;
  setUsers: Function;
}) {
  useAuthCheck({
    redirectTo: "/login",
    when: "unauthenticated",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  const [open, setOpen] = React.useState(true);

  const handleClose = async () => {
    try {
        const response = await getAllUsers();
        setUsers(response);
    } catch (error: any) {
      setErrorMessage(error);
      return;
    }

    setOpen(false);
    setAddUserOpen(false);
  };

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (formData.password.trim().length < 6) {
      setErrorMessage("Password must be atleast 6 characters.");
      return;
    }

    try {
      await createUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        password: formData.password.trim(),
      });
    } catch (error: unknown) {
      let message = error instanceof Error ? error.message : String(error);
      setErrorMessage(message);
      return;
    }
    handleClose();
  };

  return (
    <React.Fragment>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          {errorMessage && (
            <DialogContentText sx={{ color: "red" }}>
              {errorMessage}
            </DialogContentText>
          )}
          <form onSubmit={handleSubmit} id="subscription-form">
            <TextField
              autoFocus
              required
              margin="dense"
              id="name"
              name="name"
              label="Name"
              value={formData.name}
              type="text"
              fullWidth
              variant="standard"
              onChange={(e) => handleChange(e)}
            />
            <TextField
              required
              margin="dense"
              id="email"
              name="email"
              label="Email Address"
              type="email"
              value={formData.email}
              fullWidth
              variant="standard"
              onChange={(e) => handleChange(e)}
            />
            <FormControl
              size="small"
              sx={{ minWidth: 140, marginTop: "1rem" }}
              fullWidth
            >
              <InputLabel id="role-select-label">Role</InputLabel>
              <Select
                labelId="role-select-label"
                value={formData.role}
                label="Role"
                name="role"
                onChange={(e) => handleChange(e)}
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="developer">Developer</MenuItem>
                <MenuItem value="tester">Tester</MenuItem>
              </Select>
            </FormControl>
            <TextField
              required
              margin="dense"
              id="password"
              name="password"
              label="Password"
              type="password"
              value={formData.password}
              fullWidth
              variant="standard"
              onChange={(e) => handleChange(e)}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" form="subscription-form">
            Add User
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
