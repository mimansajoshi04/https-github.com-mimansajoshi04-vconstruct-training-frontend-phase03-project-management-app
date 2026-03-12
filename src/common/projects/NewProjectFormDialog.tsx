import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select from "@mui/material/Select";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

import dayjs from "dayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import { useState } from "react";

import { createProject } from "../../../database/model/project";
import { UserContext } from "../../context/contexts/UserContext";
import { AllUserContext } from "../../context/contexts/AppContext";
import { createProjectUserRelation } from "../../../database/model/assignment";

import { type UserType } from "../../../database/model/user";

import { useAuthCheck } from "../../hooks/index";
import {getAllData} from "../../services/getData";
import { USER_ROLES } from "../../constants/app.constants";

export default function NewProjectFormDialog({
  setAddProjectOpen,
  setProjects,
}: {
  setAddProjectOpen: Function;
  setProjects: Function;
}) {
  useAuthCheck({
    redirectTo: "/login",
    when: "unauthenticated",
  });
  const { user } = React.useContext(UserContext);

  const { users } = React.useContext(AllUserContext);

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    start_date: dayjs.Dayjs | null;
    deadline_date: dayjs.Dayjs | null;
    members: string[];
  }>({
    name: "",
    description: "",
    start_date: dayjs(),
    deadline_date: dayjs(),
    members: [],
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [open, setOpen] = React.useState(true);

  const handleClose = async () => {
    try {
      if (user) {
        let data = await getAllData(user);
        setProjects(data.projectData || {});
      }
    } catch (error: any) {
      setErrorMessage(error);
      return;
    }

    setOpen(false);
    setAddProjectOpen(false);
  };

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const changeMemberData = (value: any[]) => {
    setFormData({
      ...formData,
      members: value,
    });
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    const start = formData.start_date?.toDate() ?? new Date();
    const deadline = formData.deadline_date?.toDate() ?? new Date();

    if (deadline < start) {
      setErrorMessage("Invalid start date");
      return;
    }

    let date = Date.now();

    try {
      if (!(user?.id ?? -1 === -1)) return;

      const response = await createProject({
        name: formData.name.trim(),
        description: formData.description.trim(),
        created_by: user?.id ?? -1,
        created_at: new Date(date),
        updated_at: new Date(date),
        start_date: start,
        deadline_date: deadline,
      });

      if (typeof response === "string") return;

      const proj_id = response.id;

      formData.members.forEach(async (memberId) => {
        await createProjectUserRelation({
          projectId: Number(proj_id),
          userId: Number(memberId),
          assignedAt: new Date(date),
        });
      });
    } catch (error: any) {
      let message = error instanceof Error ? error.message : error;
      setErrorMessage(message);
      return;
    }
    handleClose();
  };

  return (
    <React.Fragment>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Project</DialogTitle>
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
              id="description"
              name="description"
              label="Description"
              type="textarea"
              value={formData.description}
              fullWidth
              variant="standard"
              onChange={(e) => handleChange(e)}
            />
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["DatePicker", "DatePicker"]}>
                <DatePicker
                  label="Start Date"
                  value={formData.start_date}
                  onChange={(newValue) =>
                    setFormData((prev) => ({
                      ...prev,
                      start_date: newValue,
                    }))
                  }
                />

                <DatePicker
                  label="Deadline Date"
                  value={formData.deadline_date}
                  onChange={(newValue) =>
                    setFormData((prev) => ({
                      ...prev,
                      deadline_date: newValue,
                    }))
                  }
                />
              </DemoContainer>
            </LocalizationProvider>
            <MultipleSelectCheckmarks
              users={users ? users : []}
              onChange={changeMemberData}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" form="subscription-form">
            Add Project
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export function MultipleSelectCheckmarks({
  users,
  onChange,
}: {
  users: UserType[];
  onChange?: (value: number[]) => void;
}) {
  const [memberIds, setMemberIds] = useState<number[]>([]);

  const handleChange = (event: any) => {
    const value = event.target.value;
    setMemberIds(value);

    if (onChange) {
      onChange(value);
    }
  };

  const filteredUsers = users.filter((u) => u.role !== USER_ROLES.ADMIN);

  return (
    <FormControl fullWidth sx={{ marginTop: "0.5rem" }}>
      <InputLabel id="add-members-label">Add Members</InputLabel>

      <Select
        labelId="add-members-label"
        id="add-members"
        multiple
        value={memberIds}
        onChange={handleChange}
        input={<OutlinedInput label="Add Members" />}
        renderValue={(selected) =>
          (selected as number[])
            .map((id) => users.find((u) => u.id === id)?.name ?? id)
            .join(", ")
        }
      >
        {filteredUsers.map((user) => {
          const selected = memberIds.includes(user?.id ?? -1);

          return (
            <MenuItem key={user.id} value={user.id}>
              {selected ? (
                <CheckBoxIcon
                  fontSize="small"
                  style={{
                    marginRight: 8,
                    padding: 9,
                    boxSizing: "content-box",
                  }}
                />
              ) : (
                <CheckBoxOutlineBlankIcon
                  fontSize="small"
                  style={{
                    marginRight: 8,
                    padding: 9,
                    boxSizing: "content-box",
                  }}
                />
              )}
              <ListItemText primary={user.name} />
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}
