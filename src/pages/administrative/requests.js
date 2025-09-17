import React from 'react'
import { useState, useEffect } from 'react'
import Link from "next/link"
import { Container, Paper, Grid, Typography, TextField, TableContainer, Table, TableHead, TableBody, TableFooter, TableRow, TableCell, TablePagination, CircularProgress } from '@mui/material'
import { Layout, DateSpan } from '../../components'
import { useAPI } from '../../contexts/api'
import { withGetServerSideError } from '../../contexts/error'
import { makeStyles } from '../../styles/tss'

//FIXME duplicated elsewhere
const useStyles = makeStyles()((theme) => ({
  paper: {
    padding: '3em'
  }
}))

//TODO move pagination code into shared component
const AccessRequests = props => {
  const api = useAPI()
  const { classes } = useStyles()

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [keyword, setKeyword] = useState()
  const [rows, setRows] = useState(props.results)
  const [count, setCount] = useState(props.count)
  const [debounce, setDebounce] = useState(null)
  const [searching, setSearching] = useState(false)

  const handleChangePage = async (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = async (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleChangeKeyword = async (event) => {
    setSearching(true)
    setKeyword(event.target.value)
    setPage(0)
  }

  useEffect(() => {
    // Couldn't get just-debounce-it to work here
    if (debounce) clearTimeout(debounce)
    setDebounce(
      setTimeout(async () => {
          const { count, results } = await api.serviceRequests({ 
            offset: page * rowsPerPage, 
            limit: rowsPerPage,
            keyword: keyword
          })
          setCount(count)
          setRows(results)
          setSearching(false)
        }, 500)
    )},
    [page, rowsPerPage, keyword]
  )

  return (
    <Layout breadcrumbs>
      <Container maxWidth='lg'>
        <br />
        <Paper elevation={3} className={classes.paper}>
          <Grid container justifyContent="space-between">
            <Grid item>
              <Typography component="h1" variant="h4">Access Requests</Typography>
            </Grid>
            <Grid item>
              <TextField 
                style={{width: '20em'}} 
                placeholder="Search ..." 
                onChange={handleChangeKeyword} 
                InputProps={{ 
                  endAdornment: (
                    <React.Fragment>
                      {searching && <CircularProgress color="inherit" size={20} />}
                    </React.Fragment>
                  )
                }}
              />
            </Grid>
          </Grid>
          <Typography color="textSecondary" gutterBottom>
            Search across service name, username, email, country, and status
          </Typography>
          <br />
          <RequestTable 
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

const RequestTable = ({ rows, rowsPerPage, count, page, handleChangePage, handleChangeRowsPerPage }) => (
  <TableContainer component={Paper}>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Service</TableCell>
          <TableCell>Username</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Country</TableCell>
          <TableCell>Date</TableCell>
          <TableCell>Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map(request => (
          <Link key={request.id} href={`/administrative/requests/${request.id}`} passHref>
            <TableRow hover style={{cursor: 'pointer'}} component="a">
              <TableCell>{request.service.name}</TableCell>
              <TableCell>{request.user.username}</TableCell>
              <TableCell>{request.user.email}</TableCell>
              <TableCell>{request?.user?.region?.country?.name || 'Not specified'}</TableCell>
              <TableCell>
                <DateSpan date={request.updated_at} />
              </TableCell>
              <TableCell>{request.status}</TableCell>
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
  const { count, results } = await req.api.serviceRequests()

  return {
    props: {
      count,
      results
    }
  }
}

export default AccessRequests