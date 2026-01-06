import { Box, Container, Paper, Typography } from '@mui/material'
import Markdown from 'markdown-to-jsx/react'
import React from 'react'
import { Layout, Wizard } from '../../components'
import { useAPI } from '../../contexts/api'
import { useError } from '../../contexts/error'
import { makeStyles } from '../../styles/tss'

const useStyles = makeStyles()(theme => ({
    formContainer: {
        maxWidth: '70vw',
        [theme.breakpoints.down('md')]: {
            maxWidth: '100vw',
        },
    },
    formTitle: {
        [theme.breakpoints.down('md')]: {
            fontSize: '1.5em',
        },
        [theme.breakpoints.down('sm')]: {
            fontSize: '1.5em',
            fontWeight: '400',
        },
    },
    paper: {
        padding: '3em',
        [theme.breakpoints.down('md')]: {
            padding: '1em',
        },
    },
}))

const Request = ({ form }) => {
    const allFields = form.sections.reduce((acc, s) => acc.concat(s.fields), [])

    const { classes } = useStyles()
    const api = useAPI()
    const [_, setError] = useError()

    const [submitted, setSubmitted] = React.useState(false)

    const initialValues = allFields.reduce((acc, f) => {
        acc[f.id.toString()] = ''
        return acc
    }, {})

    const submitForm = async submission => {
        try {
            await api.submitForm(form.id, submission)
        } catch (error) {
            console.log(error)
            setError(error.message)
        }
    }

    const formatSubmission = values => {
        return allFields.map(f => {
            return {
                id: f.id,
                type: f.type,
                value: values[f.id],
            }
        })
    }

    return (
        <Layout title={form.name} breadcrumbs>
            <Container className={classes.formContainer}>
                <Paper elevation={3} className={classes.paper}>
                    <Box>
                        <Typography
                            component="h1"
                            variant="h4"
                            gutterBottom
                            className={classes.formTitle}
                        >
                            {form.name}
                        </Typography>
                        <Typography color="textSecondary" gutterBottom>
                            {form.description}
                        </Typography>
                        {form.explanation !== form.description && (
                            <Typography color="textSecondary">
                                <Markdown>{form.explanation}</Markdown>
                            </Typography>
                        )}
                    </Box>
                    <br />
                    {submitted ? (
                        <Submitted />
                    ) : (
                        <Wizard
                            form={form}
                            initialValues={initialValues}
                            onSubmit={(values, { setSubmitting }) => {
                                submitForm(formatSubmission(values))
                                setSubmitting(false)
                                setSubmitted(true)
                            }}
                        />
                    )}
                </Paper>
            </Container>
        </Layout>
    )
}

const Submitted = () => (
    <Box mx={10} my={5}>
        <Typography component="h1" variant="h5" color="primary">
            Thanks! Your request has been submitted and will be reviewed by
            CyVerse staff.
            <br />
            <br />
            We will email you once your request has been reviewed.
        </Typography>
    </Box>
)

export async function getServerSideProps({ req, query }) {
    const form = await req.api.form(query.id)
    return { props: { form } }
}

export default Request
