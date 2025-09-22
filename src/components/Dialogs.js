import React from 'react'
import { useState } from 'react'
import {
    Button,
    TextField,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material'

const AddServiceDialog = ({
    open,
    services,
    allServices,
    handleClose,
    handleSubmit,
}) => {
    const availableServices =
        allServices &&
        allServices.filter(
            s => s.approval_key != '' && !services.some(s2 => s2.id == s.id)
        )
    const [selected, setSelected] = useState()

    return (
        <Dialog open={open} onClose={handleClose} fullWidth>
            <DialogTitle>Add Service</DialogTitle>
            <DialogContent>
                <TextField
                    select
                    margin="normal"
                    fullWidth
                    label="Select a service"
                    value={selected || ''}
                >
                    {availableServices &&
                        availableServices.map((service, index) => (
                            <MenuItem
                                key={index}
                                value={service.id}
                                onClick={e => setSelected(service.id)}
                            >
                                {service.name}
                            </MenuItem>
                        ))}
                </TextField>
                <br />
                <br />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setSelected(null) || handleClose()}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    disabled={!selected || !handleSubmit}
                    onClick={() => setSelected(null) || handleSubmit(selected)}
                >
                    Add
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export { AddServiceDialog }
