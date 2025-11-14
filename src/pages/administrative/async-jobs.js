import {
    KeyboardArrowDown as KeyboardArrowDownIcon,
    KeyboardArrowUp as KeyboardArrowUpIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material'
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Collapse,
    Container,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
} from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import { Layout } from '../../components'
import { useAPI } from '../../contexts/api'
import { makeStyles } from '../../styles/tss'

const useStyles = makeStyles()(theme => ({
    paper: {
        padding: '3em',
    },
    statusChip: {
        minWidth: '100px',
    },
}))

const getStatusColor = status => {
    switch (status) {
        case 'Running':
            return 'primary'
        case 'Completed':
            return 'success'
        case 'Failed':
            return 'error'
        case 'Submitted':
            return 'warning'
        case 'Canceled':
            return 'default'
        default:
            return 'default'
    }
}

const AnalysisRow = ({ analysis, api }) => {
    const [open, setOpen] = useState(false)
    const [details, setDetails] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleToggle = async () => {
        if (!open && !details) {
            setLoading(true)
            try {
                const result = await api.asyncAnalysisDetails(
                    analysis.analysis_id
                )
                setDetails(result)
            } catch (error) {
                console.error('Failed to fetch analysis details:', error)
            } finally {
                setLoading(false)
            }
        }
        setOpen(!open)
    }

    return (
        <React.Fragment>
            <TableRow hover>
                <TableCell>
                    <IconButton size="small" onClick={handleToggle}>
                        {open ? (
                            <KeyboardArrowUpIcon />
                        ) : (
                            <KeyboardArrowDownIcon />
                        )}
                    </IconButton>
                </TableCell>
                <TableCell>{analysis.name || 'N/A'}</TableCell>
                <TableCell>{analysis.app_id}</TableCell>
                <TableCell>{analysis.system_id}</TableCell>
                <TableCell>
                    <Chip
                        label={analysis.status}
                        color={getStatusColor(analysis.status)}
                        size="small"
                    />
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell
                    style={{ paddingBottom: 0, paddingTop: 0 }}
                    colSpan={5}
                >
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box margin={2}>
                            {loading ? (
                                <CircularProgress size={24} />
                            ) : details ? (
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Typography
                                            variant="h6"
                                            gutterBottom
                                            component="div"
                                        >
                                            Analysis Details
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2">
                                            Analysis ID:
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {details.id}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2">
                                            Service Account Username:
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {details.username}
                                        </Typography>
                                    </Grid>
                                    {details.start_date && (
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="subtitle2">
                                                Start Date:
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {new Date(
                                                    details.start_date
                                                ).toLocaleString()}
                                            </Typography>
                                        </Grid>
                                    )}
                                    {details.end_date && (
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="subtitle2">
                                                End Date:
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {new Date(
                                                    details.end_date
                                                ).toLocaleString()}
                                            </Typography>
                                        </Grid>
                                    )}
                                    {details.submission?.config && (
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle2">
                                                Parameters:
                                            </Typography>
                                            <Paper
                                                variant="outlined"
                                                style={{
                                                    padding: '1em',
                                                    marginTop: '0.5em',
                                                }}
                                            >
                                                <pre
                                                    style={{
                                                        margin: 0,
                                                        fontSize: '0.875rem',
                                                    }}
                                                >
                                                    {JSON.stringify(
                                                        details.submission
                                                            .config,
                                                        null,
                                                        2
                                                    )}
                                                </pre>
                                            </Paper>
                                        </Grid>
                                    )}
                                    {details.submission?.output_dir && (
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle2">
                                                Output Directory:
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {details.submission.output_dir}
                                            </Typography>
                                        </Grid>
                                    )}
                                </Grid>
                            ) : (
                                <Typography variant="body2">
                                    No details available
                                </Typography>
                            )}
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    )
}

