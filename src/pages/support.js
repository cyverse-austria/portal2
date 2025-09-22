import React from 'react'
import { Grid, Link, Box } from '@mui/material'
import { Layout, SummaryCard, intercomShow, getMenuItem } from '../components'
import { makeStyles } from '../styles/tss'

const useStyles = makeStyles()(theme => ({
    helpLink: {
        [theme.breakpoints.down('xs')]: {
            display: 'none',
        },
    },
}))

const Support = () => {
    const menuItem = getMenuItem('Support')
    const { classes } = useStyles()
    const chatLink = (
        <Link onClick={intercomShow} className={classes.helpLink}>
            Need help? Click here to chat live with CyVerse Support!
        </Link>
    )

    return (
        <Layout title="Support" actions={chatLink}>
            <Box mt={4}>
                <Grid container spacing={4}>
                    {menuItem.items.map((item, index) => (
                        <Grid
                            item
                            key={index}
                            xs={12}
                            sm={12}
                            md={6}
                            lg={4}
                            xl={3}
                        >
                            <Link underline="none" href={item.path}>
                                <SummaryCard
                                    title={item.label}
                                    description={item.description}
                                />
                            </Link>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Layout>
    )
}

export default Support
