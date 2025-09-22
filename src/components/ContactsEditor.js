import React from 'react'
import { useState } from 'react'
import {
    Paper,
    Typography,
    TextField,
    Box,
    Grid,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@mui/material'
import { Person as PersonIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { validateField } from './Form'
import { makeStyles } from '../styles/tss'

const useStyles = makeStyles()(theme => ({
    paper: {
        padding: '3em',
    },
}))

const ContactsEditor = ({ contacts, submitHandler, deleteHandler }) => {
    const { classes } = useStyles()
    const [dialogOpen, setDialogOpen] = useState(false)

    return (
        <div>
            <Paper elevation={3} className={classes.paper}>
                <Typography component="div" variant="h5">
                    Support Contacts
                </Typography>
                <Typography color="textSecondary">
                    Who participants should contact if they have questions.
                </Typography>
                <br />
                <List>
                    {contacts.map((contact, index) => (
                        <Grid
                            container
                            key={index}
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <Grid item>
                                <ListItem>
                                    <ListItemAvatar>
                                        <Avatar>
                                            <PersonIcon />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={contact.name}
                                        secondary={contact.email}
                                    />
                                </ListItem>
                            </Grid>
                            <Grid item>
                                <IconButton
                                    onClick={() => deleteHandler(contact.id)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Grid>
                        </Grid>
                    ))}
                </List>
                <Box display="flex" justifyContent="flex-end">
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setDialogOpen(true)}
                    >
                        Add Contact
                    </Button>
                </Box>
            </Paper>
            <AddContactDialog
                open={dialogOpen}
                handleClose={() => setDialogOpen(false)}
                handleSubmit={values => {
                    setDialogOpen(false)
                    submitHandler(values)
                }}
            />
        </div>
    )
}

const AddContactDialog = ({ open, handleClose, handleSubmit }) => {
    const [values, setValues] = useState({})
    const [errors, setErrors] = useState({})

    const handleChange = e => {
        const error = validateField(e.target, e.target.value)
        setErrors({ ...errors, [e.target.id]: error })
        setValues({ ...values, [e.target.id]: e.target.value })
    }

    return (
        <Dialog open={open} onClose={handleClose} fullWidth>
            <DialogTitle>Add Contact</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="normal"
                    fullWidth
                    id="name"
                    label="Name"
                    type="text"
                    required={true}
                    error={!!errors.name}
                    helperText={errors.name}
                    onChange={handleChange}
                />
                <TextField
                    margin="normal"
                    fullWidth
                    id="email"
                    label="Email"
                    type="email"
                    required={true}
                    error={!!errors.email}
                    helperText={errors.email}
                    onChange={handleChange}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button
                    variant="contained"
                    color="primary"
                    disabled={!!errors.name || !!errors.email || !handleSubmit}
                    onClick={() => handleSubmit(values)}
                >
                    Add
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ContactsEditor
