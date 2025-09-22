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

const QuestionsEditor = ({ questions, submitHandler, deleteHandler }) => {
    const { classes } = useStyles()
    const [dialogOpen, setDialogOpen] = useState(false)

    return (
        <div>
            <Paper elevation={3} className={classes.paper}>
                <Typography component="div" variant="h5">
                    Questions
                </Typography>
                <Typography color="textSecondary">
                    Questions users be will asked when requesting access.
                </Typography>
                <br />
                <List>
                    {questions &&
                        questions.map((question, index) => (
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
                                            primary={question.question}
                                            // secondary={"Required: " + (question.is_required ? 'yes' : 'no')}
                                        />
                                    </ListItem>
                                </Grid>
                                <Grid item>
                                    <IconButton
                                        onClick={() =>
                                            deleteHandler(question.id)
                                        }
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
                        Add Question
                    </Button>
                </Box>
            </Paper>
            <AddQuestionDialog
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

const AddQuestionDialog = ({ open, handleClose, handleSubmit }) => {
    const [values, setValues] = useState({})
    const [errors, setErrors] = useState({})

    const handleChange = e => {
        const error = validateField(e.target, e.target.value)
        setErrors({ ...errors, [e.target.id]: error })
        setValues({ ...values, [e.target.id]: e.target.value })
    }

    return (
        <Dialog open={open} onClose={handleClose} fullWidth>
            <DialogTitle>Add Question</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="normal"
                    fullWidth
                    id="question"
                    label="Question"
                    type="text"
                    required={true}
                    error={!!errors.name}
                    helperText={errors.name}
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

export default QuestionsEditor
