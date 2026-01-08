import {
    Button,
    Container,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Typography,
} from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { FormDialog, Layout } from '../../components'
import { useAPI } from '../../contexts/api'
import { withGetServerSideError } from '../../contexts/error'
import { makeStyles } from '../../styles/tss'

//FIXME duplicated elsewhere
const useStyles = makeStyles()(theme => ({
    paper: {
        padding: '3em',
    },
}))

function Forms(props) {
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

function FormTable(props) {
    const router = useRouter()
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableBody>
                    {props.forms.map(form => (
                        <TableRow
                            key={form.id}
                            onClick={() =>
                                router.push(`/administrative/forms/${form.id}`)
                            }
                            hover
                            sx={{
                                cursor: 'pointer',
                                textDecoration: 'none',
                                color: 'inherit',
                            }}
                        >
                            <TableCell>{form.name}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export async function getServerSideProps({ req }) {
    const formsByGroup = await req.api.forms()
    const forms = formsByGroup
        .map(s => s.forms)
        .reduce((acc, forms) => acc.concat(forms))
        .sort((a, b) => (a.name > b.name ? 1 : -1))

    return { props: { forms } }
}

export default Forms
