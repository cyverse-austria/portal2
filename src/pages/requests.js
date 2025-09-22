import React from 'react'
import { Link, Box, Grid, Divider, Typography } from '@mui/material'
import { List as ListIcon } from '@mui/icons-material'
import { Layout, SummaryCard } from '../components'
import { withGetServerSideError } from '../contexts/error'

const Requests = ({ forms }) => (
    <Layout title="Requests">
        {(forms || [])
            .filter(formGroup => formGroup.forms && formGroup.forms.length > 0)
            .map((formGroup, index) => (
                <Box key={index} mt={3}>
                    <Typography variant="h6" component="h2">
                        {formGroup.name}
                    </Typography>
                    {/* <Typography variant="subtitle1">{formGroup.description}</Typography> */}
                    <Divider />
                    <Box sx={{ mt: 2, mb: 2 }}>
                        <RequestGrid
                            forms={(formGroup.forms || []).filter(
                                f => f.is_public
                            )}
                        />
                    </Box>
                </Box>
            ))}
    </Layout>
)

const RequestGrid = ({ forms }) => (
    <Grid container spacing={4}>
        {forms.map((form, index) => (
            <Grid item key={index} xs={12} sm={12} md={6} lg={6} xl={3}>
                <Request form={form} />
            </Grid>
        ))}
    </Grid>
)

const Request = ({ form }) => (
    <Link
        underline="none"
        href={`requests/${form.id}`}
        sx={{ textDecoration: 'none' }}
    >
        <SummaryCard
            title={form.name}
            description={form.description}
            icon={<ListIcon />}
        />
    </Link>
)

export async function getServerSideProps({ req }) {
    try {
        // Check if API is available
        if (!req.api) {
            console.error('API middleware not available on request object')
            return { props: { forms: [] } }
        }

        const forms = await req.api.forms()

        // Handle case where API returns undefined or null
        if (forms === undefined || forms === null) {
            console.warn('Forms API returned undefined/null')
            return { props: { forms: [] } }
        }

        // Handle case where API returns array directly (expected case)
        if (Array.isArray(forms)) {
            return { props: { forms } }
        }

        // Handle case where API returns an object with forms property (fallback)
        if (
            forms &&
            typeof forms === 'object' &&
            forms.forms &&
            Array.isArray(forms.forms)
        ) {
            console.warn(
                'API returned forms wrapped in object, using forms.forms'
            )
            return { props: { forms: forms.forms } }
        }

        // Fallback for any other case
        console.warn(
            'Unexpected forms API response format:',
            typeof forms,
            forms
        )
        return { props: { forms: [] } }
    } catch (error) {
        console.error('Failed to fetch forms:', error)
        return { props: { forms: [] } }
    }
}

export default Requests
