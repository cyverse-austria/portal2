import React from 'react'
import { useRouter } from 'next/router'
import getConfig from 'next/config'
import { useState, useEffect } from 'react'
import {
    Container,
    Grid,
    Box,
    Button,
    Paper,
    Typography,
    TextField,
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText,
    ListItemSecondaryAction,
    Radio,
    RadioGroup,
    FormControlLabel,
    Backdrop,
    CircularProgress,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@mui/material'
import {
    Layout,
    DateSpan,
    ConfirmationDialog,
    CopyToClipboardButton,
    ServicesList,
    AddServiceDialog,
    MailingListForm,
    AdminPasswordResetCard,
} from '../../../components'
import { Mail as MailIcon } from '@mui/icons-material'
import { useAPI } from '../../../contexts/api'
import { useError, withGetServerSideError } from '../../../contexts/error'
import { useUser } from '../../../contexts/user'
import { makeStyles } from '../../../styles/tss'

const useStyles = makeStyles()(theme => ({
    paper: {
        padding: '3em',
        marginBottom: '2em',
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
    divider: {
        marginTop: '1em',
        marginBottom: '1em',
    },
    history: {
        overflowY: 'auto',
        maxHeight: '30em',
    },
}))

const User = ({ user, history, ldap, me }) => {
    const { classes } = useStyles()
    const router = useRouter()
    const api = useAPI()
    const [_, setError] = useError()

    const [showDeleteConfirmationDialog, setShowDeleteConfirmationDialog] =
        useState(false)
    const [showLDAPDialog, setShowLDAPDialog] = useState(false)
    const [showPasswordResetDialog, setShowPasswordResetDialog] =
        useState(false)
    const [showAddServiceDialog, setShowAddServiceDialog] = useState(false)
    const [hmac, setHMAC] = useState()
    const [deletingUser, setDeletingUser] = useState(false)
    const [addingService, setAddingService] = useState(false)
    const [currentUser, setCurrentUser] = useState(user)
    const [permission] = useState(
        user.is_superuser ? 'superuser' : user.is_staff ? 'staff' : 'regular'
    )
    const isPermissionEditable = !user.is_superuser || me.is_superuser
    const [services, setServices] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            const [services] = await Promise.all([
                // may add more requests later
                api.services(), // for adding a service
            ])
            setServices(services)
        }
        fetchData()
    }, [])

    const deleteUser = async () => {
        try {
            setDeletingUser(true)
            setShowDeleteConfirmationDialog(false)
            await api.deleteUser(currentUser.id)
            router.push('/administrative/users')
        } catch (error) {
            console.log(error)
            setError(error.message)
        }
    }

    const openPasswordResetDialog = async () => {
        try {
            const resp = await api.adminResetPassword(currentUser.id)
            setHMAC(resp)
            setShowPasswordResetDialog(true)
        } catch (error) {
            console.log(error)
            setError(error.message)
        }
    }

    const changePermission = async e => {
        try {
            const resp = await api.updatePermission(currentUser.id, {
                permission: e.target.value,
            })
            if (resp != 'success') setError('An error occurred')
        } catch (error) {
            console.log(error)
            setError(error.message)
        }
    }

    const addService = async serviceId => {
        try {
            setAddingService(true)
            await api.createServiceUser(serviceId, currentUser.id)
            const newUser = await api.user(currentUser.id)
            setCurrentUser(newUser)
        } catch (error) {
            console.log(error)
            setError(error.message)
        } finally {
            setAddingService(false)
        }
    }

    return (
        <Layout title={user.username} breadcrumbs>
            <Container maxWidth="md">
                <br />
                <Paper elevation={3} className={classes.paper}>
                    <Typography component="div" variant="h5">
                        {`${currentUser.first_name} ${currentUser.last_name} (${currentUser.username}`}
                        <CopyToClipboardButton text={currentUser.username} />
                        {')'}
                    </Typography>
                    <br />
                    <Typography>
                        Joined: <DateSpan date={currentUser.date_joined} />
                    </Typography>
                    <Typography>
                        ORCID:{' '}
                        {currentUser.orcid_id ? currentUser.orcid_id : '<None>'}
                    </Typography>
                    <Box flexDirection="row" display="flex" alignItems="center">
                        <Typography>Permission:</Typography>
                        <RadioGroup row defaultValue={permission}>
                            <FormControlLabel
                                value="regular"
                                control={<Radio color="primary" />}
                                label="Regular"
                                labelPlacement="start"
                                disabled={!isPermissionEditable}
                                onChange={changePermission}
                            />
                            <FormControlLabel
                                value="staff"
                                control={<Radio color="primary" />}
                                label="Staff"
                                labelPlacement="start"
                                disabled={!isPermissionEditable}
                                onChange={changePermission}
                            />
                            <FormControlLabel
                                value="superuser"
                                control={<Radio color="primary" />}
                                label="Superuser"
                                labelPlacement="start"
                                disabled={
                                    !isPermissionEditable || !me.is_superuser
                                }
                                onChange={changePermission}
                            />
                        </RadioGroup>
                    </Box>
                    {!isPermissionEditable && (
                        <Box fontStyle="italic">
                            <Typography
                                variant="subtitle1"
                                color="textSecondary"
                            >
                                Superuser permission is required to change a
                                superuser's permission
                            </Typography>
                        </Box>
                    )}
                    <br />
                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <Button
                            color="primary"
                            onClick={() => setShowLDAPDialog(true)}
                        >
                            VIEW LDAP RECORD
                        </Button>{' '}
                        <Button
                            color="primary"
                            onClick={openPasswordResetDialog}
                        >
                            RESET PASSWORD
                        </Button>{' '}
                        <Button
                            sx={{ color: me.is_superuser ? 'error.main' : '' }}
                            disabled={!me.is_superuser}
                            onClick={() =>
                                setShowDeleteConfirmationDialog(true)
                            }
                        >
                            DELETE USER
                        </Button>
                    </div>
                    {!me.is_superuser && (
                        <Box fontStyle="italic">
                            <Typography
                                variant="subtitle1"
                                color="textSecondary"
                            >
                                Superuser permission is required to delete a
                                user
                            </Typography>
                        </Box>
                    )}
                </Paper>

                <Paper elevation={3} className={classes.paper}>
                    <AdminPasswordResetCard
                        user={currentUser}
                        onPasswordReset={newUser => setCurrentUser(newUser)}
                    />
                </Paper>

                <Paper elevation={3} className={classes.paper}>
                    <Typography component="div" variant="h5">
                        Email
                    </Typography>
                    <List style={{ maxWidth: '30em' }}>
                        {(currentUser?.emails || []).map(email => (
                            <ListItem key={email.id}>
                                <ListItemAvatar>
                                    <Avatar>
                                        <MailIcon />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={email.email}
                                    secondary={
                                        email.verified
                                            ? 'Verified' +
                                              (email.primary ? ', Primary' : '')
                                            : 'Unverified'
                                    }
                                />
                                <ListItemSecondaryAction>
                                    <CopyToClipboardButton text={email.email} />
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                </Paper>

                <Paper elevation={3} className={classes.paper}>
                    <MailingListForm
                        userId={currentUser.id}
                        emails={currentUser.emails}
                        title="Mailing List Subscriptions"
                    />
                </Paper>

                <Paper elevation={3} className={classes.paper}>
                    <Grid container justifyContent="space-between">
                        <Grid item>
                            <Typography component="div" variant="h5">
                                Services
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Button
                                variant="contained"
                                color="primary"
                                disabled={addingService}
                                onClick={() => setShowAddServiceDialog(true)}
                            >
                                Add Service
                            </Button>
                        </Grid>
                    </Grid>
                    {addingService && (
                        <Box display="flex" justifyContent="center" my={2}>
                            <CircularProgress />
                        </Box>
                    )}
                    <ServicesList services={currentUser?.services || []} />
                    <AddServiceDialog
                        open={showAddServiceDialog}
                        services={currentUser?.services || []}
                        allServices={services}
                        handleClose={() => setShowAddServiceDialog(false)}
                        handleSubmit={serviceId => {
                            setShowAddServiceDialog(false)
                            addService(serviceId)
                        }}
                    />
                </Paper>

                <Paper elevation={3} className={classes.paper}>
                    <Typography component="div" variant="h5">
                        Institution / Research / Demographics
                    </Typography>
                    <br />
                    <div>Company/Institution: {currentUser.institution}</div>
                    <div>Department: {currentUser.department}</div>
                    <div>
                        Occupation:{' '}
                        {currentUser?.occupation?.name || 'Not specified'}
                    </div>
                    <div>
                        Country:{' '}
                        {currentUser?.region?.country?.name || 'Not specified'}
                    </div>
                    <div>
                        Region: {currentUser?.region?.name || 'Not specified'}
                    </div>
                    <div>
                        Research Area:{' '}
                        {currentUser?.research_area?.name || 'Not specified'}
                    </div>
                    <div>
                        Funding Agency:{' '}
                        {currentUser?.funding_agency?.name || 'Not specified'}
                    </div>
                    <div>
                        Gender Identity:{' '}
                        {currentUser?.gender?.name || 'Not specified'}
                    </div>
                    <div>
                        Ethnicity:{' '}
                        {currentUser?.ethnicity?.name || 'Not specified'}
                    </div>
                </Paper>

                <Paper elevation={3} className={classes.paper}>
                    <Typography component="div" variant="h5">
                        Preferences
                    </Typography>
                    <br />
                    <div>
                        How did you hear about us?{' '}
                        {currentUser?.aware_channel?.name || 'Not specified'}
                    </div>
                    <div>
                        Receive the CyVerse Newsletter?{' '}
                        {currentUser.subscribe_to_newsletter ? 'Yes' : 'No'}
                    </div>
                    <div>
                        Participate in a research study about your use of
                        CyVerse applications and services?{' '}
                        {currentUser.participate_in_study ? 'Yes' : 'No'}
                    </div>
                </Paper>

                <Paper elevation={3} className={classes.paper}>
                    <Typography component="div" variant="h5">
                        History
                    </Typography>
                    <br />
                    <div className={classes.history}>
                        {history && history.length > 0
                            ? history.map((entry, index) => (
                                  <Box key={index}>
                                      <Typography
                                          variant="subtitle2"
                                          color="textSecondary"
                                      >
                                          {new Date(
                                              entry.date
                                          ).toLocaleString()}
                                      </Typography>
                                      <Typography variant="subtitle2">
                                          {entry.message}
                                      </Typography>
                                      {index == history.length - 1 ? (
                                          <></>
                                      ) : (
                                          <Divider
                                              className={classes.divider}
                                          />
                                      )}
                                  </Box>
                              ))
                            : 'None'}
                    </div>
                </Paper>
            </Container>
            <Backdrop className={classes.backdrop} open={deletingUser}>
                <CircularProgress color="inherit" />
            </Backdrop>
            <LDAPRecordDialog
                open={showLDAPDialog}
                content={ldap}
                handleClose={() => setShowLDAPDialog(false)}
            />
            <PasswordResetDialog
                open={showPasswordResetDialog}
                user={currentUser}
                hmac={hmac}
                handleClose={() => setShowPasswordResetDialog(false)}
            />
            <ConfirmationDialog
                open={showDeleteConfirmationDialog}
                title="Delete user"
                handleClose={() => setShowDeleteConfirmationDialog(false)}
                handleSubmit={deleteUser}
            />
        </Layout>
    )
}

const LDAPRecordDialog = ({ open, content, handleClose }) => {
    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            aria-labelledby="form-dialog-title"
        >
            <DialogTitle id="form-dialog-title">LDAP Record</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {content
                        ? content
                              .split('\n')
                              .map((line, index) => (
                                  <div key={index}>{line}</div>
                              ))
                        : 'User not found - this usually means that the user registered but has not yet clicked the link in the confirmation email to set their password'}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleClose}
                    variant="contained"
                    color="primary"
                >
                    OK
                </Button>
            </DialogActions>
        </Dialog>
    )
}