const AsyncJobs = () => {
    const { classes } = useStyles()
    const api = useAPI()
    const isMountedRef = useRef(false)
    const isInitialMountRef = useRef(true)
    const statusRef = useRef('Running')

    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [status, setStatus] = useState('Running')
    const [analyses, setAnalyses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const statusOptions = [
        { value: '', label: 'All' },
        { value: 'Running', label: 'Running' },
        { value: 'Completed', label: 'Completed' },
        { value: 'Failed', label: 'Failed' },
        { value: 'Submitted', label: 'Submitted' },
        { value: 'Canceled', label: 'Canceled' },
    ]

    const handleChangePage = async (event, newPage) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = async event => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }

    const handleChangeStatus = event => {
        setStatus(event.target.value)
        setPage(0)
    }

    const fetchAnalyses = async () => {
        if (!isMountedRef.current) return

        setLoading(true)
        try {
            // Use statusRef.current to get the latest status value
            const currentStatus = statusRef.current
            const params = currentStatus ? { status: currentStatus } : {}
            const result = await api.asyncAnalyses(params)
            if (isMountedRef.current) {
                setAnalyses(result.analyses || [])
                setError(null) // Clear any previous errors
            }
        } catch (err) {
            console.error('Failed to fetch analyses:', err)
            if (isMountedRef.current) {
                // Set user-friendly error message
                const errorMessage =
                    err.response?.status === 502
                        ? 'Service temporarily unavailable. Please try refreshing.'
                        : 'Failed to fetch analyses. Please try refreshing.'
                setError(errorMessage)
            }
        } finally {
            if (isMountedRef.current) {
                setLoading(false)
            }
        }
    }

    const handleRefresh = () => {
        fetchAnalyses()
    }

    // Keep statusRef in sync with status state
    useEffect(() => {
        statusRef.current = status
    }, [status])

    // Set up initial fetch on mount only
    useEffect(() => {
        isMountedRef.current = true

        // Initial fetch
        fetchAnalyses()

        return () => {
            isMountedRef.current = false
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // Re-fetch when status changes (but not on initial mount)
    useEffect(() => {
        // Skip on initial mount (mount effect handles first fetch)
        if (isInitialMountRef.current) {
            isInitialMountRef.current = false
            return
        }

        fetchAnalyses()
    }, [status]) // eslint-disable-line react-hooks/exhaustive-deps

    const paginatedAnalyses = analyses.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    )

    return (
        <Layout breadcrumbs>
            <Container maxWidth="lg">
                <br />
                <Paper elevation={3} className={classes.paper}>
                    <Grid container justifyContent="space-between" spacing={2}>
                        <Grid item>
                            <Typography
                                component="h1"
                                variant="h4"
                                gutterBottom
                            >
                                Async Jobs
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Grid
                                container
                                spacing={2}
                                alignItems="center"
                                wrap="nowrap"
                            >
                                <Grid item>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        style={{ fontStyle: 'italic', whiteSpace: 'nowrap' }}
                                    >
                                        Click Refresh to see status changes
                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <Button
                                        variant="outlined"
                                        startIcon={<RefreshIcon />}
                                        onClick={handleRefresh}
                                    >
                                        Refresh
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <FormControl style={{ minWidth: 150 }}>
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            value={status}
                                            onChange={handleChangeStatus}
                                            label="Status"
                                        >
                                            {statusOptions.map(option => (
                                                <MenuItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>

                    <br />

                    {error && (
                        <>
                            <Alert severity="warning" style={{ marginBottom: '1em' }}>
                                {error}
                            </Alert>
                        </>
                    )}

                    {loading && analyses.length === 0 ? (
                        <Grid container justifyContent="center">
                            <CircularProgress />
                        </Grid>
                    ) : (
                        <>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell width="50" />
                                            <TableCell>Name</TableCell>
                                            <TableCell>App ID</TableCell>
                                            <TableCell>System ID</TableCell>
                                            <TableCell>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {analyses.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={5}
                                                    align="center"
                                                    style={{ padding: '2em' }}
                                                >
                                                    <Typography
                                                        variant="body1"
                                                        color="text.secondary"
                                                    >
                                                        No jobs found
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            paginatedAnalyses.map(analysis => (
                                                <AnalysisRow
                                                    key={analysis.analysis_id}
                                                    analysis={analysis}
                                                    api={api}
                                                />
                                            ))
                                        )}
                                    </TableBody>
                                    <TableFooter>
                                        <TableRow>
                                            <TablePagination
                                                rowsPerPageOptions={[
                                                    10, 25, 50, 100,
                                                ]}
                                                colSpan={5}
                                                count={analyses.length}
                                                rowsPerPage={rowsPerPage}
                                                page={page}
                                                onPageChange={handleChangePage}
                                                onRowsPerPageChange={
                                                    handleChangeRowsPerPage
                                                }
                                            />
                                        </TableRow>
                                    </TableFooter>
                                </Table>
                            </TableContainer>
                        </>
                    )}
                </Paper>
            </Container>
        </Layout>
    )
}

export default AsyncJobs
