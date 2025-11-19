import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@mui/material'

export default function ConfirmationDialog({
    open,
    title,
    message,
    handleClose,
    handleSubmit,
}) {
    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            aria-labelledby="form-dialog-title"
        >
            <DialogTitle id="form-dialog-title">{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {message || 'Are you sure?'}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                >
                    Yes
                </Button>
            </DialogActions>
        </Dialog>
    )
}
