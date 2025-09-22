import React from 'react'
import clsx from 'clsx'
import getConfig from 'next/config'
import { useRouter } from 'next/router'
import {
    Container,
    Box,
    Divider,
    Button,
    IconButton,
    Typography,
    Tooltip,
    Toolbar,
    AppBar,
    Drawer,
    CssBaseline,
    Snackbar,
    useMediaQuery,
} from '@mui/material'
import { Alert, AlertTitle } from '@mui/material'
import {
    Menu as MenuIcon,
    ChevronLeft as ChevronLeftIcon,
    AccountCircle as PersonIcon,
} from '@mui/icons-material'
import { makeStyles } from '../styles/tss'
import SideBar from './SideBar'
import TopBar from './TopBar'
import MainLogo from './MainLogo'
import { CustomIntercom } from './CustomIntercom'
import { useUser } from '../contexts/user'
import { useAPI } from '../contexts/api'
import { useError } from '../contexts/error'
import { useSuccess } from '../contexts/success'
// import { ACCOUNT_UPDATE_REMINDER_COOKIE } from '../constants'

const drawerWidth = 235

const useStyles = makeStyles()(theme => ({
    root: {
        display: 'flex',
        backgroundColor: '#EEEEEE',
    },
    toolbar: {
        paddingRight: 24, // keep right padding when drawer closed
    },
    toolbarIcon: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar,
    },
    appBarIcon: {
        color: 'white',
    },
    appBar: {
        backgroundColor: '#084060',
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
        [theme.breakpoints.down('sm')]: {
            width: '100%',
        },
    },
    menuButton: {
        marginRight: 36,
    },
    menuButtonHidden: {
        display: 'none',
    },
    drawerPaper: {
        position: 'relative',
        height: '100vh',
        whiteSpace: 'nowrap',
        width: drawerWidth,
        color: '#ffffff',
        backgroundColor: '#212121',
        backgroundImage:
            'url(data:image/svg+xml;base64,77u/PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMDAlJz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9J2EnIGdyYWRpZW50VW5pdHM9J3VzZXJTcGFjZU9uVXNlJyB4MT0nMCcgeDI9JzAnIHkxPScwJyB5Mj0nMTAwJScgZ3JhZGllbnRUcmFuc2Zvcm09J3JvdGF0ZSgxNjgsODMzLDQ1MCknPjxzdG9wIG9mZnNldD0nMCcgc3RvcC1jb2xvcj0nIzA4NDA2MCcvPjxzdG9wIG9mZnNldD0nMScgc3RvcC1jb2xvcj0nIzAwMDAwMCcvPjwvbGluZWFyR3JhZGllbnQ+PHBhdHRlcm4gcGF0dGVyblVuaXRzPSd1c2VyU3BhY2VPblVzZScgaWQ9J2InIHdpZHRoPSc1NDAnIGhlaWdodD0nNDUwJyB4PScwJyB5PScwJyB2aWV3Qm94PScwIDAgMTA4MCA5MDAnPjxnIGZpbGwtb3BhY2l0eT0nMC4wNCc+PHBvbHlnb24gZmlsbD0nIzQ0NCcgcG9pbnRzPSc5MCAxNTAgMCAzMDAgMTgwIDMwMCcvPjxwb2x5Z29uIHBvaW50cz0nOTAgMTUwIDE4MCAwIDAgMCcvPjxwb2x5Z29uIGZpbGw9JyNBQUEnIHBvaW50cz0nMjcwIDE1MCAzNjAgMCAxODAgMCcvPjxwb2x5Z29uIGZpbGw9JyNEREQnIHBvaW50cz0nNDUwIDE1MCAzNjAgMzAwIDU0MCAzMDAnLz48cG9seWdvbiBmaWxsPScjOTk5JyBwb2ludHM9JzQ1MCAxNTAgNTQwIDAgMzYwIDAnLz48cG9seWdvbiBwb2ludHM9JzYzMCAxNTAgNTQwIDMwMCA3MjAgMzAwJy8+PHBvbHlnb24gZmlsbD0nI0RERCcgcG9pbnRzPSc2MzAgMTUwIDcyMCAwIDU0MCAwJy8+PHBvbHlnb24gZmlsbD0nIzQ0NCcgcG9pbnRzPSc4MTAgMTUwIDcyMCAzMDAgOTAwIDMwMCcvPjxwb2x5Z29uIGZpbGw9JyNGRkYnIHBvaW50cz0nODEwIDE1MCA5MDAgMCA3MjAgMCcvPjxwb2x5Z29uIGZpbGw9JyNEREQnIHBvaW50cz0nOTkwIDE1MCA5MDAgMzAwIDEwODAgMzAwJy8+PHBvbHlnb24gZmlsbD0nIzQ0NCcgcG9pbnRzPSc5OTAgMTUwIDEwODAgMCA5MDAgMCcvPjxwb2x5Z29uIGZpbGw9JyNEREQnIHBvaW50cz0nOTAgNDUwIDAgNjAwIDE4MCA2MDAnLz48cG9seWdvbiBwb2ludHM9JzkwIDQ1MCAxODAgMzAwIDAgMzAwJy8+PHBvbHlnb24gZmlsbD0nIzY2NicgcG9pbnRzPScyNzAgNDUwIDE4MCA2MDAgMzYwIDYwMCcvPjxwb2x5Z29uIGZpbGw9JyNBQUEnIHBvaW50cz0nMjcwIDQ1MCAzNjAgMzAwIDE4MCAzMDAnLz48cG9seWdvbiBmaWxsPScjREREJyBwb2ludHM9JzQ1MCA0NTAgMzYwIDYwMCA1NDAgNjAwJy8+PHBvbHlnb24gZmlsbD0nIzk5OScgcG9pbnRzPSc0NTAgNDUwIDU0MCAzMDAgMzYwIDMwMCcvPjxwb2x5Z29uIGZpbGw9JyM5OTknIHBvaW50cz0nNjMwIDQ1MCA1NDAgNjAwIDcyMCA2MDAnLz48cG9seWdvbiBmaWxsPScjRkZGJyBwb2ludHM9JzYzMCA0NTAgNzIwIDMwMCA1NDAgMzAwJy8+PHBvbHlnb24gcG9pbnRzPSc4MTAgNDUwIDcyMCA2MDAgOTAwIDYwMCcvPjxwb2x5Z29uIGZpbGw9JyNEREQnIHBvaW50cz0nODEwIDQ1MCA5MDAgMzAwIDcyMCAzMDAnLz48cG9seWdvbiBmaWxsPScjQUFBJyBwb2ludHM9Jzk5MCA0NTAgOTAwIDYwMCAxMDgwIDYwMCcvPjxwb2x5Z29uIGZpbGw9JyM0NDQnIHBvaW50cz0nOTkwIDQ1MCAxMDgwIDMwMCA5MDAgMzAwJy8+PHBvbHlnb24gZmlsbD0nIzIyMicgcG9pbnRzPSc5MCA3NTAgMCA5MDAgMTgwIDkwMCcvPjxwb2x5Z29uIHBvaW50cz0nMjcwIDc1MCAxODAgOTAwIDM2MCA5MDAnLz48cG9seWdvbiBmaWxsPScjREREJyBwb2ludHM9JzI3MCA3NTAgMzYwIDYwMCAxODAgNjAwJy8+PHBvbHlnb24gcG9pbnRzPSc0NTAgNzUwIDU0MCA2MDAgMzYwIDYwMCcvPjxwb2x5Z29uIHBvaW50cz0nNjMwIDc1MCA1NDAgOTAwIDcyMCA5MDAnLz48cG9seWdvbiBmaWxsPScjNDQ0JyBwb2ludHM9JzYzMCA3NTAgNzIwIDYwMCA1NDAgNjAwJy8+PHBvbHlnb24gZmlsbD0nI0FBQScgcG9pbnRzPSc4MTAgNzUwIDcyMCA5MDAgOTAwIDkwMCcvPjxwb2x5Z29uIGZpbGw9JyM2NjYnIHBvaW50cz0nODEwIDc1MCA5MDAgNjAwIDcyMCA2MDAnLz48cG9seWdvbiBmaWxsPScjOTk5JyBwb2ludHM9Jzk5MCA3NTAgOTAwIDkwMCAxMDgwIDkwMCcvPjxwb2x5Z29uIGZpbGw9JyM5OTknIHBvaW50cz0nMTgwIDAgOTAgMTUwIDI3MCAxNTAnLz48cG9seWdvbiBmaWxsPScjNDQ0JyBwb2ludHM9JzM2MCAwIDI3MCAxNTAgNDUwIDE1MCcvPjxwb2x5Z29uIGZpbGw9JyNGRkYnIHBvaW50cz0nNTQwIDAgNDUwIDE1MCA2MzAgMTUwJy8+PHBvbHlnb24gcG9pbnRzPSc5MDAgMCA4MTAgMTUwIDk5MCAxNTAnLz48cG9seWdvbiBmaWxsPScjMjIyJyBwb2ludHM9JzAgMzAwIC05MCA0NTAgOTAgNDUwJy8+PHBvbHlnb24gZmlsbD0nI0ZGRicgcG9pbnRzPScwIDMwMCA5MCAxNTAgLTkwIDE1MCcvPjxwb2x5Z29uIGZpbGw9JyNGRkYnIHBvaW50cz0nMTgwIDMwMCA5MCA0NTAgMjcwIDQ1MCcvPjxwb2x5Z29uIGZpbGw9JyM2NjYnIHBvaW50cz0nMTgwIDMwMCAyNzAgMTUwIDkwIDE1MCcvPjxwb2x5Z29uIGZpbGw9JyMyMjInIHBvaW50cz0nMzYwIDMwMCAyNzAgNDUwIDQ1MCA0NTAnLz48cG9seWdvbiBmaWxsPScjRkZGJyBwb2ludHM9JzM2MCAzMDAgNDUwIDE1MCAyNzAgMTUwJy8+PHBvbHlnb24gZmlsbD0nIzQ0NCcgcG9pbnRzPSc1NDAgMzAwIDQ1MCA0NTAgNjMwIDQ1MCcvPjxwb2x5Z29uIGZpbGw9JyMyMjInIHBvaW50cz0nNTQwIDMwMCA2MzAgMTUwIDQ1MCAxNTAnLz48cG9seWdvbiBmaWxsPScjQUFBJyBwb2ludHM9JzcyMCAzMDAgNjMwIDQ1MCA4MTAgNDUwJy8+PHBvbHlnb24gZmlsbD0nIzY2NicgcG9pbnRzPSc3MjAgMzAwIDgxMCAxNTAgNjMwIDE1MCcvPjxwb2x5Z29uIGZpbGw9JyNGRkYnIHBvaW50cz0nOTAwIDMwMCA4MTAgNDUwIDk5MCA0NTAnLz48cG9seWdvbiBmaWxsPScjOTk5JyBwb2ludHM9JzkwMCAzMDAgOTkwIDE1MCA4MTAgMTUwJy8+PHBvbHlnb24gcG9pbnRzPScwIDYwMCAtOTAgNzUwIDkwIDc1MCcvPjxwb2x5Z29uIGZpbGw9JyM2NjYnIHBvaW50cz0nMCA2MDAgOTAgNDUwIC05MCA0NTAnLz48cG9seWdvbiBmaWxsPScjQUFBJyBwb2ludHM9JzE4MCA2MDAgOTAgNzUwIDI3MCA3NTAnLz48cG9seWdvbiBmaWxsPScjNDQ0JyBwb2ludHM9JzE4MCA2MDAgMjcwIDQ1MCA5MCA0NTAnLz48cG9seWdvbiBmaWxsPScjNDQ0JyBwb2ludHM9JzM2MCA2MDAgMjcwIDc1MCA0NTAgNzUwJy8+PHBvbHlnb24gZmlsbD0nIzk5OScgcG9pbnRzPSczNjAgNjAwIDQ1MCA0NTAgMjcwIDQ1MCcvPjxwb2x5Z29uIGZpbGw9JyM2NjYnIHBvaW50cz0nNTQwIDYwMCA2MzAgNDUwIDQ1MCA0NTAnLz48cG9seWdvbiBmaWxsPScjMjIyJyBwb2ludHM9JzcyMCA2MDAgNjMwIDc1MCA4MTAgNzUwJy8+PHBvbHlnb24gZmlsbD0nI0ZGRicgcG9pbnRzPSc5MDAgNjAwIDgxMCA3NTAgOTkwIDc1MCcvPjxwb2x5Z29uIGZpbGw9JyMyMjInIHBvaW50cz0nOTAwIDYwMCA5OTAgNDUwIDgxMCA0NTAnLz48cG9seWdvbiBmaWxsPScjREREJyBwb2ludHM9JzAgOTAwIDkwIDc1MCAtOTAgNzUwJy8+PHBvbHlnb24gZmlsbD0nIzQ0NCcgcG9pbnRzPScxODAgOTAwIDI3MCA3NTAgOTAgNzUwJy8+PHBvbHlnb24gZmlsbD0nI0ZGRicgcG9pbnRzPSczNjAgOTAwIDQ1MCA3NTAgMjcwIDc1MCcvPjxwb2x5Z29uIGZpbGw9JyNBQUEnIHBvaW50cz0nNTQwIDkwMCA2MzAgNzUwIDQ1MCA3NTAnLz48cG9seWdvbiBmaWxsPScjRkZGJyBwb2ludHM9JzcyMCA5MDAgODEwIDc1MCA2MzAgNzUwJy8+PHBvbHlnb24gZmlsbD0nIzIyMicgcG9pbnRzPSc5MDAgOTAwIDk5MCA3NTAgODEwIDc1MCcvPjxwb2x5Z29uIGZpbGw9JyMyMjInIHBvaW50cz0nMTA4MCAzMDAgOTkwIDQ1MCAxMTcwIDQ1MCcvPjxwb2x5Z29uIGZpbGw9JyNGRkYnIHBvaW50cz0nMTA4MCAzMDAgMTE3MCAxNTAgOTkwIDE1MCcvPjxwb2x5Z29uIHBvaW50cz0nMTA4MCA2MDAgOTkwIDc1MCAxMTcwIDc1MCcvPjxwb2x5Z29uIGZpbGw9JyM2NjYnIHBvaW50cz0nMTA4MCA2MDAgMTE3MCA0NTAgOTkwIDQ1MCcvPjxwb2x5Z29uIGZpbGw9JyNEREQnIHBvaW50cz0nMTA4MCA5MDAgMTE3MCA3NTAgOTkwIDc1MCcvPjwvZz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHg9JzAnIHk9JzAnIGZpbGw9J3VybCgjYSknIHdpZHRoPScxMDAlJyBoZWlnaHQ9JzEwMCUnLz48cmVjdCB4PScwJyB5PScwJyBmaWxsPSd1cmwoI2IpJyB3aWR0aD0nMTAwJScgaGVpZ2h0PScxMDAlJy8+PC9zdmc+)',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerPaperClose: {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(9),
    },
    appBarSpacer: {
        ...theme.mixins.toolbar,
    },
    content: {
        flexGrow: 1,
        height: '100vh',
        overflow: 'auto',
        backgroundColor: '#EEEEEE',
    },
    container: {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(5),
        paddingLeft: theme.spacing(5),
        paddingRight: theme.spacing(5),
        width: '100%',
        maxWidth: 'none',
        [theme.breakpoints.down('md')]: {
            paddingLeft: theme.spacing(4),
            paddingRight: theme.spacing(4),
        },
    },
    paper: {
        padding: theme.spacing(2),
        display: 'flex',
        overflow: 'auto',
        flexDirection: 'column',
    },
    fixedHeight: {
        height: 240,
    },
}))

