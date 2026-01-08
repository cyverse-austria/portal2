import React from 'react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { makeStyles } from '../../styles/tss'
import {
    Container,
    Grid,
    Paper,
    Typography,
    TextField,
    CircularProgress,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableFooter,
    TableRow,
    TableCell,
    TablePagination,
} from '@mui/material'
import { useRouter } from 'next/navigation'
import { Layout, CopyToClipboardButton } from '../../components'
import { useAPI } from '../../contexts/api'
import { withGetServerSideError } from '../../contexts/error'

//FIXME duplicated elsewhere
const useStyles = makeStyles()(theme => ({
    paper: {
        padding: '3em',
    },
}))

//TODO move pagination code into shared component
function Users(props) {
    const api = useAPI()
    const { classes } = useStyles()

    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [keyword, setKeyword] = useState()
    const [count, setCount] = useState(props.count)
    const [rows, setRows] = useState(props.results)
    const [debounce, setDebounce] = useState(null)
    const [searching, setSearching] = useState(false)

    const handleChangePage = async (event, newPage) => {
        setPage(newPage)
    }

    const handleChangeRowsPerPage = async event => {
        setRowsPerPage(parseInt(event.target.value, 10))
        setPage(0)
    }

    const handleChangeKeyword = async event => {
        setSearching(true)
        setKeyword(event.target.value)
        setPage(0)
    }

    useEffect(() => {
        if (debounce) clearTimeout(debounce)
        setDebounce(
            setTimeout(async () => {
                const { count, results } = await api.users({
                    offset: page * rowsPerPage,
                    limit: rowsPerPage,
                    keyword: keyword,
                })
                setCount(count)
                setRows(results)
                setSearching(false)
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
                            <Typography
                                component="h1"
                                variant="h4"
                                gutterBottom
                            >
                                Users
                            </Typography>
                        </Grid>
                        <Grid item>
                            <TextField
                                style={{ width: '30em' }}
                                placeholder="Search ..."
                                onChange={handleChangeKeyword}
                                InputProps={{
                                    endAdornment: (
                                        <React.Fragment>
                                            {searching && (
                                                <CircularProgress
                                                    color="inherit"
                                                    size={20}
                                                />
                                            )}
                                        </React.Fragment>
                                    ),
                                }}
                            />
                        </Grid>
                    </Grid>
                    <Typography color="textSecondary" gutterBottom>
                        Search across name, username, email, institution,
                        occupation, region, and country.
                        <br />
                        Enter multiple keywords separated by spaces.
                    </Typography>
                    <br />
                    <UserTable
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

function UserTable(props) {
    let {
        rows,
        rowsPerPage,
        count,
        page,
        handleChangePage,
        handleChangeRowsPerPage,
    } = props

    const router = useRouter()

    return (
        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Username</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Institution</TableCell>
                        <TableCell>Occupation</TableCell>
                        <TableCell>Region</TableCell>
                        <TableCell>Country</TableCell>
                        {/* <TableCell>Joined</TableCell> */}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((user, index) => {
                        const d = new Date(user.date_joined)
                        const parts = (user.email || '').split('@')
                        return (
                            <TableRow
                                key={index}
                                hover
                                sx={{
                                    cursor: 'pointer',
                                    textDecoration: 'none',
                                    color: 'inherit',
                                }}
                                onClick={() => {
                                    router.push(
                                        `/administrative/users/${user.id}`
                                    )
                                }}
                            >
                                <TableCell>
                                    {user.first_name} {user.last_name}
                                </TableCell>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                    {user.username}
                                    <CopyToClipboardButton
                                        text={user.username}
                                    />
                                </TableCell>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                    {parts[0]}
                                    <wbr />@{parts[1]}
                                    <CopyToClipboardButton text={user.email} />
                                </TableCell>
                                <TableCell>{user.institution}</TableCell>
                                <TableCell>
                                    {user?.occupation?.name || 'Not specified'}
                                </TableCell>
                                <TableCell>
                                    {user?.region?.name || 'Not specified'}
                                </TableCell>
                                <TableCell>
                                    {user?.region?.country?.name ||
                                        'Not specified'}
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25, 50]}
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
}

export async function getServerSideProps({ req }) {
    const { count, results } = await req.api.users()

    return {
        props: {
            count,
            results,
        },
    }
}

export default Users
