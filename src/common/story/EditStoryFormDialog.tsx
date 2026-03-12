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
  getStoryForProjectId,
  updateStoryById,
  type StoryType,
} from "../../../database/model/story";
import type { UserType } from "../../../database/model/user";
import { useParams } from "react-router-dom";
import { UserContext } from "../../context/contexts/UserContext";
import { KANBAN_STAUS, STORY_PRIORITY, USER_ROLES } from "../../constants/app.constants";

export default function EditStoryFormDialog({
  setEditStoryOpen,
  setStories,
  members,
  story,
}: {
  setEditStoryOpen: (open: boolean) => void;
  setStories: React.Dispatch<React.SetStateAction<StoryType[]>>;
  members: UserType[];
  story: StoryType;
}) {
  useAuthCheck({
    redirectTo: "/login",
    when: "unauthenticated",
  });

  const { user } = React.useContext(UserContext);
  const [open, setOpen] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const isCreator = story.created_by === user?.id;

  const [formData, setFormData] = useState<{
    title?: string;
    description?: string;
    status: string;
    priority?: string;
    due_date?: Dayjs;
    memberId?: string;
  }>(
    isCreator
      ? {
          title: story.title ?? "",
          description: story.description ?? "",
          status: story.status,
          priority: story.priority,
          due_date: dayjs(story.due_date),
          memberId: String(story.userId),
        }
      : {
          status: story.status,
        },
  );

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
      setEditStoryOpen(false);
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

    try {
      const now = new Date();

      let data = isCreator
        ? {
            title: formData.title,
            description: formData.description,
            status: formData.status,
            priority: formData.priority,
            updated_at: now,
            due_date: formData.due_date?.toDate() ?? now,
            userId: Number(formData.memberId),
          }
        : {
            status: formData.status,
          };
      await updateStoryById(story?.id ?? -1, data);
      handleClose();
    } catch (error: any) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      setErrorMessage(message);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit New Story</DialogTitle>

      <DialogContent>
        {errorMessage && (
          <DialogContentText sx={{ color: "error.main", mb: 2 }}>
            {errorMessage}
          </DialogContentText>
        )}

        <form onSubmit={handleSubmit} id="new-story-form">
          {isCreator && (
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
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  label="Priority"
                  onChange={handleChange}
                >
                  <MenuItem value={STORY_PRIORITY.LOW}>Low</MenuItem>
                  <MenuItem value={STORY_PRIORITY.MEDIUM}>Medium</MenuItem>
                  <MenuItem value={STORY_PRIORITY.HIGH}>High</MenuItem>
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
                  {user?.role !== USER_ROLES.ADMIN && (
                    <MenuItem value={user?.id}>Self</MenuItem>
                  )}
                  {members.map((m) => {
                    return <MenuItem value={String(m.id)}>{m.name}</MenuItem>;
                  })}
                </Select>
              </FormControl>

              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Due Date"
                  value={formData.due_date}
                  onChange={(newValue) => {
                    if (isCreator) {
                      setFormData((prev) => ({
                        ...prev,
                        due_date: dayjs(newValue),
                      }));
                    }
                  }}
                />
              </LocalizationProvider>
            </Stack>
          )}

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formData.status}
              label="Status"
              onChange={handleChange}
            >
              <MenuItem value={KANBAN_STAUS.BACKLOG}>Backlog</MenuItem>
              <MenuItem value={KANBAN_STAUS.IN_PROGRESS}>In Progress</MenuItem>
              <MenuItem value={KANBAN_STAUS.TESTING}>Testing</MenuItem>
              <MenuItem value={KANBAN_STAUS.DONE}>Done</MenuItem>
            </Select>
          </FormControl>
        </form>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit" form="new-story-form" variant="contained">
          Edit Story
        </Button>
      </DialogActions>
    </Dialog>
  );
}