function Copyright() {
    return (
        <Typography variant="body2" color="textSecondary" align="center">
            {'Copyright © '}
            CyVerse {new Date().getFullYear()}
        </Typography>
    )
}

export default function Dashboard(props) {
    const config = getConfig().publicRuntimeConfig
    const { classes } = useStyles()
    const [user, setUser] = useUser()
    const api = useAPI()
    const [error, setError] = useError()
    const [success, setSuccess] = useSuccess()
    const router = useRouter()

    const isSmallScreen = useMediaQuery(theme => theme.breakpoints.down('sm'))
    const isMediumScreen = useMediaQuery(theme => theme.breakpoints.down('md'))

    const [drawerOpen, setDrawerOpen] = React.useState(
        !user.settings || user.settings.drawerOpen
    )

    // const [cookies, setCookie] = useCookies([ACCOUNT_UPDATE_REMINDER_COOKIE])
    // const [alertOpen, setAlertOpen] = React.useState(!cookies || !(ACCOUNT_UPDATE_REMINDER_COOKIE in cookies))

    const oneYearFromToday = new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
    )
    const oneYearBeforeToday = new Date(
        new Date().setFullYear(new Date().getFullYear() - 1)
    )

    // const handleCloseAlert = (url) => {
    //   // Show annual reminder to update account info if at least one year since user joined
    //   if (new Date(user.date_joined) < oneYearBeforeToday) {
    //     setCookie(
    //       ACCOUNT_UPDATE_REMINDER_COOKIE,
    //       '', // empty cookie
    //       {
    //         path: '/',
    //         expires: oneYearFromToday
    //       }
    //     )
    //   }

    //   setAlertOpen(false)
    //   if (url)
    //     router.push(url)
    // }

    // Persist drawer state in user settings
    const handleDrawerEvent = async open => {
        setDrawerOpen(open)
        const newUser = await api.updateUser(user.id, {
            settings: { ...user.settings, drawerOpen: open },
        })
        setUser(newUser)
    }

    return (
        <div className={classes.root}>
            <CssBaseline />
            <AppBar
                position="absolute"
                className={clsx(
                    classes.appBar,
                    drawerOpen && classes.appBarShift
                )}
            >
                <Toolbar className={classes.toolbar}>
                    <IconButton
                        edge="start"
                        aria-label="open drawer"
                        color="inherit"
                        onClick={() => handleDrawerEvent(true)}
                        className={clsx(
                            classes.menuButton,
                            drawerOpen && classes.menuButtonHidden
                        )}
                        size="large"
                    >
                        <MenuIcon />
                    </IconButton>
                    <MainLogo size="medium" />
                    <div style={{ flexGrow: 1 }} />
                    {config.INTERCOM_ENABLED && <CustomIntercom />}

                    {!isSmallScreen ? (
                        <Tooltip title="Manage your account">
                            <Button
                                variant="text"
                                color="inherit"
                                size="large"
                                startIcon={<PersonIcon />}
                                href="/account"
                            >
                                Account
                            </Button>
                        </Tooltip>
                    ) : (
                        <IconButton
                            className={classes.appBarIcon}
                            href="/account"
                            size="large"
                        >
                            <PersonIcon />
                        </IconButton>
                    )}
                </Toolbar>
            </AppBar>

            {!isSmallScreen && (
                <Drawer
                    variant="permanent"
                    classes={{
                        paper: clsx(
                            classes.drawerPaper,
                            !drawerOpen && classes.drawerPaperClose
                        ),
                    }}
                    open={drawerOpen}
                >
                    <div className={classes.toolbarIcon}>
                        <IconButton
                            onClick={() => handleDrawerEvent(false)}
                            size="large"
                        >
                            <ChevronLeftIcon className={classes.appBarIcon} />
                        </IconButton>
                    </div>
                    <Divider />
                    <SideBar
                        open={drawerOpen}
                        showStaff={user && user.is_staff}
                    />
                </Drawer>
            )}

            {isMediumScreen && (
                <Drawer
                    variant="permanent"
                    classes={{
                        paper: clsx(
                            classes.drawerPaper,
                            classes.drawerPaperClose
                        ),
                    }}
                    open={false}
                >
                    <Divider />
                    <SideBar open={false} showStaff={user && user.is_staff} />
                </Drawer>
            )}

            <main className={classes.content}>
                <div className={classes.appBarSpacer} />
                <TopBar
                    title={props.title}
                    breadcrumbs={props.breadcrumbs}
                    back={props.back}
                    actions={props.actions}
                />
                <Container
                    className={classes.container}
                    disableGutters
                    maxWidth={false}
                >
                    {props.children}
                    <Box pt={10}>
                        <Copyright />
                    </Box>
                </Container>
            </main>
            <Snackbar
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                open={!!error}
            >
                <Alert
                    elevation={6}
                    variant="filled"
                    severity="error"
                    onClose={() => setError(null)}
                >
                    <AlertTitle>Oops! An error occurred:</AlertTitle>
                    {error}
                </Alert>
            </Snackbar>
            <Snackbar
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                open={!!success}
                autoHideDuration={6000}
                onClose={() => setSuccess(null)}
            >
                <Alert
                    elevation={6}
                    variant="filled"
                    severity="success"
                    onClose={() => setSuccess(null)}
                >
                    {success}
                </Alert>
            </Snackbar>
            {/* <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={alertOpen}
        message="Hi! Please update your Account Information to make sure everything is current."
        action={
          <React.Fragment>
            <Button color="secondary" size="small" onClick={() => handleCloseAlert("/account")}>
              UPDATE
            </Button>
            <IconButton size="small" aria-label="close" color="inherit" onClick={() => handleCloseAlert()}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        }
      /> */}
        </div>
    )
}
