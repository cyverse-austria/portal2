import React from 'react'
import { useState } from 'react'
import {
    Container,
    Paper,
    Grid,
    Typography,
    TextField,
    Button,
    IconButton,
    TableContainer,
    Table,
    TableBody,
    TableRow,
    TableCell,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import Layout from '../../components/Layout'
import { useAPI } from '../../contexts/api'
import { useError, withGetServerSideError } from '../../contexts/error'
import { makeStyles } from '../../styles/tss'

//FIXME duplicated elsewhere
const useStyles = makeStyles()(theme => ({
    paper: {
        padding: '3em',
    },
}))

const RestrictedUsernames = props => {
    const { classes } = useStyles()
    const api = useAPI()
    const [_, setError] = useError()

    const [usernames, setUsernames] = useState(props.usernames)
    const [keyword, setKeyword] = useState()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [usernameToAdd, setUsernameToAdd] = useState()

    const handleChangeKeyword = event => {
        setKeyword(event.target.value)
    }

    const handleChangeUsername = event => {
        setUsernameToAdd(event.target.value)
    }

    const deleteRestrictedUsername = async username => {
        try {
            await api.deleteRestrictedUsername(username)
            setUsernames(usernames.filter(u => u.username != username))
        } catch (error) {
            console.log(error)
            setError(error.message)
        }
    }

    const submitUsername = async () => {
        try {
            await api.createRestrictedUsername(usernameToAdd)
            setDialogOpen(false)
            setUsernames(await api.restrictedUsernames())
        } catch (error) {
            console.log(error)
            setError(error.message)
        }
    }

    return (
        <Layout breadcrumbs>
            <Container maxWidth="lg">
                <br />
                <Paper elevation={3} className={classes.paper}>
                    <Grid container justifyContent="space-between">
                        <Grid item>
                            <Typography component="h1" variant="h4">
                                Restricted Usernames
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setDialogOpen(true)}
                            >
                                Add Username
                            </Button>
                        </Grid>
                        <Grid item>
                            <TextField
                                style={{ width: '20em' }}
                                placeholder="Search ..."
                                onChange={handleChangeKeyword}
                            />
                        </Grid>
                    </Grid>
                    <Typography color="textSecondary" gutterBottom>
                        Users will not be allowed to create an account using any
                        of the usernames below
                    </Typography>
                    <br />
                    <UsernameTable
                        usernames={
                            keyword && keyword.length >= 2
                                ? usernames.filter(
                                      u => u.username.indexOf(keyword) >= 0
                                  )
                                : usernames
                        }
                        handleDelete={deleteRestrictedUsername}
                    />
                </Paper>
            </Container>
            <AddUsernameDialog
                open={dialogOpen}
                handleChange={handleChangeUsername}
                handleClose={() => setDialogOpen(false)}
                handleSubmit={submitUsername}
            />
        </Layout>
    )
}

const UsernameTable = ({ usernames, handleDelete }) => {
    return (
        <TableContainer component={Paper}>
            <Table size="small">
                <TableBody>
                    {usernames.map(({ id, username }) => (
                        <TableRow key={id}>
                            <TableCell component="th" scope="row">
                                {username}
                            </TableCell>
                            <TableCell align="right">
                                <IconButton
                                    onClick={() => handleDelete(username)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

const AddUsernameDialog = ({
    open,
    handleChange,
    handleClose,
    handleSubmit,
}) => (
    <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        aria-labelledby="form-dialog-title"
    >
        <DialogTitle id="form-dialog-title">
            Add Restricted Username
        </DialogTitle>
        <DialogContent>
            <DialogContentText>Username to add</DialogContentText>
            <TextField
                autoFocus
                margin="dense"
                id="name"
                fullWidth
                onChange={handleChange}
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose} color="primary">
                Cancel
            </Button>
            <Button onClick={handleSubmit} color="primary">
                Add
            </Button>
        </DialogActions>
    </Dialog>
)

export async function getServerSideProps({ req }) {
    const usernames = await req.api.restrictedUsernames()
    return { props: { usernames } }
}

export default RestrictedUsernames