const PasswordResetDialog = ({ open, user, hmac, handleClose }) => {
    const api = useAPI()
    const [_, setError] = useError()
    const [sent, setSent] = useState(false)
    const config = getConfig().publicRuntimeConfig
    const link = `${config.UI_BASE_URL}/password?reset&code=${hmac}`

    const adminResetPassword = async () => {
        try {
            setSent(true)
            await api.adminResetPassword(user.id, { hmac })
        } catch (error) {
            console.log(error)
            setError(error.message)
        }
    }

    const copyToClipboard = e => {
        e.target.select()
        document.execCommand('copy')
    }

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            aria-labelledby="form-dialog-title"
        >
            <DialogTitle id="form-dialog-title">Reset Password</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Click to copy to clipboard
                    <br />
                    <TextField
                        id="standard-multiline-static"
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        style={{ background: '#e0e0e0' }}
                        defaultValue={link}
                        onClick={copyToClipboard}
                    />
                    <br />
                    <br />
                    {sent && 'Password reset email sent!'}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={adminResetPassword}
                    variant="contained"
                    color="primary"
                    disabled={sent}
                >
                    Send Email
                </Button>
                <Button onClick={handleClose} variant="outlined">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export async function getServerSideProps({ req, query }) {
    // id can be integer or username
    const user = await req.api.user(query.id)
    const history = await req.api.userHistory(user.id)
    const me = await req.api.user() // Get current logged-in user
    let ldap = null
    try {
        ldap = await req.api.userLDAP(user.id)
    } catch (e) {
        // Ignore
    }

    return { props: { user, history, ldap, me } }
}

export default User
