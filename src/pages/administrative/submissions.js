import React from 'react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    Container,
    Paper,
    Grid,
    Typography,
    TextField,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableFooter,
    TableRow,
    TableCell,
    TablePagination,
} from '@mui/material'
import { Layout, DateSpan } from '../../components'
import { useAPI } from '../../contexts/api'
import { withGetServerSideError } from '../../contexts/error'
import { makeStyles } from '../../styles/tss'

//FIXME duplicated elsewhere
const useStyles = makeStyles()(theme => ({
    paper: {
        padding: '3em',
    },
}))

//TODO move pagination code into shared component
const FormSubmissions = props => {
    const api = useAPI()
    const { classes } = useStyles()

    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [keyword, setKeyword] = useState()
    const [count, setCount] = useState(props.count)
    const [rows, setRows] = useState(props.results)
    const [debounce, setDebounce] = useState(null)

    const handleChangePage = async (event, newPage) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = async event => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }

    const handleChangeKeyword = async event => {
        setKeyword(event.target.value)
        setPage(0)
    }

    //TODO add debounce
    useEffect(() => {
        // Couldn't get just-debounce-it to work here
        if (debounce) clearTimeout(debounce)
        setDebounce(
            setTimeout(async () => {
                const { count, results } = await api.formSubmissions({
                    offset: page * rowsPerPage,
                    limit: rowsPerPage,
                    keyword: keyword,
                })
                setCount(count)
                setRows(results)
            }, 500)
        )
    }, [page, rowsPerPage, keyword])

    return (
        <Layout breadcrumbs>
            <Container maxWidth="lg">
                <br />
                <Paper elevation={3} className={classes.paper}>
                    <Grid container justifyContent="space-between">
                        <Grid item>
                            <Typography component="h1" variant="h4">
                                Form Submissions
                            </Typography>
                        </Grid>
                        <Grid item>
                            <TextField
                                style={{ width: '20em' }}
                                placeholder="Search ..."
                                onChange={handleChangeKeyword}
                            />
                        </Grid>
                    </Grid>
                    <Typography color="textSecondary" gutterBottom>
                        Search across form name, username, email, and country
                    </Typography>
                    <br />
                    <FormSubmissionTable
                        rows={rows}
                        rowsPerPage={rowsPerPage}
                        count={count}
                        page={page}
                        handleChangePage={handleChangePage}
                        handleChangeRowsPerPage={handleChangeRowsPerPage}
                    />
                </Paper>
            </Container>
        </Layout>
    )
}

const FormSubmissionTable = ({
    rows,
    rowsPerPage,
    count,
    page,
    handleChangePage,
    handleChangeRowsPerPage,
}) => (
    <TableContainer component={Paper}>
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>Form</TableCell>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Country</TableCell>
                    <TableCell>Date</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {rows.map(submission => (
                    <Link
                        key={submission.id}
                        href={`/administrative/submissions/${submission.id}`}
                    >
                        <TableRow
                            hover
                            style={{ cursor: 'pointer' }}
                            component="a"
                        >
                            <TableCell>{submission.form.name}</TableCell>
                            <TableCell>{submission.user.username}</TableCell>
                            <TableCell>{submission.user.email}</TableCell>
                            <TableCell>
                                {submission?.user?.region?.country?.name ||
                                    'Not specified'}
                            </TableCell>
                            <TableCell>
                                <DateSpan date={submission.updated_at} />
                            </TableCell>
                        </TableRow>
                    </Link>
                ))}
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TablePagination
                        rowsPerPage={rowsPerPage}
                        count={count}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </TableRow>
            </TableFooter>
        </Table>
    </TableContainer>
)

export async function getServerSideProps({ req }) {
    const { count, results } = await req.api.formSubmissions()

    return {
        props: {
            count,
            results,
        },
    }
}

export default FormSubmissions
