import React from 'react'
import { useState, useEffect } from 'react'
import {
    Container,
    Paper,
    Grid,
    Button,
    IconButton,
    Typography,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
} from '@mui/material'
import { Delete as DeleteIcon } from '@mui/icons-material'
import { Layout, FormDialog } from '../../components'
import { useAPI } from '../../contexts/api'
import { useError } from '../../contexts/error'
import { makeStyles } from '../../styles/tss'

//FIXME duplicated elsewhere
const useStyles = makeStyles()(theme => ({
    paper: {
        padding: '3em',
    },
}))

const MailingLists = props => {
    const { classes } = useStyles()
    const api = useAPI()
    const [_, setError] = useError()
    const [lists, setLists] = useState(props.lists)
    const [update, setUpdate] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)

    const createList = async values => {
        try {
            const resp = await api.createMailingList(values)
            if (resp != 'success') setError('An error occurred')
            else setUpdate(true)
        } catch (error) {
            console.log(error)
            setError(error.message)
        }
    }

    const deleteList = async id => {
        try {
            const resp = await api.deleteMailingList(id)
            if (resp != 'success') setError('An error occurred')
            else setUpdate(true)
        } catch (error) {
            console.log(error)
            setError(error.message)
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            const newLists = await api.mailingLists()
            setLists(newLists)
        }
        fetchData()
        setUpdate(false)
    }, [update])

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
                                Mailing Lists
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setDialogOpen(true)}
                            >
                                Add Mailing List
                            </Button>
                        </Grid>
                    </Grid>
                    <br />
                    <MailingListTable
                        lists={lists}
                        deleteHandler={deleteList}
                    />
                </Paper>
            </Container>
            <FormDialog
                title="Add Mailing List"
                open={dialogOpen}
                fields={[
                    {
                        id: 'name',
                        label: 'Name',
                        type: 'text',
                        required: true,
                    },
                    {
                        id: 'list_name',
                        label: 'List name',
                        type: 'text',
                        required: true,
                    },
                    {
                        id: 'service_id',
                        label: 'Service ID',
                        type: 'text',
                        required: true,
                    },
                ]}
                handleClose={() => setDialogOpen(false)}
                handleSubmit={values => {
                    setDialogOpen(false)
                    createList(values)
                }}
            />
        </Layout>
    )
}

const MailingListTable = ({ lists, deleteHandler }) => {
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>List name</TableCell>
                        <TableCell>Service</TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {lists.map((list, index) => (
                        <TableRow key={index}>
                            <TableCell>{list.name}</TableCell>
                            <TableCell>{list.list_name}</TableCell>
                            <TableCell>{list.service.name}</TableCell>
                            <TableCell>
                                <IconButton
                                    onClick={() => deleteHandler(list.id)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export async function getServerSideProps({ req }) {
    const lists = await req.api.mailingLists()
    return { props: { lists } }
}

export default MailingLists
