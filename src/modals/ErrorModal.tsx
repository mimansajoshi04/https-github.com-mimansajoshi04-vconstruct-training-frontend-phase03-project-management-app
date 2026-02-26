// External Libraries
import { useState, type ReactNode } from 'react';

// MUI Components
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

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

interface ErrorModalProps {
  messageTitle: string;
  errorMessage: string;
  callFunction: () => void;
  openValue: boolean;
}

export default function ErrorModal({
  messageTitle,
  errorMessage,
  callFunction,
  openValue,
}: ErrorModalProps): ReactNode {
  const [open, setOpen] = useState(openValue);

  const handleClose = () => {
    setOpen(false);
    callFunction();
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
          {messageTitle}
        </Typography>
        <Typography
          id="error-modal-description"
          sx={{ mt: 2 }}
        >
          {errorMessage}
        </Typography>
        <Button onClick={handleClose} sx={{ mt: 2 }}>
          CLOSE
        </Button>
      </Box>
    </Modal>
  );
}
