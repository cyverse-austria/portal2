import React from 'react'
import { useRouter } from 'next/router'
import { useState, useEffect, useRef } from 'react'
import getConfig from "next/config"
import Markdown from 'markdown-to-jsx'
import { Container, Paper, Grid, Box, Tabs, Tab, Typography, Tooltip, Button, IconButton, CircularProgress, Link, TextField, List, ListItem, ListItemText, ListItemAvatar, Avatar, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Collapse, Chip } from '@mui/material'
import { Person as PersonIcon, Delete as DeleteIcon, KeyboardArrowUp as KeyboardArrowUpIcon, KeyboardArrowDown as KeyboardArrowDownIcon } from '@mui/icons-material'
import Autocomplete from '@mui/material/Autocomplete'
import { makeStyles } from '../../styles/tss'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider, DatePicker, DateTimePicker } from '@mui/x-date-pickers'
import { Layout, DateRange, DateSpan, TabPanel, UpdateForm, FormDialog, ContactsEditor, ServicesList, AddServiceDialog } from '../../components'
import { useAPI } from '../../contexts/api'
import { useError } from '../../contexts/error'
import { useUser } from '../../contexts/user'
const { WS_WORKSHOP_ENROLLMENT_REQUEST_STATUS_UPDATE } = require('../../constants/client')

const useStyles = makeStyles()((theme) => ({
  paper: {
    padding: '3em'
  },
  cell: {
    border: 'none',
    verticalAlign: 'top'
  }
}))

const isHost = (user, workshop) => {
  return user.id == workshop.creator_id
}

const isOrganizer = (user, workshop) => {
  return workshop.organizers && workshop.organizers.some(o => o.id == user.id)
}

const Workshop = (props) => {
  const workshop = props.workshop
  const [user] = useUser()
  const isEditor = user.is_staff || isHost(user, workshop) || isOrganizer(user, workshop)

  return (
    <Layout title={workshop.title} breadcrumbs>
      <Container maxWidth='lg'>
        {isEditor 
          ? <WorkshopEditor {...props} />
          : <div><br /><WorkshopViewer {...props} /></div>
        }
      </Container>
    </Layout>
  )
}

const WorkshopViewer = (props) => {
  const config = getConfig().publicRuntimeConfig
  const workshop = props.workshop
  const { classes } = useStyles()
  const api = useAPI()
  const [user] = useUser()
  const [_, setError] = useError()

  const userWorkshop = (user?.workshops || []).find(w => w.id == workshop.id)
  const request = userWorkshop && userWorkshop.api_workshopenrollmentrequest

  const [dialogOpen, setDialogOpen] = useState(false)
  const [requestStatus, setRequestStatus] = useState(request && request.status)

  const handleSubmit = async () => {
    setDialogOpen(false)
    setRequestStatus('submitted')
    try {
      const newRequest = await api.createWorkshopRequest(workshop.id)
      setRequestStatus(newRequest.status)
    }
    catch(error) {
      console.log(error)
      setError(error.message)
    }
  }

  // Configure web socket connection
  // The enrollment status will live udpate in cases where an instructor manually approves a request
  // while the user is viewing this page.
  useEffect(() => {
    let socket = null
    try {
      socket = new WebSocket(`${config.WS_BASE_URL}/${user.username}`)

      // Listen for messages // TODO move into library
      socket.addEventListener('message', function (event) {
        console.log('Socket received:', event.data)
        if (!event || !event.data)
          return

        try {
          const eventData = JSON.parse(event.data)
          if (eventData.type == WS_WORKSHOP_ENROLLMENT_REQUEST_STATUS_UPDATE && eventData.data.workshopId == workshop.id) {
            setRequestStatus(eventData.data.status)
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      });
    } catch (error) {
      console.error('WebSocket connection failed:', error)
    }

    // Cleanup function
    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close()
      }
    }
  }, [])

  return (
    <div>
      <Paper elevation={3} className={classes.paper}>
        <Grid container spacing={4}>
          <Grid container item xs={12} justifyContent="space-between">
            <Grid item>
              <Box display="flex">
                <Typography component="h1" variant="h4" gutterBottom>{workshop.title}</Typography>
              </Box>
            </Grid>
            <Grid item>
              <WorkshopActionButton 
                status={requestStatus} 
                enrollmentBegins={workshop.enrollment_begins}
                enrollmentEnds={workshop.enrollment_ends}
                requestHandler={() => setDialogOpen(true)} 
              />
            </Grid>
            <Grid item xs={12}>
              <Typography color="textSecondary">{workshop.description}</Typography>
              <br />
              {isHost(user, workshop) &&
                <Typography>
                  <b>Your are the workshop host</b>
                </Typography>
              }
              <Typography color="textSecondary">
                Enrollment: <DateRange date1={workshop.enrollment_begins} date2={workshop.enrollment_ends} hideTime />
              </Typography>
              <Typography color="textSecondary">
                Workshop: <DateRange date1={workshop.start_date} date2={workshop.end_date} />
              </Typography>
              <Link href={`/api/workshops/${workshop.id}/download`} target="_blank">
                Download event to your calendar
              </Link>
            </Grid>
          </Grid>
          {workshop.about &&
            <Grid item xs={12}>
              <Typography component="div" variant="h5">Details</Typography>
              <Typography color="textSecondary"><Markdown>{workshop.about}</Markdown></Typography>
            </Grid>
          }
          {workshop.services && workshop.services.length > 0 &&
            <Grid item xs={12}>
              <Typography component="div" variant="h5">Services</Typography>
              <Typography color="textSecondary">Services used in the workshop.</Typography>
              <ServicesList services={workshop.services} />
            </Grid>
          }
        </Grid>
      </Paper>
      <RequestEnrollmentDialog 
        open={dialogOpen}
        workshop={workshop}
        handleClose={() => setDialogOpen(false)}
        handleSubmit={handleSubmit}
      />
    </div>
  )
}

