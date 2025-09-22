import React from 'react'
import {
    Card,
    CardHeader,
    CardContent,
    CardActions,
    Typography,
    Avatar,
    Box,
} from '@mui/material'
import { makeStyles } from '../styles/tss'

const useStyles = makeStyles()(theme => ({
    card: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    avatarWrapper: {
        padding: '6px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flexGrow: 1,
        minHeight: '4.5em',
        padding: '12px 16px',
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
    description: {
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        lineHeight: '1.5em',
        maxHeight: '3em',
    },
}))

const SummaryCard = ({
    title,
    subtitle,
    description,
    iconUrl,
    icon,
    action,
    largeHeader,
}) => {
    const { classes } = useStyles()

    return (
        <Card className={classes.card}>
            <CardHeader
                style={{
                    height: largeHeader ? '6em' : '4em',
                    padding: '12px',
                }}
                avatar={
                    (icon || iconUrl) && (
                        <div className={classes.avatarWrapper}>
                            <Avatar
                                alt={title}
                                src={iconUrl}
                                className={classes.avatar}
                                variant="square"
                            >
                                {icon}
                            </Avatar>
                        </div>
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
                    className={classes.description}
                >
                    {description}
                </Typography>
            </CardContent>
            {action && (
                <CardActions style={{ padding: '8px 16px' }}>
                    {action}
                </CardActions>
            )}
        </Card>
    )
}

export default SummaryCard
