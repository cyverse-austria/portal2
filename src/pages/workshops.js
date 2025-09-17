import React from 'react'
import { Grid, Link, Box, Divider, Typography, Button } from '@mui/material'
import { Event as EventIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material'
import { DateRange, Layout, SummaryCard } from '../components'
import { useUser } from '../contexts/user'
import { makeStyles } from '../styles/tss'

const useStyles = makeStyles()((theme) => ({
  nowrap: {
    whiteSpace: 'nowrap'
  }
}))

const Workshops = (props) => {
  const [user] = useUser()
  const workshops = props.workshops || []
  const userWorkshops = [].concat(
    user?.workshops || [], // workshop user is/was enrolled in
    workshops.filter(w =>
      !(user?.workshops || []).find(uw => uw.id == w.id) && // skip duplicates
      (w.creator_id == user?.id ||
        (w.organizers && w.organizers.some(o => o.id == user?.id)))
    ) // workshop user is/was hosting/organizer
  )
  const otherWorkshops = workshops.filter(w => !userWorkshops.find(w2 => w2.id == w.id)) 

  const timeNow = Date.now()
  const mine = userWorkshops.filter(w => new Date(w.enrollment_ends).getTime() > timeNow)
  const past = userWorkshops.filter(w => new Date(w.enrollment_ends).getTime() <= timeNow)
  const upcoming = otherWorkshops.filter(w => w.is_public && new Date(w.enrollment_ends).getTime() > timeNow)

  return (
    <Layout title="Workshops">
      <Box mt={3}>
        <Typography variant="h6" component="h2">My Workshops</Typography>
        <Divider />
        <br />
        <MyWorkshops workshops={mine} />
        <br />
      </Box>
      <Box mt={3}>
        <Typography variant="h6" component="h2">Upcoming Workshops</Typography>
        <Divider />
        <br />
        <UpcomingWorkshops workshops={upcoming} />
        <br />
      </Box>
      <Box mt={3}>
        <Typography variant="h6" component="h2">Past Workshops</Typography>
        <Divider />
        <br />
        <PastWorkshops workshops={past} />
        <br />
      </Box>
    </Layout>
  )
}

const MyWorkshops = ({ workshops }) => {
  const content =
    workshops.length > 0
    ? <WorkshopGrid workshops={workshops} />
    : <Typography variant="body1">
        Looks like you aren't attending any workshops.
        If you enroll in one, you'll find it here.
      </Typography>

  return (
    <div>
      {content}
      <br />
      <Typography variant="body1">Request to host your own workshop <Link href='requests/8'>here</Link>.</Typography>
    </div>
  )
}

const UpcomingWorkshops = ({ workshops }) => {
  if (workshops.length > 0)
    return <WorkshopGrid workshops={workshops} />

  return <Typography variant="body1">No upcoming workshops.</Typography>
}

const PastWorkshops = ({ workshops }) => {
  if (workshops.length > 0)
    return <WorkshopGrid workshops={workshops} />

  return <Typography variant="body1">Looks like you haven't attended any workshops.</Typography>
}

const WorkshopGrid = ({ workshops }) => (
  <Grid container spacing={4}>
    {workshops.map((workshop, index) =>
      <Grid item key={index} xs={12} sm={12} md={6} lg={5} xl={4}>
        <Workshop workshop={workshop} />
      </Grid>
    )}
  </Grid>
)

const Workshop = ({ workshop }) => {
  const { classes } = useStyles()
  const [user] = useUser()
  const isHost = user.id == workshop.creator_id
  const isOrganizer = workshop.organizers && workshop.organizers.some(o => o.id == user.id)

  return (
    <Link underline='none' href={`workshops/${workshop.id}`}>
      <SummaryCard 
        title={workshop.title} 
        subtitle={
          <>
            <div className={classes.nowrap}>
              Enrollment: <DateRange date1={workshop.enrollment_begins} date2={workshop.enrollment_ends} hideTime />
            </div>
            <div className={classes.nowrap}>
              Workshop: <DateRange date1={workshop.start_date} date2={workshop.end_date} />
            </div>
          </>
        }
        description={workshop.description}
        icon={<EventIcon />}
        action={
          <>
            <span style={{whiteSpace: 'nowrap', paddingLeft: '0.5em', minHeight: '2em'}}>
              {isHost 
                ? <b>You are the workshop host</b>
                : (isOrganizer ? <b>You are a workshop organizer</b> : null)
              }
            </span>
            {!workshop.is_public &&
              <Button disabled startIcon={<VisibilityOffIcon />} style={{width: '100%', justifyContent: 'flex-end'}}>private</Button>
            }
          </>
        }
        largeHeader
      />
    </Link>
  )
}

export async function getServerSideProps({ req }) {
  try {
    // Check if API is available
    if (!req.api) {
      console.error('API middleware not available on request object')
      return { props: { workshops: [] } }
    }

    const workshops = await req.api.workshops()

    // Handle case where API returns undefined or null
    if (workshops === undefined || workshops === null) {
      console.warn('Workshops API returned undefined/null')
      return { props: { workshops: [] } }
    }

    // Handle case where API returns array directly (expected case)
    if (Array.isArray(workshops)) {
      return { props: { workshops } }
    }

    // Handle case where API returns an object with workshops property (fallback)
    if (workshops && typeof workshops === 'object' && workshops.workshops && Array.isArray(workshops.workshops)) {
      console.warn('API returned workshops wrapped in object, using workshops.workshops')
      return { props: { workshops: workshops.workshops } }
    }

    // Fallback for any other case
    console.warn('Unexpected workshops API response format:', typeof workshops, workshops)
    return { props: { workshops: [] } }

  } catch (error) {
    console.error('Failed to fetch workshops:', error)
    return { props: { workshops: [] } }
  }
}

export default Workshops