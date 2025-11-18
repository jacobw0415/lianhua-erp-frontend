import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

interface Props {
  open: boolean;
  message: string;
  onClose: () => void;   
}

export const GlobalAlertDialog = ({ open, message, onClose }: Props) => (
  <Dialog
    open={open}
    onClose={onClose}        
    maxWidth="xs"
    fullWidth
    PaperProps={{
      sx: { borderRadius: 2, p: 2 }
    }}
  >
    <DialogContent>
      <Typography
        variant="h6"
        sx={{ mb: 1, textAlign: "center", fontWeight: 600 }}
      >
        提示
      </Typography>

      <Typography variant="body1" sx={{ textAlign: "center" }}>
        {message}
      </Typography>
    </DialogContent>

    <DialogActions sx={{ justifyContent: "center" }}>
      <Button variant="contained" color="primary" onClick={onClose}>
        確定
      </Button>
    </DialogActions>
  </Dialog>
);