const WorkshopActionButton = ({ status, enrollmentBegins, enrollmentEnds, requestHandler }) => {
  const { label, tooltip, action, disabled } = (() => {
    const now = Date.now()
    if (now > new Date(enrollmentEnds))
      return { label: 'ENROLLMENT PERIOD HAS ENDED', disabled: true }
    if (now < new Date(enrollmentBegins))
      return { label: 'ENROLLMENT PERIOD HAS NOT BEGUN', disabled: true }

    if (status === 'submitted')
      return { label: '...', disabled: true }
    if (status === 'granted')
      return { label: 'ENROLLED', disabled: true }
    if (status === 'pending' || status == 'approved')
      return {
        label: 'ENROLLMENT PENDING APPROVAL', 
        tooltip: 'The enrollment request is in process or awaiting approval.  You will be notified via email when completed.', 
        disabled: true
      }
    if (status === 'denied')
      return { 
        label: 'REQUEST DENIED', 
        tooltip: 'The access request was denied and an email was sent with an explanation.', 
        disabled: true
      }
    
    return { label: 'ENROLL', action: requestHandler }
  })()

  return (
    <Tooltip title={tooltip || ''}>
      <span>
        <Button 
          variant="contained" 
          color="primary" 
          size="medium" 
          style={{minWidth: "10em"}}
          disabled={disabled} 
          onClick={action}
        >
          {label}
        </Button> 
      </span>
    </Tooltip>
  )
}

