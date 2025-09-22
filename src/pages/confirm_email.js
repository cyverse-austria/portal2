import React from 'react'
import { Grid, Box, Button, Typography } from '@mui/material'
import { MainLogo } from '../components'
import { withGetServerSideError } from '../contexts/error'
import { makeStyles } from '../styles/tss'

//FIXME Duplicated in welcome.js
const useStyles = makeStyles()(theme => ({
    grid: {
        height: '100vh',
        width: '50vw',
    },
    button: {
        width: '25vw',
    },
    title: {
        color: '#0971ab',
        fontWeight: 'bold',
    },
}))

const ConfirmEmail = props => {
    const { classes } = useStyles()

    return (
        <div>
            <Grid container direction="row">
                <Grid
                    item
                    align="center"
                    className={classes.grid}
                    style={{ backgroundColor: '#0971ab' }}
                >
                    <Left {...props} />
                </Grid>
                <Grid item align="center" className={classes.grid}>
                    <Right {...props} />
                </Grid>
            </Grid>
        </div>
    )
}

//FIXME Duplicated in welcome.js
const Left = () => {
    return (
        <div>
            <Box pt={'30vh'}>
                <MainLogo size="large" />
            </Box>
            <Box pt={'2em'} p={'6em'}>
                <Typography variant="h5" style={{ color: 'white' }}>
                    The Open Science Workspace for
                    <br />
                    Collaborative Data-driven Discovery
                </Typography>
            </Box>
        </div>
    )
}

const Right = ({ confirmed, response }) => {
    const message = confirmed ? (
        <>
            Thanks! Your email address was confirmed.
            <br />
            <br />
            Please sign in to continue.
        </>
    ) : (
        <>An error occurred: {response}</>
    )

    return (
        <div>
            <Box pt={'30vh'} style={{ width: '30vw' }}>
                {confirmed ? (
                    <Typography variant="h4" color="primary">
                        {message}
                    </Typography>
                ) : (
                    <Typography variant="h4" color="error">
                        An error occurred: {response}
                    </Typography>
                )}
            </Box>
            <Box mt={5}>
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    href="/login"
                    style={{ width: '10em' }}
                >
                    Sign In
                </Button>
            </Box>
        </div>
    )
}

export async function getServerSideProps({ req, res }) {
    // Require "code" query param
    if (!req.query.code) res.redirect('/')

    const response = await req.api.confirmEmailAddress(req.query.code)

    return {
        props: {
            confirmed: response === 'success',
            response,
        },
    }
}

export default ConfirmEmail
