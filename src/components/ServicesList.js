import React from 'react'
import {
    Grid,
    Link,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    IconButton,
} from '@mui/material'
import { Delete as DeleteIcon } from '@mui/icons-material'
const inlineIcons = require('../inline_icons.json')

const ServicesList = ({ services, onDelete }) => (
    <List>
        {services &&
            services.map((service, index) => {
                // Icons were moved inline for performance //TODO move into component
                const icon_url =
                    service.icon_url in inlineIcons
                        ? inlineIcons[service.icon_url]
                        : service.icon_url

                return (
                    <Grid
                        container
                        key={index}
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Grid item>
                            <Link underline="none" href={service.service_url}>
                                <ListItem>
                                    <ListItemAvatar>
                                        <Avatar src={icon_url} />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={service.name}
                                        secondary={service.description}
                                    />
                                </ListItem>
                            </Link>
                        </Grid>
                        {onDelete && (
                            <Grid item>
                                <IconButton
                                    onClick={() => onDelete(service.id)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Grid>
                        )}
                    </Grid>
                )
            })}
    </List>
)

export default ServicesList
