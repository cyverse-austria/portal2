import React from 'react'
import {
    Container,
    Grid,
    Box,
    Typography,
    Button,
    Divider,
} from '@mui/material'
import { Layout, Section, User, Conversations } from '../../../components'
import { useError, withGetServerSideError } from '../../../contexts/error'
import { useAPI } from '../../../contexts/api'
import { useUser } from '../../../contexts/user'
import { makeStyles } from '../../../styles/tss'

//FIXME duplicated elsewhere
const useStyles = makeStyles()(theme => ({
    box: {
        marginBottom: '2em',
    },
    divider: {
        marginTop: '1em',
        marginBottom: '1em',
    },
}))

const AccessRequest = props => {
    const api = useAPI()
    const [me] = useUser()
    const [_, setError] = useError()
    const [request, setRequest] = React.useState(props.request)

    const updateStatus = async status => {
        try {
            await api.updateServiceRequest(request.id, {
                status,
                message: `Request ${status} by ${me.username}`,
            })
            const newRequest = await api.serviceRequest(request.id)
            setRequest(newRequest)
        } catch (error) {
            console.log(error)
            setError(error.message)
        }
    }

    return (
        <Layout title={request.service.name} breadcrumbs>
            <Container maxWidth="lg">
                <h1>Access Request</h1>
                <Grid container spacing={4}>
                    <Grid item xs={6}>
                        <Section title="User">
                            <User summaryOnly {...request.user} />
                        </Section>
                        <Questions
                            questions={request.service.questions}
                            answers={request.answers}
                        />
                        <History logs={request.logs} />
                    </Grid>
                    <Grid item xs={6}>
                        <Actions
                            request={request}
                            updateHandler={updateStatus}
                        />
                        <Section title="Conversations">
                            <Conversations
                                conversations={request.conversations}
                            />
                        </Section>
                    </Grid>
                </Grid>
            </Container>
        </Layout>
    )
}

const Questions = ({ questions, answers }) => {
    const { classes } = useStyles()

    const answersByQuestionId = {}
    answers.forEach(
        a => (answersByQuestionId[a.access_request_question_id] = a)
    )

    return (
        <Section title="Questions">
            {questions && questions.length > 0
                ? questions.map((question, index) => (
                      <div key={index}>
                          <Typography>{question.question}</Typography>
                          <Typography style={{ color: 'gray' }}>
                              {question.id in answersByQuestionId
                                  ? answersByQuestionId[question.id].value_text
                                  : '<No answer>'}
                          </Typography>
                      </div>
                  ))
                : 'None'}
        </Section>
    )
}

const Actions = ({ request, updateHandler }) => {
    const approveButton = (
        <Button
            color="primary"
            size="medium"
            onClick={() => updateHandler('approved')}
        >
            APPROVE
        </Button>
    )
    const denyButton = (
        <Button
            color="secondary"
            size="medium"
            onClick={() => updateHandler('denied')}
        >
            DENY
        </Button>
    )

    let buttons, text
    switch (request.status) {
        case 'requested':
            buttons = [denyButton, approveButton]
            break

        case 'pending':
            buttons = [denyButton, approveButton]
            break

        case 'approved':
            text =
                'User has been approved for access, but access has not yet been granted. The request is currently being processed and should change to "granted" shortly.'
            break

        case 'granted':
            text =
                'No further actions can be performed on requests that have been granted.'
            break

        case 'denied':
            buttons = [approveButton]
            break
    }

    return (
        <Section title="Actions">
            <Typography gutterBottom>
                User has requested access to <b>{request.service.name}</b> and
                the request is currently <b>{request.status}</b>.
            </Typography>
            <Typography>{text}</Typography>
            <Box display="flex" justifyContent="flex-end">
                {buttons}
            </Box>
        </Section>
    )
}

const History = ({ logs }) => {
    const { classes } = useStyles()

    return (
        <Section title="History">
            {logs.map((log, i) => (
                <Box key={i}>
                    <Typography>{log.message}</Typography>
                    <Typography variant="subtitle2" color="textSecondary">
                        {new Date(log.created_at).toLocaleString()}
                    </Typography>
                    {i == logs.length - 1 ? (
                        <></>
                    ) : (
                        <Divider className={classes.divider} />
                    )}
                </Box>
            ))}
        </Section>
    )
}

export async function getServerSideProps({ req, query }) {
    const request = await req.api.serviceRequest(query.id)
    return { props: { request } }
}

export default AccessRequest
