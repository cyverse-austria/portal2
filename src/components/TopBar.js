import React from 'react'
import { Grid, Box, Breadcrumbs, Link, Typography, Paper } from '@mui/material'
import { makeStyles } from '../styles/tss'
import { useRouter } from 'next/router'
import { menuItems } from './menuItems.js'

const useStyles = makeStyles()(theme => ({
    title: {
        fontSize: '1.2em',
        marginLeft: '0.5em',
        fontWeight: 'normal',
        color: '#000000',
    },
    box: {
        backgroundColor: '#f5f5f5',
        padding: theme.spacing(1),
        marginBottom: theme.spacing(1),
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        [theme.breakpoints.down('xs')]: {
            display: 'none',
        },
    },
    breadcrumbs: {
        paddingTop: '0.35em',
    },
    icon: {
        marginLeft: '0.5em',
        color: '#000000',
    },
    contentWrapper: {
        height: '2.5rem',
        display: 'flex',
        alignItems: 'center',
    },
}))

const BreadcrumbsMenu = ({ parts, title }) => {
    const { classes } = useStyles()

    if (parts.length <= 1) return <></>

    return (
        <Breadcrumbs className={classes.breadcrumbs}>
            {parts.slice(0, -1).map((part, index) => (
                <Link
                    key={index}
                    color="inherit"
                    href={'/' + parts.slice(0, index + 1).join('/')}
                >
                    {capitalize(part)}
                </Link>
            ))}
            <Typography color="textPrimary">
                {title ? title : capitalize(parts.slice(-1)[0])}
            </Typography>
        </Breadcrumbs>
    )
}

const TopBar = props => {
    const { classes } = useStyles()
    const menuItem = menuItems.find(item => item.label === props.title)
    const router = useRouter()

    // Use pathname instead of asPath to exclude query parameters from breadcrumbs
    const parts = router.pathname.split('/').filter(s => s)
    const backUrl = '/' + parts.slice(0, -1).join('/')

    return (
        <Box className={classes.box}>
            <Grid container justifyContent="space-between" alignItems="center">
                <Grid item>
                    {props.back ? (
                        <div className={classes.contentWrapper}>
                            <Link color="inherit" href={backUrl}>
                                Back
                            </Link>
                        </div>
                    ) : props.breadcrumbs ? (
                        <div className={classes.contentWrapper}>
                            <BreadcrumbsMenu
                                parts={parts}
                                title={props.title}
                            />
                        </div>
                    ) : (
                        <div
                            className={classes.contentWrapper}
                            style={{ display: 'flex', alignItems: 'center' }}
                        >
                            {menuItem &&
                                React.cloneElement(menuItem.icon, {
                                    className: classes.icon,
                                })}
                            <Typography className={classes.title} noWrap>
                                {props.title}
                            </Typography>
                        </div>
                    )}
                </Grid>
                <Grid item>
                    <div className={classes.contentWrapper}>
                        {props.actions}
                    </div>
                </Grid>
            </Grid>
        </Box>
    )
}

function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1)
}

export default TopBar
