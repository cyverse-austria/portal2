import React from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
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
import { Layout, FormDialog } from '../../components'
import { useAPI } from '../../contexts/api'
import { withGetServerSideError } from '../../contexts/error'
import { makeStyles } from '../../styles/tss'

//FIXME duplicated elsewhere
const useStyles = makeStyles()(theme => ({
    paper: {
        padding: '3em',
    },
}))

const Forms = props => {
    const { classes } = useStyles()
    const router = useRouter()
    const api = useAPI()
    const [dialogOpen, setDialogOpen] = useState(false)

    const submitForm = async values => {
        const response = await api.createForm(values)
        //TODO handle errors
        if (response) {
            router.push(`/administrative/forms/${response.id}`)
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
                                Forms
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setDialogOpen(true)}
                            >
                                Create Form
                            </Button>
                        </Grid>
                    </Grid>
                    <br />
                    <FormTable {...props} />
                </Paper>
            </Container>
            <FormDialog
                title="Create Form"
                open={dialogOpen}
                fields={[
                    {
                        id: 'name',
                        label: 'Title',
                        type: 'text',
                        required: true,
                    },
                ]}
                handleClose={() => setDialogOpen(false)}
                handleSubmit={values => {
                    setDialogOpen(false)
                    submitForm(values)
                }}
            />
        </Layout>
    )
}

const FormTable = props => (
    <TableContainer component={Paper}>
        <Table>
            <TableBody>
                {props.forms.map(form => (
                    <Link
                        key={form.id}
                        href={`/administrative/forms/${form.id}`}
                    >
                        <TableRow
                            hover
                            style={{ cursor: 'pointer' }}
                            component="a"
                        >
                            <TableCell>{form.name}</TableCell>
                        </TableRow>
                    </Link>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
)

export async function getServerSideProps({ req }) {
    const formsByGroup = await req.api.forms()
    const forms = formsByGroup
        .map(s => s.forms)
        .reduce((acc, forms) => acc.concat(forms))
        .sort((a, b) => (a.name > b.name ? 1 : -1))

    return { props: { forms } }
}

export default Forms
