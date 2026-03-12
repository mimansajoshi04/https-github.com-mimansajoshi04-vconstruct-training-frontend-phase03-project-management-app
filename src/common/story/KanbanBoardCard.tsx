import { useContext, type ReactNode } from "react";
import {
  deleteStoryById,
  getStoryForProjectId,
  type StoryType,
} from "../../../database/model/story";

import {
  Box,
  Typography,
  Chip,
  Stack,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Avatar,
} from "@mui/material";

import type { UserType } from "../../../database/model/user";
import { getInitials } from "../../../database/createAvatar";
import { UserContext } from "../../context/contexts/UserContext";
import { AllUserContext } from "../../context/contexts/AppContext";

import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

import EditStoryFormDialog from "./EditStoryFormDialog";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import { formatDate } from "../../utils/formatDate";
import DeleteStory from "./DeleteStoryModal";

function getPriorityColor(priority: string) {
  switch (priority) {
    case "high":
      return "error";
    case "medium":
      return "warning";
    case "low":
      return "success";
    default:
      return "default";
  }
}

function getPriorityBGColor(priority: string) {
  switch (priority) {
    case "high":
      return "#fdecea"; // very light red
    case "medium":
      return "#fff4e5"; // very light orange
    case "low":
      return "#edf7ed"; // very light green
    default:
      return "#f5f5f5";
  }
}

export default function KanbanBoardCard({
  title,
  stories,
  members,
  setStories,
}: {
  title: string;
  stories: StoryType[];
  members: UserType[];
  setStories: React.Dispatch<React.SetStateAction<StoryType[]>>;
}): ReactNode {
  const { id } = useParams();

  let isDashboard;
  if (id) {
    isDashboard = false;
  } else {
    isDashboard = true;
  }

  let projectId = Number(id);
  const theme = useTheme();

  const { user } = useContext(UserContext);
  const { users } = useContext(AllUserContext);

  const [editStoryOpen, setEditStoryOpen] = useState<boolean>(false);
  const [deleteStoryOpen, setDeleteStoryOpen] = useState<boolean>(false);
  const storyRef: any = useRef(null);

  const handleStoryEdit = (story: StoryType) => {
    if (story) {
      storyRef.current = story;
      setEditStoryOpen(true);
    }
  };

  const handleDeleteStoryModal = (story: StoryType) => {
    if (story) {
      storyRef.current = story;
      setDeleteStoryOpen(true);
    }
  };

  const handleDeleteStory = async (storyId: number) => {
    try {
      console.log(storyId);
      await deleteStoryById(storyId);

      const response = await getStoryForProjectId(projectId);
      if (typeof response === "string") {
        console.log(response);
        return;
      }
      setStories(response);
      setDeleteStoryOpen(false);
    } catch (error) {
      // console.log(error);
      return;
    } finally {
    }
  };
  return (
    <Box
      sx={{
        width: "25%",
        borderRadius: 2,
        p: 2,
        display: "flex",
        flexDirection: "column",
        boxShadow: 1,
      }}
    >
      {editStoryOpen && storyRef && (
        <EditStoryFormDialog
          setEditStoryOpen={setEditStoryOpen}
          setStories={setStories}
          members={members}
          story={storyRef.current}
        />
      )}

      {deleteStoryOpen && (
        <DeleteStory
          callFunction={() => handleDeleteStory(storyRef.current.id)}
          closeFunction={() => setDeleteStoryOpen(false)}
        />
      )}
      <Box sx={{ marginBottom: 2 }}>
        <Typography
          variant="h6"
          sx={{ m: 1, textAlign: "center", fontWeight: 500 }}
        >
          {title.toLocaleUpperCase()}
        </Typography>
      </Box>

      <Divider sx={{ marginBottom: 2 }} />

      <Stack spacing={2} sx={{ overflowY: "auto" }}>
        {stories.map((story) => {
          let assignedTo =
            story.userId === user?.id
              ? user
              : members.filter((m) => m.id === story.userId)[0];

          let assignedBy =
            story.created_by === user?.id
              ? user
              : (members.filter((m) => m.id === story.created_by)[0] ??
                users?.filter((m) => m.id === story.created_by)[0]);

          // console.log(assignedTo);
          // console.log(assignedBy);
          return (
            <Accordion
              key={story.id}
              sx={{
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? theme.palette.background.paper
                    : getPriorityBGColor(story.priority),
                color: theme.palette.text.primary,
              }}
            >
              <AccordionSummary sx={{ minHeight: 56 }}>
                <Stack
                  width="100%"
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography>{story.title}</Typography>
                  <Chip
                    label={
                      <Typography variant="overline">
                        {story.priority}
                      </Typography>
                    }
                    color={getPriorityColor(story.priority)}
                  />
                </Stack>
              </AccordionSummary>

              <AccordionDetails>
                <Box>
                  <Typography variant="caption">Description</Typography>
                  <Typography variant="subtitle2">
                    {story.description}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption">Due date</Typography>
                  <Typography variant="subtitle2">
                    {formatDate(story.due_date)}
                  </Typography>
                </Box>

                {assignedTo && (
                  <Box>
                    <Stack
                      direction="row"
                      sx={{
                        mt: 2,
                        alignItems: "center",
                      }}
                      gap={2}
                    >
                      <Avatar sx={{ backgroundColor: assignedTo.avatar_color }}>
                        {getInitials(assignedTo.name)}
                      </Avatar>
                      <Typography variant="caption">
                        <Typography variant="subtitle2">
                          Assigned to{" "}
                        </Typography>

                        {assignedTo.name}
                      </Typography>
                    </Stack>
                  </Box>
                )}

                {assignedBy && (
                  <Box>
                    <Stack
                      direction="row"
                      sx={{
                        mt: 2,
                        alignItems: "center",
                      }}
                      gap={2}
                    >
                      <Avatar sx={{ backgroundColor: assignedBy.avatar_color }}>
                        {getInitials(assignedBy.name)}
                      </Avatar>
                      <Typography variant="caption">
                        <Typography variant="subtitle2">
                          Assigned by{" "}
                        </Typography>

                        {assignedBy.name}
                      </Typography>
                    </Stack>
                  </Box>
                )}

                {!isDashboard &&
                  user &&
                  (user?.id === assignedBy.id ||
                    user?.id === assignedTo.id) && (
                    <Stack
                      sx={{ mt: 2, justifyContent: "space-between" }}
                      direction="row"
                    >
                      <Button
                        onClick={() => {
                          handleStoryEdit(story);
                        }}
                        startIcon={<EditRoundedIcon />}
                        variant="outlined"
                        sx={{
                          color: theme.palette.text.primary,
                        }}
                      ></Button>
                      <Button
                        startIcon={<DeleteForeverRoundedIcon />}
                        variant="outlined"
                        onClick={() => {
                          handleDeleteStoryModal(story);
                        }}
                        sx={{
                          color: theme.palette.text.primary,
                        }}
                      ></Button>
                    </Stack>
                  )}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Stack>
    </Box>
  );
}
