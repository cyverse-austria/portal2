import React from 'react'
import Link from 'next/link'
import { makeStyles } from '../../styles/tss'
import {
    Container,
    Paper,
    Typography,
    TableContainer,
    Table,
    TableBody,
    TableRow,
    TableCell,
} from '@mui/material'
import { Layout } from '../../components'
import { withGetServerSideError } from '../../contexts/error'

//FIXME duplicated elsewhere
const useStyles = makeStyles()(theme => ({
    paper: {
        padding: '3em',
    },
}))

const Services = props => {
    const { classes } = useStyles()

    return (
        <Layout breadcrumbs>
            <Container maxWidth="lg">
                <br />
                <Paper elevation={3} className={classes.paper}>
                    <Typography component="h1" variant="h4" gutterBottom>
                        Services
                    </Typography>
                    <ServicesTable {...props} />
                </Paper>
            </Container>
        </Layout>
    )
}

const ServicesTable = ({ services }) => (
    <TableContainer component={Paper}>
        <Table>
            <TableBody>
                {services.map((service, index) => (
                    <TableRow key={index} hover style={{ cursor: 'pointer' }}>
                        <TableCell>
                            <Link
                                href={`/services/${service.id}`}
                                style={{ textDecoration: 'none' }}
                            >
                                <div>
                                    <b>{service.name}</b>
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
    const services = await req.api.services()
    return { props: { services } }
}

export default Services
