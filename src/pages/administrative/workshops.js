import React from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { makeStyles } from '../../styles/tss'
import {
    Container,
    Paper,
    Grid,
    Button,
    Typography,
    TableContainer,
    Table,
    TableBody,
    TableRow,
    TableCell,
} from '@mui/material'
import { Layout, FormDialog, DateRange } from '../../components'
import { useAPI } from '../../contexts/api'
import { withGetServerSideError } from '../../contexts/error'

//FIXME duplicated elsewhere
const useStyles = makeStyles()(theme => ({
    paper: {
        padding: '3em',
    },
}))

const Workshops = props => {
    const { classes } = useStyles()
    const router = useRouter()
    const api = useAPI()
    const [dialogOpen, setDialogOpen] = useState(false)

    const submitWorkshop = async values => {
        const response = await api.createWorkshop(values)
        console.log(response)
        //TODO handle errors
        if (response) {
            router.push(`/workshops/${response.id}`)
        }
    }

    return (
        <Layout breadcrumbs>
            <Container maxWidth="lg">
                <br />
                <Paper elevation={3} className={classes.paper}>
                    <Grid container justifyContent="space-between">
                        <Grid item>
                            <Typography
                                component="h1"
                                variant="h4"
                                gutterBottom
                            >
                                Workshops
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setDialogOpen(true)}
                            >
                                Create Workshop
                            </Button>
                        </Grid>
                    </Grid>
                    <br />
                    <WorkshopTable {...props} />
                </Paper>
            </Container>
            <FormDialog
                title="Create Workshop"
                open={dialogOpen}
                fields={[
                    {
                        id: 'title',
                        label: 'Title',
                        type: 'text',
                        required: true,
                    },
                ]}
                handleClose={() => setDialogOpen(false)}
                handleSubmit={values => {
                    setDialogOpen(false)
                    submitWorkshop(values)
                }}
            />
        </Layout>
    )
}

const WorkshopTable = ({ workshops }) => (
    <TableContainer component={Paper}>
        <Table>
            <TableBody>
                {workshops.map(workshop => (
                    <TableRow
                        key={workshop.id}
                        hover
                        style={{ cursor: 'pointer' }}
                    >
                        <TableCell>
                            <Link
                                href={`/workshops/${workshop.id}`}
                                style={{
                                    textDecoration: 'none',
                                    color: 'inherit',
                                }}
                            >
                                <div>
                                    <div>
                                        <b>{workshop.title}</b>
                                    </div>
                                    <div>
                                        Enrollment:{' '}
                                        <DateRange
                                            date1={workshop.enrollment_begins}
                                            date2={workshop.enrollment_ends}
                                            hideTime
                                        />
                                    </div>
                                    <div>
                                        Workshop:{' '}
                                        <DateRange
                                            date1={workshop.start_date}
                                            date2={workshop.end_date}
                                        />
                                    </div>
                                </div>
                            </Link>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
)

export async function getServerSideProps({ req }) {
    const workshops = await req.api.workshops()
    return { props: { workshops } }
}

export default Workshops
