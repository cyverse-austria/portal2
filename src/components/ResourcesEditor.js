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
import {
    MenuBook as MenuBookIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material'
import { validateField } from './Form'
import { makeStyles } from '../styles/tss'

const useStyles = makeStyles()(theme => ({
    paper: {
        padding: '3em',
    },
}))

const ResourcesEditor = ({ resources, submitHandler, deleteHandler }) => {
    const { classes } = useStyles()
    const [dialogOpen, setDialogOpen] = useState(false)

    return (
        <div>
            <Paper elevation={3} className={classes.paper}>
                <Typography component="div" variant="h5">
                    Resources
                </Typography>
                <Typography color="textSecondary">
                    Help resources for the service.
                </Typography>
                <br />
                <List>
                    {resources.map((resource, index) => (
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
                                            <MenuBookIcon />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={resource.name}
                                        secondary={resource.url}
                                    />
                                </ListItem>
                            </Grid>
                            <Grid item>
                                <IconButton
                                    onClick={() => deleteHandler(resource.id)}
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
                        Add Resource
                    </Button>
                </Box>
            </Paper>
            <AddResourceDialog
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

const AddResourceDialog = ({ open, handleClose, handleSubmit }) => {
    const [values, setValues] = useState({})
    const [errors, setErrors] = useState({})

    const handleChange = e => {
        const error = validateField(e.target, e.target.value)
        setErrors({ ...errors, [e.target.id]: error })
        setValues({ ...values, [e.target.id]: e.target.value })
    }

    return (
        <Dialog open={open} onClose={handleClose} fullWidth>
            <DialogTitle>Add Resource</DialogTitle>
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
                    id="desription"
                    label="Description"
                    type="text"
                    required={false}
                    error={!!errors.description}
                    helperText={errors.description}
                    onChange={handleChange}
                />
                <TextField
                    margin="normal"
                    fullWidth
                    id="url"
                    label="URL"
                    type="text"
                    required={true}
                    error={!!errors.url}
                    helperText={errors.url}
                    onChange={handleChange}
                />
                <TextField
                    margin="normal"
                    fullWidth
                    id="icon_url"
                    label="Icon URL"
                    type="text"
                    required={false}
                    error={!!errors.icon_url}
                    helperText={errors.icon_url}
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

export default ResourcesEditor
