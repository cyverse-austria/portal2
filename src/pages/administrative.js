import React from 'react'
import { Grid, Link, Box, Typography } from '@mui/material'
import { Layout, SummaryCard, getMenuItem } from '../components'

const Administrative = () => {
    const menuItem = getMenuItem('Administrative')

    return (
        <Layout title="Administrative">
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
                            <Link
                                underline="none"
                                href={item.path}
                                sx={{ textDecoration: 'none' }}
                            >
                                <SummaryCard
                                    icon={item.icon}
                                    title={item.label}
                                    description={item.description}
                                />
                            </Link>
                        </Grid>
                    ))}
                </Grid>
                <Box mt={4}>
                    <Typography variant="body1">
                        For related information see the{' '}
                        <Link
                            href="https://analytics.cyverse.rocks"
                            target="_blank"
                        >
                            User Analytics Portal
                        </Link>
                        .
                    </Typography>
                </Box>
            </Box>
        </Layout>
    )
}

export default Administrative
