import type { ReactNode } from "react";

import { Box, Button, Typography } from "@mui/material";

import ViewKanbanRoundedIcon from "@mui/icons-material/ViewKanbanRounded";
import { useNavigate } from "react-router-dom";

export default function StorySummary({
  projectId,
  type,
}: {
  projectId: number;
  type: string;
}): ReactNode {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/dashboard/project-stories/${type}/${projectId}`);
  };

  return (
    <Box sx={{ mt: 5 }}>
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Stories
        </Typography>
      </Box>
      <Button
        variant="outlined"
        startIcon={<ViewKanbanRoundedIcon />}
        onClick={handleClick}
      >
        View Kanban Board
      </Button>
    </Box>
  );
}
