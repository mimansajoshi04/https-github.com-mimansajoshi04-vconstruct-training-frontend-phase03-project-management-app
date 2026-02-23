import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function ErrorModal({
  errorMessage,
  callFunction,
  openValue,
}: {
  errorMessage: string;
  callFunction: Function;
  openValue: Boolean;
}) {
  const [open, setOpen] = React.useState(openValue);
  const handleClose = () => {
    setOpen(false);
    callFunction();
  };

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Registration Failed
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {errorMessage}
          </Typography>
          <Button onClick={handleClose}>CLOSE</Button>
        </Box>
      </Modal>
    </div>
  );
}
