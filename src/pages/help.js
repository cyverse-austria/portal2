import React from 'react'
import getConfig from 'next/config'
import { Grid, Link, Box, Divider, Typography } from '@mui/material'
import { Layout, intercomShow, getMenuItem } from '../components'
import { makeStyles } from '../styles/tss'
import HelpCard from '../components/HelpCard'

const useStyles = makeStyles()(theme => ({
    helpLink: {
        [theme.breakpoints.down('sm')]: { display: 'none' },
    },
}))

const Help = () => {
    const config = getConfig().publicRuntimeConfig
    const help = getMenuItem('Help')
    const supportItems = help.items.filter(item => item.category == 'support')
    const learnItems = help.items.filter(item => item.category == 'learn')
    const { classes } = useStyles()
    const chatLink = (
        <Link onClick={intercomShow} className={classes.helpLink}>
            Need help? Click here to chat live with CyVerse Support!
        </Link>
    )

    return (
        <Layout
            title="Help"
            actions={config.INTERCOM_ENABLED ? chatLink : null}
        >
            <Box mt={3}>
                <Typography variant="h6">Learn</Typography>
                <Divider />
                <br />
                <Grid container spacing={4}>
                    {learnItems.map(item => (
                        <Grid
                            item
                            md={6}
                            s={12}
                            xs={12}
                            lg={3}
                            xl={3}
                            key={item.path}
                        >
                            <Link underline="none" href={item.path}>
                                <HelpCard
                                    title={item.label}
                                    icon={item.icon}
                                    description={item.description}
                                />
                            </Link>
                        </Grid>
                    ))}
                </Grid>
            </Box>
            <Box mt={4}>
                <Typography variant="h6">Support</Typography>
                <Divider />
                <br />
                <Grid container spacing={4}>
                    {supportItems.map(item => (
                        <Grid
                            item
                            md={6}
                            s={12}
                            xs={12}
                            lg={3}
                            xl={3}
                            key={item.path}
                        >
                            <Link underline="none" href={item.path}>
                                <HelpCard
                                    title={item.label}
                                    description={item.description}
                                    icon={item.icon}
                                />
                            </Link>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Layout>
    )
}

export default Help