const RequestEnrollmentDialog = ({ open, workshop, handleClose, handleSubmit }) => {
  return (
    <Dialog open={open} onClose={handleClose} fullWidth={true} aria-labelledby="form-dialog-title">
      <DialogContent>
        <div style={{ fontSize: '16px', color: 'rgba(0, 0, 0, 0.6)' }}>
          <p>
            Click <strong>Enroll</strong> to submit a request to enroll in the workshop.
            Upon enrollment, you will automatically be granted access to all services used in the workshop.
          </p>
          <p>
            <strong>If you have been pre-approved to enroll</strong> this will happen
            immediately and you will recieve an enrollment confirmation email.
          </p>
          <p>
            <strong>If you have not been pre-approved</strong> the instructor will be emailed for manual approval.
          </p>
          <p>
            Would you like to enroll in the <strong>{workshop.title}</strong> workshop?
          </p>
        </div>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={handleClose}>
          Cancel
        </Button>
        <Button color="primary" variant="contained" onClick={handleSubmit}>
          Enroll
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const WorkshopEditor = (props) => {
  const router = useRouter()
  const api = useAPI()
  const [_, setError] = useError()
  const [user] = useUser()
  const [workshop, setWorkshop] = useState(props.workshop)
  const [participants, setParticipants] = useState()
  const [emails, setEmails] = useState()
  const [requests, setRequests] = useState()
  const [services, setServices] = useState()
  const [tab, setTab] = useState(router.query.t || 'view')

  useEffect(() => { 
      let isMounted = true
      const fetchData = async () => {
        try {
          const [participants, emails, requests, services] = await Promise.all([
            api.workshopParticipants(workshop.id),
            api.workshopEmails(workshop.id),
            api.workshopRequests(workshop.id),
            api.services() // for adding a service 
          ])
          if (isMounted) {
            setParticipants(participants)
            setEmails(emails)
            setRequests(requests)
            setServices(services)
          }
        } catch (error) {
          if (isMounted) {
            console.error('Error fetching workshop data:', error)
          }
        }
      }
      fetchData()
      
      return () => {
        isMounted = false
      }
    }, 
    []
  )

  /*
   * All state management is done here since child components are remounted in tab change
   */

  const submitWorkshop = async (data) => {
    try {
      const newWorkshop = await api.updateWorkshop(workshop.id, data)
      setWorkshop(newWorkshop)
    }
    catch(error) {
      console.log(error)
      setError(error.message)
    }
  }

  const submitOrganizer = async (userId) => {
    try {
      await api.createWorkshopOrganizer(workshop.id, userId)
      const newWorkshop = await api.workshop(workshop.id)
      setWorkshop(newWorkshop)
    }
    catch(error) {
      console.log(error)
      setError(error.message)
    }
  }

  const deleteOrganizer = async (userId) => {
    try {
      await api.deleteWorkshopOrganizer(workshop.id, userId)
      const newWorkshop = await api.workshop(workshop.id)
      setWorkshop(newWorkshop)
    }
    catch(error) {
      console.log(error)
      setError(error.message)
    }
  }

  const submitContact = async (data) => {
    try {
      await api.createWorkshopContact(workshop.id, data)
      const newWorkshop = await api.workshop(workshop.id)
      setWorkshop(newWorkshop)
    }
    catch(error) {
      console.log(error)
      setError(error.message)
    }
  }

  const deleteContact = async (email) => {
    try {
      await api.deleteWorkshopContact(workshop.id, email)
      const newWorkshop = await api.workshop(workshop.id)
      setWorkshop(newWorkshop)
    }
    catch(error) {
      console.log(error)
      setError(error.message)
    }
  }

  const submitService = async (serviceId) => {
    try {
      await api.createWorkshopService(workshop.id, serviceId)
      const newWorkshop = await api.workshop(workshop.id)
      setWorkshop(newWorkshop)
    }
    catch(error) {
      console.log(error)
      setError(error.message)
    }
  }

  const deleteService = async (serviceId) => {
    try {
      await api.deleteWorkshopService(workshop.id, serviceId)
      const newWorkshop = await api.workshop(workshop.id)
      setWorkshop(newWorkshop)
    }
    catch(error) {
      console.log(error)
      setError(error.message)
    }
  }

  const submitParticipant = async (userId) => {
    try {
      await api.createWorkshopParticipant(workshop.id, userId)
      const newParticipants = await api.workshopParticipants(workshop.id)
      setParticipants(newParticipants)
    }
    catch(error) {
      console.log(error)
      setError(error.message)
    }
  }

  const deleteParticipant = async (participantId) => {
    try {
      await api.deleteWorkshopParticipant(workshop.id, participantId)
      const newParticipants = await api.workshopParticipants(workshop.id)
      setParticipants(newParticipants)
    }
    catch(error) {
      console.log(error)
      setError(error.message)
    }
  }

  const submitEmail = async (data) => {
    try {
      await api.createWorkshopEmail(workshop.id, data)
      const newEmails = await api.workshopEmails(workshop.id)
      setEmails(newEmails)
    }
    catch(error) {
      console.log(error)
      setError(error.message)
    }
  }

  const deleteEmail = async (email) => {
    try {
      await api.deleteWorkshopEmail(workshop.id, email)
      const newEmails = await api.workshopEmails(workshop.id)
      setEmails(newEmails)
    }
    catch(error) {
      console.log(error)
      setError(error.message)
    }
  }

  const updateRequest = async (requestId, status, message) => {
    try {
      await api.updateWorkshopRequest(requestId, { status, message })
      const newRequests = await api.workshopRequests(workshop.id)
      const newParticipants = await api.workshopParticipants(workshop.id)
      setParticipants(newParticipants)
      setRequests(newRequests)
    }
    catch(error) {
      console.log(error)
      setError(error.message)
    }
  }

  return (
    <div>
      <Tabs
        value={tab}
        onChange={(_, newTab) => setTab(newTab)}
        variant="fullWidth"
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab label="View" value="view" />
        <Tab label="Modify" value="modify" />
        <Tab label="Participants" value="participants" />
        <Tab label="Pre-approvals" value="preapprovals" />
        <Tab label="Requests" value="requests" />
      </Tabs>
      <br />
      <TabPanel value={tab} index="view">
        <WorkshopViewer workshop={workshop} />
      </TabPanel>
      <TabPanel value={tab} index="modify">
        <GeneralSettings {...workshop} submitHandler={submitWorkshop} />
        <br /><br />
        <EnrollmentPeriod {...workshop} submitHandler={submitWorkshop} />
        <br /><br />
        <WorkshopPeriod {...workshop} submitHandler={submitWorkshop} />
        <br /><br />
        <Host {...workshop} submitHandler={submitWorkshop} />
        <br /><br />
        <Organizers {...workshop} submitHandler={submitOrganizer} deleteHandler={deleteOrganizer} />
        <br /><br />
        <ContactsEditor {...workshop} submitHandler={submitContact} deleteHandler={deleteContact} />
        <br /><br />
        <Services workshop={workshop} services={services} submitHandler={submitService} deleteHandler={deleteService} />
        <br /><br />
      </TabPanel>
      <TabPanel value={tab} index="participants">
        <Participants participants={participants} submitHandler={submitParticipant} deleteHandler={deleteParticipant} />
      </TabPanel>
      <TabPanel value={tab} index="preapprovals">
        <Emails emails={emails} submitHandler={submitEmail} deleteHandler={deleteEmail} />
      </TabPanel>
      <TabPanel value={tab} index="requests">
        <Requests requests={requests} submitHandler={updateRequest} />
      </TabPanel>
    </div>
  )
}

const GeneralSettings = (props) => {
  const { classes } = useStyles()
  const timeoutRef = useRef(null)

  useEffect(() => {
    return () => {
      // Clear any pending timeouts when component unmounts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <Paper elevation={3} className={classes.paper}>
      <UpdateForm 
        title="General"
        fields={[
          { id: "title",
            name: "Title",
            type: "text",
            required: true,
            value: props.title,
          },
          { id: "description",
            name: "Description",
            type: "text",
            required: false,
            value: props.description
          },
          { id: "about",
            name: "Details",
            type: "text",
            required: false,
            value: props.about,
            multiline: true,
            rows: 4
          },
          { id: "is_public",
            name: "Public - visible for all users or staff only",
            type: "toggle",
            value: props.is_public
          }
        ]} 
        initialValues={{...props}} // unused fields will be ignored
        autosave
        onSubmit={(values, { setSubmitting }) => {
          timeoutRef.current = setTimeout(() => {
            console.log('Submit:', values)
            props.submitHandler(values)
            setSubmitting(false)
            timeoutRef.current = null
          }, 1000)
        }}
      />
    </Paper>
  )
}

const EnrollmentPeriod = ({ enrollment_begins, enrollment_ends, submitHandler, creator_id }) => {
  const { classes } = useStyles()
  const [user] = useUser()
  //const [errors, setErrors] = useState({})
  const isEditor = user.is_staff || isHost(user, { creator_id })

  //TODO
  // const validate = (values) => {
  //   if (newDate(values['enrollment_begins']) > new Date(values['enrollment_ends'])
  //     setErrors({enrollment_begins})
  // }

  const handleChange = (values) => {
    console.log('Submit:', values)
    submitHandler(values)
  }

  return (
    <Paper elevation={3} className={classes.paper}>
      <Typography component="div" variant="h5">Enrollment Period</Typography> 
      <Typography color="textSecondary">
        Date range for when users can enroll in the workshop.
      </Typography>
      <br />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Grid container justifyContent="space-around">
          <DatePicker
            disabled={!isEditor}
            format="MM/dd/yyyy"
            sx={{width: '45%'}}
            label="Enrollment Begins (MST)"
            value={enrollment_begins ? new Date(enrollment_begins) : null}
            onChange={(value) => handleChange({'enrollment_begins': value})}
            slots={{
              textField: TextField
            }}
            slotProps={{
              textField: {
                helperText: "This is the earliest that users with an authorized email will be able to enroll and get access to the workshop services.",
                margin: "normal"
              }
            }}
          />
          <DatePicker
            disabled={!isEditor}
            format="MM/dd/yyyy"
            sx={{width: '45%'}}
            label="Enrollment Ends (MST)"
            value={enrollment_ends ? new Date(enrollment_ends) : null}
            onChange={(value) => handleChange({'enrollment_ends': value})}
            slots={{
              textField: TextField
            }}
            slotProps={{
              textField: {
                helperText: "After this date users will not be able to enroll in the workshop, even if their email is authorized.",
                margin: "normal"
              }
            }}
          />
        </Grid>
      </LocalizationProvider>
    </Paper>
  )
}

//FIXME similar to EnrollmentPeriod, move into shared component
const WorkshopPeriod = ({ start_date, end_date, enrollment_begins, submitHandler, creator_id }) => {
  const { classes } = useStyles()
  const [user] = useUser()
  const [errors, setErrors] = useState({})
  const isEditor = user.is_staff || isHost(user, { creator_id })

  const validate = (values) => {
    const errors = {}

    if ('start_date' in values) {
      if (!isDate(values['start_date']))
        errors['start_date'] = 'Invalid date'
      // else if (new Date(values['start_date']) > new Date(end_date))
      //   errors['start_date'] = 'Start date must come before end date'
    }

    if ('end_date' in values) {
      if (!isDate(values['end_date']))
        errors['end_date'] = 'Invalid date'
      // else if (new Date(values['end_date']) < new Date(start_date))
      //   errors['end_date'] = 'End date must come after start date'
    }

    return errors
  }

  const handleChange = (values) => {
    console.log('Submit:', values)

    const errors = validate(values)
    console.log('errors', errors)
    setErrors(errors)
    if (Object.keys(errors).length > 0)
      return

    submitHandler(values)
  }

  const isDate = (d) => {
    if (!(d instanceof Date) || isNaN(d))
      return false
    return true
  }

  return (
    <Paper elevation={3} className={classes.paper}>
      <Typography component="div" variant="h5">Attendance Period</Typography> 
      <Typography color="textSecondary">
        Date range for when users will attend the workshop.
      </Typography>
      <br />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Grid container justifyContent="space-around">
          <DateTimePicker
            disabled={!isEditor}
            format="MM/dd/yyyy hh:mm a"
            sx={{width: '45%'}}
            label="Workshop Begins (MST)"
            value={start_date ? new Date(start_date) : null}
            minDate={enrollment_begins ? new Date(enrollment_begins) : null}
            onChange={(value) => handleChange({'start_date': value})}
            slots={{
              textField: TextField
            }}
            slotProps={{
              textField: {
                error: !!errors["start_date"],
                helperText: errors["start_date"],
                margin: "normal"
              }
            }}
          />
          <DateTimePicker
            disabled={!isEditor}
            format="MM/dd/yyyy hh:mm a"
            sx={{width: '45%'}}
            label="Workshop Ends (MST)"
            value={end_date ? new Date(end_date) : null}
            minDate={enrollment_begins ? new Date(enrollment_begins) : null}
            onChange={(value) => handleChange({'end_date': value})}
            slots={{
              textField: TextField
            }}
            slotProps={{
              textField: {
                error: !!errors["end_date"],
                helperText: errors["end_date"],
                margin: "normal"
              }
            }}
          />
        </Grid>
      </LocalizationProvider>
    </Paper>
  )
}

const Host = ({ owner, submitHandler }) => {
  const { classes } = useStyles()
  const [user] = useUser()
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div>
      <Paper elevation={3} className={classes.paper}>
        <Typography component="div" variant="h5">Host</Typography> 
        <Typography color="textSecondary">
          Primary point of contact who is authorized to enroll users, approve enrollment requests, and edit workshop details.
          NOTE: this field can only be changed by CyVerse staff.
        </Typography>
        <br />
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Link href={`/administrative/users/${owner.id}`}>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={owner.first_name + ' ' + owner.last_name} secondary={owner.username} />
              </ListItem>
            </Link>
          </Grid>
          {user.is_staff &&
            <Grid item>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => setDialogOpen(true)}
              >
                Change Host
              </Button>
            </Grid>
          }
        </Grid>
      </Paper>
      <SearchUsersDialog 
        title='Set Host'
        description='Enter the user to set as the host for the workshop.'
        open={dialogOpen}
        handleClose={() => setDialogOpen(false)} 
        handleSubmit={(user) => {
          setDialogOpen(false)
          submitHandler({ creator_id: user.id })
        }}
      />
    </div>
  )
}

const Organizers = ({ organizers, owner, submitHandler, deleteHandler, creator_id }) => {
  const { classes } = useStyles()
  const [user] = useUser()
  const [dialogOpen, setDialogOpen] = useState(false)
  const isEditable = user.is_staff || isHost(user, { creator_id })

  return (
    <div>
      <Paper elevation={3} className={classes.paper}>
        <Typography component="div" variant="h5">Instructors/Organizers</Typography> 
        <Typography color="textSecondary">
          Users authorized to approve enrollment requests, enroll other users directly, and edit workshop details.
          NOTE: only the workshop host can add/remove instructors/organizers.
        </Typography>
        <br />
        <List>
          {organizers.map((organizer, index) => (
            <Grid container key={index} justifyContent="space-between" alignItems="center">
              <Grid item>
                <Link href={`/administrative/users/${organizer.id}`}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={organizer.first_name + ' ' + organizer.last_name} secondary={organizer.username} />
                  </ListItem>
                </Link>
              </Grid>
              {isEditable &&
                <Grid item>
                  <IconButton onClick={() => deleteHandler(organizer.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              }
            </Grid>
          ))}
        </List>
        {isEditable &&
          <Box display="flex" justifyContent="flex-end">
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => setDialogOpen(true)}
            >
              Add Organizer
            </Button>
          </Box>
        }
      </Paper>
      <SearchUsersDialog 
        title='Add Organizer'
        description='Enter the user to add as an organizer for the workshop.'
        open={dialogOpen}
        handleClose={() => setDialogOpen(false)} 
        handleSubmit={(user) => {
          setDialogOpen(false)
          submitHandler(user.id)
        }}
      />
    </div>
  )
}

const Services = ({ workshop, services, submitHandler, deleteHandler }) => {
  const { classes } = useStyles()
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div>
      <Paper elevation={3} className={classes.paper}>
        <Typography component="div" variant="h5">Services</Typography> 
        <Typography color="textSecondary">Services used in this workshop (access granted automatically upon enrollment).</Typography>
        <br />
        <ServicesList services={workshop.services} onDelete={deleteHandler} />
        <Box display="flex" justifyContent="flex-end">
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => setDialogOpen(true)}
          >
            Add Service
          </Button>
        </Box>
      </Paper>
      <AddServiceDialog 
        open={dialogOpen}
        services={workshop.services}
        allServices={services}
        handleClose={() => setDialogOpen(false)} 
        handleSubmit={(serviceId) => {
          setDialogOpen(false)
          submitHandler(serviceId)
        }}
      />
    </div>
  )
}

const Participants = ({ participants, submitHandler, deleteHandler }) => {
  const { classes } = useStyles()
  const [dialogOpen, setDialogOpen] = useState(false)

  return (  
    <div>      
      <Paper elevation={3} className={classes.paper}>
        <Grid container justifyContent="space-between">
          <Grid item>
            <Typography component="h1" variant="h4">Participants {participants && participants.length > 0 && <Chip label={participants.length} />}</Typography>
            <Typography variant="subtitle1" color="textSecondary">
              The users below are enrolled in this workshop.
            </Typography>
          </Grid>
          <Grid item>
            <Button 
              variant="contained" 
              color="primary" 
              style={{width:'10em', whiteSpace: 'nowrap'}}
              onClick={() => setDialogOpen(true)}
            >
              Enroll User
            </Button>
          </Grid>
        </Grid>
        <br />
        {!participants || participants.length == 0 
          ? <Typography>None</Typography>
          : <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {participants.map(({ id, username, first_name, last_name, email }, index) => (
                    <TableRow key={index}>
                      <TableCell>{first_name + ' ' + last_name}</TableCell>
                      <TableCell>{username}</TableCell>
                      <TableCell>{email}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => deleteHandler(id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
        }
      </Paper>
      <SearchUsersDialog 
        title='Enroll User'
        open={dialogOpen}
        handleClose={() => setDialogOpen(false)}
        handleSubmit={(user) => {
          setDialogOpen(false)
          submitHandler(user.id)
        }}
      />
    </div>
  )
}

const Emails = ({ emails, submitHandler, deleteHandler }) => {
  const { classes } = useStyles()
  const [dialogOpen, setDialogOpen] = useState(false)

  return ( 
    <div>       
      <Paper elevation={3} className={classes.paper}>
        <Grid container justifyContent="space-between">
          <Grid item style={{width:'70%'}}>
            <Typography component="h1" variant="h4">Pre-approvals {emails && emails.length > 0 && <Chip label={emails.length} />}</Typography>
            <Typography variant="subtitle1" color="textSecondary">
              The users below (shown by CyVerse email address) are pre-approved to enroll in this workshop.
            </Typography>
          </Grid>
          <Grid item>
            <Button 
              variant="contained" 
              color="primary" 
              style={{width:'10em', whiteSpace: 'nowrap'}}
              onClick={() => setDialogOpen(true)}
            >
              Add Email
            </Button>
          </Grid>
        </Grid>
        <br />
        {!emails || emails.length == 0 
          ? <Typography>None</Typography>
          : <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {emails.map(({ email }, index) => (
                    <TableRow key={index}>
                      <TableCell>{email}</TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => deleteHandler(email)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
        }
      </Paper>
      <FormDialog 
        title="Add Email"
        open={dialogOpen}
        fields={[
          {
            id: "email",
            label: "Email",
            type: "email",
            required: true
          }
        ]}
        handleClose={() => setDialogOpen(false)} 
        handleSubmit={(values) => {
          setDialogOpen(false)
          submitHandler(values)
        }}
      />
    </div>
  )
}

const Requests = ({ requests, submitHandler }) => {
  const { classes } = useStyles()
  const [myUser] = useUser()

  const Status = ({ value }) => {
    let color = 'black';

    switch (value) {
      case 'pending':
      case 'approved': color = 'inherit'; break;
      case 'granted': color = 'primary'; break;
      case 'denied': color = 'error'; break;
    }

    return <Typography color={color}>{value.toUpperCase()}</Typography>
  }

  const Row = ({ id, user, created_at, status, logs }) => {
    const [open, setOpen] = React.useState(false)
    return (
      <>
        <TableRow>
          <TableCell>
            <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell>{user.first_name + ' ' + user.last_name}</TableCell>
          <TableCell>{user.username}</TableCell>
          <TableCell>{user.email}</TableCell>
          <TableCell style={{whiteSpace: 'nowrap'}}>
            <DateSpan date={created_at} />
          </TableCell>
          <TableCell>
            <Status value={status} />
          </TableCell>
          <TableCell style={{whiteSpace: 'nowrap'}} align="right">
            <Button 
              color="primary" 
              size="small" 
              disabled={status == 'denied' || status == 'granted'}
              onClick={() => submitHandler(id, 'denied', `Request denied by ${myUser.username}`)}
            >
              Deny
            </Button>
            <Button 
              color="primary" 
              size="small"
              disabled={status == 'approved' || status == 'granted'}
              onClick={() => submitHandler(id, 'approved', `Request approved by ${myUser.username}`)}
            >
              Approve
            </Button>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box m={2}>
                <Grid container>
                  <Grid item xs={12} sm={12} md={6}>
                    <Typography><b>User Info</b></Typography>
                    <Table size="small" padding='none'>
                      <TableRow>
                        <TableCell className={classes.cell}>Company/Institution</TableCell>
                        <TableCell className={classes.cell}>{user.institution}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className={classes.cell}>Department</TableCell>
                        <TableCell className={classes.cell}>{user.department}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className={classes.cell}>Occupation</TableCell>
                        <TableCell className={classes.cell}>{user?.occupation?.name || 'Not specified'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className={classes.cell}>Country</TableCell>
                        <TableCell className={classes.cell}>{user?.region?.country?.name || 'Not specified'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className={classes.cell}>Region</TableCell>
                        <TableCell className={classes.cell}>{user?.region?.name || 'Not specified'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className={classes.cell}>Research Area</TableCell>
                        <TableCell className={classes.cell}>{user?.research_area?.name || 'Not specified'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className={classes.cell}>Funding Agency</TableCell>
                        <TableCell className={classes.cell}>{user?.funding_agency?.name || 'Not specified'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <Link href={`/administrative/users/${user.id}`}>View Details</Link>
                      </TableRow>
                    </Table>
                  </Grid>
                  <Grid item xs={12} sm={12} md={6}>
                    <Typography><b>History</b></Typography>
                    <Table size="small" padding='none'>
                    {logs.map(({status, message, created_at}, index) => (
                      <TableRow key={index}>
                        <TableCell className={classes.cell}>
                          <Typography variant='subtitle2' color='textSecondary' noWrap>
                            <DateSpan date={created_at} />
                          </Typography>
                        </TableCell>
                        <TableCell className={classes.cell}>{message}</TableCell>
                      </TableRow>
                    ))}
                    </Table>
                  </Grid>
                </Grid>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    )
  }

  return (        
    <Paper elevation={3} className={classes.paper}>
      <Typography component="h1" variant="h4">Requests {requests && requests.length > 0 && <Chip label={requests.length} />}</Typography>
      <br />
      {!requests || requests.length == 0 
        ? <Typography>None</Typography>
        : <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((request, index) => (
                  <Row key={index} {...request} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
      }
    </Paper>
  )
}

const SearchUsersDialog = ({ open, title, description, handleClose, handleSubmit }) => {
  const api = useAPI()
  const [users, setUsers] = useState()
  const [debounce, setDebounce] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState()

  useEffect(() => {
    return () => {
      if (debounce) {
        clearTimeout(debounce)
      }
    }
  }, [debounce])

  const handleChange = (event) => {
    const { value } = event.target

    // Couldn't get just-debounce-it to work here
    if (debounce) clearTimeout(debounce)
    if (!value)
      reset()
    else
      setDebounce(setTimeout(async () => {
        setLoading(true)
        const resp = await api.users({ keyword: value })
        setUsers(resp.results)
        setLoading(false)
      }, 1000));
  }

  const handleSelect = (event, value) => {
    setSelectedUser(value)
  }

  const reset = () => {
    setUsers(null)
    setSelectedUser(null)
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">{title}</DialogTitle>
      <DialogContent>
        {description &&
          <DialogContentText>
            {description}
          </DialogContentText>
        }
        <Autocomplete
          freeSolo
          id="user"
          disableClearable
          options={users || []}
          getOptionLabel={(u) => `${u.first_name} ${u.last_name} (${u.username}, ${u.email})`}
          onChange={handleSelect}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search users by first/last name, username, and email"
              margin="normal"
              InputProps={{ 
                ...params.InputProps, 
                endAdornment: (
                  <React.Fragment>
                    {loading 
                      ? <CircularProgress color="inherit" size={20} /> 
                      : (users && users.length == 0 ? 'No results' : null)
                    }
                    {params.InputProps.endAdornment}
                  </React.Fragment>
                )
              }}
              onChange={handleChange}
            />
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={() => reset() || handleClose()}
          onBlur={() => reset() || handleClose()}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          disabled={!selectedUser || !handleSubmit}
          onClick={() => handleSubmit(selectedUser)}  
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export async function getServerSideProps({ req, query }) {
  try {
    if (!req.api) {
      console.error('API middleware not available on request object')
      return {
        redirect: {
          destination: '/workshops',
          permanent: false,
        },
      }
    }

    const workshop = await req.api.workshop(query.id)
    if (!workshop) {
      return {
        notFound: true
      }
    }

    return { props: { workshop } }
  } catch (error) {
    console.error('Error in getServerSideProps:', error.message, error)

    // If it's an API availability issue, redirect to workshops list
    if (error.message?.includes('API not available')) {
      return {
        redirect: {
          destination: '/workshops',
          permanent: false,
        },
      }
    }

    // For other errors (like workshop not found), show 404
    return {
      notFound: true
    }
  }
}

export default Workshop
