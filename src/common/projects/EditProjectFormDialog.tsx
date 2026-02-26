import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import dayjs from "dayjs";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import { useState } from "react";

import DBContext from "../../context/contexts/DBContext";
import {
  updateProject,
  type ProjectType,
} from "../../../database/model/project";
import { AllProjectContext } from "../../context/contexts/AppContext";
import { useNavigate } from "react-router-dom";

import { useAuthCheck } from "../../hooks";

export default function EditProjectFormDialog({
  setEditProjectOpen,
  project,
  type,
}: {
  setEditProjectOpen: Function;
  project: ProjectType | null;
  type: string | undefined;
}) {
  useAuthCheck({
    redirectTo: "/login",
    when: "unauthenticated",
  });
  const db = React.useContext(DBContext);
  const { projects, setProjects } = React.useContext(AllProjectContext);

  const navigate = useNavigate();
  const [open, setOpen] = React.useState(true);

  const handleClose = async () => {
    setOpen(false);
    setEditProjectOpen(false);
  };

  if (!project) {
    handleClose();
    return;
  }

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    start_date: dayjs.Dayjs | null;
    deadline_date: dayjs.Dayjs | null;
  }>({
    name: project.name,
    description: project.description,
    start_date: dayjs(project.start_date),
    deadline_date: dayjs(project.deadline_date),
  });

  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
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
      const updatedData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        updated_at: new Date(date),
        start_date: start,
        deadline_date: deadline,
      };

      if (!db) return;

      const response: string | ProjectType = await updateProject(
        db,
        project?.id ?? -1,
        updatedData,
      );

      if (typeof response === "string") return;

      let otherProjects;

      if (!projects) return;

      if (projects && type == "admin") {
        if (Array.isArray(projects)) {
          otherProjects = projects.filter(
            (proj: ProjectType) => proj.id != project.id,
          );
          otherProjects.push(response);
          setProjects(otherProjects);
        }
      } else if (type == "created") {
        if (!Array.isArray(projects)) {
          otherProjects = projects.createdProjects.filter(
            (proj: ProjectType) => proj.id != project.id,
          );
          otherProjects.push(response);
          setProjects({
            createdProjects: otherProjects,
            assignedProjects: projects.assignedProjects,
          });
        }
      } else {
        navigate("/dashboard/projects");
      }
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
        <DialogTitle>Edit Project</DialogTitle>
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
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" form="subscription-form">
            Edit Project
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
