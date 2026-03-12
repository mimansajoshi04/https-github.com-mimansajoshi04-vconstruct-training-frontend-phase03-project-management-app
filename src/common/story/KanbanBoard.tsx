import {
  Box,
  Button,
  FormControl,
  MenuItem,
  InputLabel,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useContext, type ReactNode } from "react";
import { useMemo, useCallback } from "react";

import {
  getStoryForProjectId,
  type StoryType,
  getStoryForUserId,
} from "../../../database/model/story";

import type { UserType } from "../../../database/model/user";

import { getUsersForProject } from "../../../database/model/assignment";

import KanbanBoardCard from "./KanbanBoardCard";
import NewStoryFormDialog from "./NewStoryFormDialog";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { UserContext } from "../../context/contexts/UserContext";
import {
  KANBAN_STAUS,
  STORY_PRIORITY,
  USER_ROLES,
} from "../../constants/app.constants";

export default function KanbanBoard(): ReactNode {
  const { type, id } = useParams();
  const navigate = useNavigate();

  let isDashboard;
  if (id) isDashboard = false;
  else isDashboard = true;

  let projectId = Number(id);

  const { user } = useContext(UserContext);
  let currentUserId = String(user?.id ?? "");

  const [stories, setStories] = useState<StoryType[]>([]);
  const [userId, setUserId] = useState<string>("all");
  const [priority, setPriority] = useState<string>("all");
  const [members, setMembers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [newStoryOpen, setNewStoryOpen] = useState<boolean>(false);

  const resetFilters = () => {
    setUserId("all");
    setPriority("all");
  };

  useEffect(() => {
    const loadStories = async () => {
      try {
        const data = await getStoryForProjectId(projectId);
        if (typeof data === "string") {
          console.error(data);
          return;
        }
        setStories(data);
      } catch (error) {
        console.log(error);
      }
    };

    async function fetchMembers() {
      try {
        const response = await getUsersForProject(Number(id) ?? -1);
        setMembers(response.filter((m) => m.id != user?.id) || []);
      } catch (error) {
        console.error(error);
      }
    }

    const loadStoriesForUser = async () => {
      try {
        const data = await getStoryForUserId(user?.id ?? -1);
        if (typeof data === "string") {
          console.error(data);
          return;
        }
        setStories(data);
      } catch (error) {
        console.log(error);
      }
    };

    const init = async () => {
      try {
        if (isDashboard) {
          await loadStoriesForUser();
        } else {
          await Promise.all([fetchMembers(), loadStories()]);
        }
      } catch (error) {
        //handle error
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const filteredStoriesByStatus = useCallback(
    (status: string) => {
      return stories.filter((s) => {
        const matchesStatus = s.status === status;
        const matchesUser =
          userId === "all" ? true : s.userId === Number(userId);
        const matchesPriority =
          priority === "all" ? true : s.priority === priority;

        return matchesStatus && matchesUser && matchesPriority;
      });
    },
    [stories, userId, priority],
  );

  // Now create memoized arrays for each status
  const filteredBacklogStories = useMemo(
    () => filteredStoriesByStatus(KANBAN_STAUS.BACKLOG),
    [filteredStoriesByStatus],
  );
  const filteredInProgressStories = useMemo(
    () => filteredStoriesByStatus(KANBAN_STAUS.IN_PROGRESS),
    [filteredStoriesByStatus],
  );
  const filteredTestingStories = useMemo(
    () => filteredStoriesByStatus(KANBAN_STAUS.TESTING),
    [filteredStoriesByStatus],
  );
  const filteredDoneStories = useMemo(
    () => filteredStoriesByStatus(KANBAN_STAUS.DONE),
    [filteredStoriesByStatus],
  );

  if (isLoading) {
    return <h3>Loading...</h3>;
  }

  return (
    <Box>
      {!isDashboard && newStoryOpen && (
        <NewStoryFormDialog
          setNewStoryOpen={setNewStoryOpen}
          setStories={setStories}
          members={members}
        />
      )}

      <Box>
        {!isDashboard && (
          <Stack sx={{ justifyContent: "space-between" }} direction="row">
            <Button
              variant="outlined"
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => {
                navigate(`/dashboard/projects/${type}/${id}`);
              }}
            >
              BACK TO PROJECT PAGE
            </Button>
            <Button
              variant="outlined"
              startIcon={<AddRoundedIcon />}
              onClick={() => {
                setNewStoryOpen(true);
              }}
            >
              NEW STORY
            </Button>
          </Stack>
        )}
        <Stack sx={{ mt: 3 }} direction="row" gap={3}>
          {!isDashboard && (
            <FormControl fullWidth>
              <InputLabel id="user-id-select-label">User</InputLabel>
              <Select
                labelId="user-id-select-label"
                value={userId}
                label="User"
                onChange={(e) => setUserId(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                {user?.role !== USER_ROLES.ADMIN && (
                  <MenuItem value={currentUserId}>Self</MenuItem>
                )}
                {members.map((m) => {
                  return (
                    <MenuItem key={m.id} value={String(m.id)}>
                      {m.name}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          )}

          <FormControl fullWidth>
            <InputLabel id="priority-id-select-label">Priority</InputLabel>
            <Select
              labelId="priority-id-select-label"
              value={priority}
              label="Priority"
              onChange={(e) => setPriority(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value={STORY_PRIORITY.LOW}>Low</MenuItem>
              <MenuItem value={STORY_PRIORITY.MEDIUM}>Medium</MenuItem>
              <MenuItem value={STORY_PRIORITY.HIGH}>High</MenuItem>
            </Select>
          </FormControl>

          <Button variant="outlined" onClick={() => resetFilters()}>
            Reset
          </Button>
        </Stack>
      </Box>

      {stories.length > 0 ? (
        <Box
          sx={{
            mt: 2,
            justifyContent: "space-between",
            display: "flex",
            gap: 2,
          }}
          gap={2}
        >
          <KanbanBoardCard
            title={"Backlog"}
            stories={filteredBacklogStories}
            members={members}
            setStories={setStories}
          />
          <KanbanBoardCard
            title={"In Progress"}
            stories={filteredInProgressStories}
            members={members}
            setStories={setStories}
          />
          <KanbanBoardCard
            title={"Testing"}
            stories={filteredTestingStories}
            members={members}
            setStories={setStories}
          />
          <KanbanBoardCard
            title={"Done"}
            stories={filteredDoneStories}
            members={members}
            setStories={setStories}
          />
        </Box>
      ) : (
        <Typography sx={{ mt: 5 }} variant="subtitle2">
          No stories yet. Create a new story to see the board.
        </Typography>
      )}
    </Box>
  );
}
