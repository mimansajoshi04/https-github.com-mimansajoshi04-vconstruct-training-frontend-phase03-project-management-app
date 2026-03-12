// External Libraries
import { useState, type ReactNode } from "react";

// MUI Components
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { Stack } from "@mui/material";

const MODAL_STYLE = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
} as const;

export default function DeleteStory({
  callFunction,
  closeFunction,
}: {
  callFunction: Function;
  closeFunction: Function;
}): ReactNode {
  const [open, setOpen] = useState(true);

  const handleDelete = () => {
    closeFunction();
    callFunction();
  };

  const handleClose = () => {
    setOpen(false);
    closeFunction();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="error-modal-title"
      aria-describedby="error-modal-description"
    >
      <Box sx={MODAL_STYLE}>
        <Typography id="error-modal-title" variant="h6" component="h2">
          Are you sure you want to delete this story?
        </Typography>
        <Stack direction={"row-reverse"} gap={2}>
          <Button onClick={handleClose} sx={{ mt: 2 }} variant="outlined">
            CLOSE
          </Button>
          <Button
            onClick={handleDelete}
            sx={{ mt: 2 }}
            variant="outlined"
            color="error"
          >
            Delete
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
