import React from 'react'
import { useState } from 'react'
import { useAPI } from '../contexts/api'
import { useError } from '../contexts/error'
import {
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Switch,
} from '@mui/material'

const MailingListForm = ({ emails, title, subtitle, userId }) => {
    return (
        <div>
            <Typography component="div" variant="h5">
                {title}
            </Typography>
            <Typography color="text.secondary" gutterBottom>
                {subtitle}
            </Typography>
            {emails.map((email, index) => (
                <Box key={index}>
                    <List>
                        {emails.length > 1 && (
                            <ListItem>
                                <Typography
                                    variant="subtitle2"
                                    color="text.secondary"
                                >
                                    {email.email}
                                </Typography>
                            </ListItem>
                        )}
                        {email.mailing_lists
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map((list, index2) => (
                                <MailingListItem
                                    key={index2}
                                    email={email}
                                    list={list}
                                    userId={userId}
                                />
                            ))}
                    </List>
                </Box>
            ))}
        </div>
    )
}

const MailingListItem = ({ userId, email, list }) => {
    const api = useAPI()
    const [_, setError] = useError()

    const [state, setState] = useState(
        list.api_emailaddressmailinglist.is_subscribed
    )

    const updateSubscription = async state => {
        try {
            await api.updateMailingListSubscription(list.id, {
                email: email.email,
                subscribe: state,
                user_id: userId,
            })
            setState(state)
        } catch (error) {
            console.log(error)
            setError(error.message)
        }
    }

    return (
        <ListItem key={list.id}>
            <ListItemText primary={list.name} />
            <ListItemSecondaryAction>
                <Switch
                    checked={state}
                    name={list.id.toString()}
                    color="primary"
                    edge="end"
                    onChange={event => updateSubscription(event.target.checked)}
                />
            </ListItemSecondaryAction>
        </ListItem>
    )
}

export default MailingListForm
