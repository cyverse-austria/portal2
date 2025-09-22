import React from 'react'
import {
    Container,
    Grid,
    FormControlLabel,
    TextField,
    Checkbox,
} from '@mui/material'
import { Layout, Section, User, Conversations } from '../../../components'
import { withGetServerSideError } from '../../../contexts/error'
import { makeStyles } from '../../../styles/tss'

//FIXME duplicated elsewhere
const useStyles = makeStyles()(theme => ({
    box: {
        marginBottom: '2em',
    },
    paper: {
        padding: '2em',
        marginBottom: '2em',
    },
}))

const FormSubmission = ({ submission }) => (
    <Layout title={submission.form.name} breadcrumbs>
        <Container maxWidth="lg">
            <h1>Form Submission</h1>
            <Grid container spacing={4}>
                <Grid item xs={6}>
                    <Section title="User">
                        <User summaryOnly {...submission.user} />
                    </Section>
                    <Section title="Conversations">
                        <Conversations
                            conversations={submission.conversations}
                        />
                    </Section>
                </Grid>
                <Grid item xs={6}>
                    <Form form={submission.form} fields={submission.fields} />
                </Grid>
            </Grid>
        </Container>
    </Layout>
)

const Form = ({ form, fields }) => (
    <Section title="Form" subtitle={form.name}>
        {fields.map((field, index) => (
            // <Typography>{field.name}: {field.api_formfieldsubmission.value_text}</Typography>
            <FormField key={index} {...field}></FormField>
        ))}
    </Section>
)

//FIXME replace with Form.js component
const FormField = props => {
    if (props.api_formfieldsubmission.value_boolean != null) {
        return (
            <FormControlLabel
                control={
                    <Checkbox
                        checked={props.value}
                        name={props.id}
                        disabled={true}
                    />
                }
                label={props.name}
            />
        )
    }

    return (
        // type is 'char', 'text', or 'select'
        <TextField
            required={props.is_required}
            disabled={true}
            fullWidth
            margin="normal"
            id={props.id.toString()}
            label={props.name}
            helperText={props.description}
            defaultValue={props.value}
        ></TextField>
    )
}

export async function getServerSideProps({ req, query }) {
    const submission = await req.api.formSubmission(query.id)
    return { props: { submission } }
}

export default FormSubmission
