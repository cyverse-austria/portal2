import React from 'react'
import {
    Card,
    CardHeader,
    CardContent,
    CardActions,
    Typography,
    Avatar,
} from '@mui/material'
import { makeStyles } from '../styles/tss'

const useStyles = makeStyles()(theme => ({
    avatar: {
        backgroundColor: '#ffff',
        color: '#0971ab',
        width: '40px',
        height: '40px',
    },
    content: {
        minHeight: '6em',
    },
    title: {
        lineHeight: '1.1',
        fontSize: '1.4em',
        [theme.breakpoints.down('md')]: {
            fontSize: '1.4em',
        },
        [theme.breakpoints.down('xs')]: {
            fontSize: '1.2em',
            fontWeight: '400',
        },
    },
}))

const HelpCard = ({
    largeHeader,
    title,
    subtitle,
    description,
    iconUrl,
    icon,
    action,
}) => {
    // use icon or iconUrl but not both
    const { classes } = useStyles()

    return (
        <Card>
            <CardHeader
                style={{ height: largeHeader ? '7em' : '5em' }}
                avatar={
                    (icon || iconUrl) && (
                        <Avatar
                            alt={title}
                            src={iconUrl}
                            className={classes.avatar}
                            variant="square"
                        >
                            {icon}
                        </Avatar>
                    )
                }
                title={title}
                subheader={subtitle}
                titleTypographyProps={{ className: classes.title }}
            />
            <CardContent className={classes.content}>
                <Typography
                    variant="body2"
                    color="textPrimary"
                    component="p"
                    className={classes.descriptionText}
                >
                    {description}
                </Typography>
            </CardContent>
            <CardActions>{action}</CardActions>
        </Card>
    )
}

export default HelpCard
