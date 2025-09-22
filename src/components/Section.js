import React from 'react'
import { makeStyles } from '../styles/tss'
import { Paper, Typography } from '@mui/material'

//FIXME duplicated elsewhere
const useStyles = makeStyles()(theme => ({
    paper: {
        padding: '2em',
        marginBottom: '2em',
    },
}))

const Section = ({ title, children }) => {
    const { classes } = useStyles()

    return (
        <Paper elevation={3} className={classes.paper}>
            <Typography component="div" variant="h5">
                {title}
            </Typography>
            <br />
            {children}
        </Paper>
    )
}

export default Section
