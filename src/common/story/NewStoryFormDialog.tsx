import * as React from "react";
import { useState } from "react";

import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";

import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import { useAuthCheck } from "../../hooks/index";
import {
  createStory,
  getStoryForProjectId,
  type StoryType,
} from "../../../database/model/story";
import type { UserType } from "../../../database/model/user";
import { useParams } from "react-router-dom";
import { UserContext } from "../../context/contexts/UserContext";

export default function NewStoryFormDialog({
  setNewStoryOpen,
  setStories,
  members,
}: {
  setNewStoryOpen: (open: boolean) => void;
  setStories: React.Dispatch<React.SetStateAction<StoryType[]>>;
  members: UserType[];
}) {
  useAuthCheck({
    redirectTo: "/login",
    when: "unauthenticated",
  });

  const {user} = React.useContext(UserContext)
  const [open, setOpen] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    status: string;
    priority: string;
    due_date: Dayjs | null;
    memberId: string;
  }>({
    title: "",
    description: "",
    status: "",
    priority: "",
    due_date: dayjs(),
    memberId: "",
  });

  const { id } = useParams();
  let projectId = Number(id);

  const handleClose = async () => {
    try {
      const response = await getStoryForProjectId(projectId);
      if (typeof response === "string") {
        return;
      }
      setStories(response);
      setOpen(false);
      setNewStoryOpen(false);
    } catch (error: any) {
      let message = error instanceof Error ? error.message : error;
      setErrorMessage(message);
    }
  };

  const handleChange = (e: any) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      setErrorMessage("Title is required.");
      return;
    }

    try {
      const now = new Date();

      const newStory: StoryType = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        created_at: now,
        updated_at: now,
        due_date: formData.due_date?.toDate() ?? now,
        projectId: projectId,
        userId: Number(formData.memberId),
        created_by: user?.id ?? -1,
      };

      await createStory(newStory);
      handleClose();
    } catch (error: any) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      setErrorMessage(message);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Create New Story</DialogTitle>

      <DialogContent>
        {errorMessage && (
          <DialogContentText sx={{ color: "error.main", mb: 2 }}>
            {errorMessage}
          </DialogContentText>
        )}

        <form onSubmit={handleSubmit} id="new-story-form">
          <Stack spacing={3} mt={1}>
            <TextField
              autoFocus
              required
              name="title"
              label="Title"
              value={formData.title}
              fullWidth
              variant="outlined"
              onChange={handleChange}
            />

            <TextField
              required
              name="description"
              label="Description"
              value={formData.description}
              multiline
              rows={3}
              fullWidth
              variant="outlined"
              onChange={handleChange}
            />

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                label="Status"
                onChange={handleChange}
              >
                <MenuItem value="backlog">Backlog</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="testing">Testing</MenuItem>
                <MenuItem value="done">Done</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                name="priority"
                value={formData.priority}
                label="Priority"
                onChange={handleChange}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Member</InputLabel>
              <Select
                name="memberId"
                value={formData.memberId}
                label="Member"
                onChange={handleChange}
              >
                {user?.role!=="admin" && <MenuItem value={user?.id}>Self</MenuItem>}
                {members.map((m) => {
                  return <MenuItem value={String(m.id)}>{m.name}</MenuItem>;
                })}
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Due Date"
                value={formData.due_date}
                onChange={(newValue) =>
                  setFormData((prev) => ({
                    ...prev,
                    due_date: newValue,
                  }))
                }
              />
            </LocalizationProvider>
          </Stack>
        </form>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit" form="new-story-form" variant="contained">
          Create Story
        </Button>
      </DialogActions>
    </Dialog>
  );
}
