import React from 'react'
import { makeStyles } from '../styles/tss'
import {
    Card,
    CardHeader,
    CardContent,
    Box,
    Button,
    Typography,
    Link,
} from '@mui/material'
import { DateSpan } from './DateRange'

//FIXME duplicated elsewhere
const useStyles = makeStyles()(theme => ({
    box: {
        marginBottom: '2em',
    },
    cellHeader: {
        width: '8em',
        fontWeight: 'bold',
    },
}))

const User = props => {
    const { classes } = useStyles()

    if (props.summaryOnly) {
        return (
            <div>
                <table>
                    <tbody>
                        <tr>
                            <td className={classes.cellHeader}>Name</td>
                            <td>{`${props.first_name} ${props.last_name}`}</td>
                        </tr>
                        <tr>
                            <td className={classes.cellHeader}>Username</td>
                            <td>{props.username}</td>
                        </tr>
                        <tr>
                            <td className={classes.cellHeader}>Email</td>
                            <td>{props.email}</td>
                        </tr>
                        <tr>
                            <td className={classes.cellHeader}>Date Joined</td>
                            <td>
                                <DateSpan date={props.date_joined} />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <Box display="flex" justifyContent="flex-end">
                    <Link href={`/administrative/users/${props.id}`}>
                        View Details
                    </Link>
                </Box>
            </div>
        )
    }

    return (
        <div>
            <Card className={classes.box}>
                <CardHeader
                    title={`${props.first_name} ${props.last_name} (${props.username})`}
                />
                <CardContent>
                    <div>
                        Joined: <DateSpan date={props.date_joined} />
                    </div>
                    <div>
                        ORCID: {props.orcid_id ? props.orcid_id : '<None>'}
                    </div>
                    {props.delete ? (
                        <Button
                            variant="contained"
                            color="secondary"
                            size="medium"
                        >
                            DELETE
                        </Button>
                    ) : (
                        <></>
                    )}
                </CardContent>
            </Card>

            <Card className={classes.box}>
                <CardHeader title="Email" />
                <CardContent>
                    {props.emails &&
                        props.emails.map((email, index) => (
                            <div key={index}>
                                {email.email} -{' '}
                                {email.verified
                                    ? 'Verified' +
                                      (email.primary ? ', Primary' : '')
                                    : 'Unverified'}
                            </div>
                        ))}
                </CardContent>
            </Card>

            {props.allSections || props.mailingLists ? (
                <Card className={classes.box}>
                    <CardHeader title="Mailing List Subscriptions" />
                    <CardContent>
                        {props.emails &&
                            props.emails.map(email => (
                                <div key={email.email}>
                                    <Typography
                                        variant="subtitle2"
                                        color="textSecondary"
                                    >
                                        {email.email}
                                    </Typography>
                                    <Box ml={2}>
                                        {email.mailing_lists &&
                                        email.mailing_lists.length > 0
                                            ? email.mailing_lists.map(
                                                  (mailingList, index) => (
                                                      <div key={index}>
                                                          {mailingList.name}
                                                      </div>
                                                  )
                                              )
                                            : '<None>'}
                                    </Box>
                                </div>
                            ))}
                    </CardContent>
                </Card>
            ) : (
                <></>
            )}

            {props.allSections || props.institution ? (
                <Card className={classes.box}>
                    <CardHeader title="Institution" />
                    <CardContent>
                        <div>Company/Institution: {props.institution}</div>
                        <div>Department: {props.department}</div>
                        <div>Occupation: {props.occupation.name}</div>
                        <div>Country: {props.region.country.name}</div>
                        <div>Region: {props.region.name}</div>
                    </CardContent>
                </Card>
            ) : (
                <></>
            )}

            {props.allSections || props.research ? (
                <Card className={classes.box}>
                    <CardHeader title="Research" />
                    <CardContent>
                        <div>Research Area: {props.research_area.name}</div>
                        <div>Funding Agency: {props.funding_agency.name}</div>
                    </CardContent>
                </Card>
            ) : (
                <></>
            )}

            {props.allSections || props.demographics ? (
                <Card className={classes.box}>
                    <CardHeader title="Demographics" />
                    <CardContent>
                        <div>Gender Identity: {props.gender.name}</div>
                        <div>Ethnicity: {props.ethnicity.name}</div>
                    </CardContent>
                </Card>
            ) : (
                <></>
            )}

            {props.allSections || props.preferences ? (
                <Card className={classes.box}>
                    <CardHeader title="Preferences" />
                    <CardContent>
                        <div>
                            How did you hear about us?{' '}
                            {props.aware_channel.name}
                        </div>
                        <div>
                            Receive the CyVerse Newsletter?{' '}
                            {props.subscribe_to_newsletter ? 'Yes' : 'No'}
                        </div>
                        <div>
                            Participate in a research study about your use of
                            CyVerse applications and services?{' '}
                            {props.participate_in_study ? 'Yes' : 'No'}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <></>
            )}

            {props.allSections || props.services ? (
                <Card className={classes.box}>
                    <CardHeader title="Services" />
                    <CardContent>
                        {props.services && props.services.length > 0
                            ? props.services.map((service, index) => (
                                  <div key={index}>
                                      {service.name} - {service.request.message}
                                  </div>
                              ))
                            : 'None'}
                    </CardContent>
                </Card>
            ) : (
                <></>
            )}
        </div>
    )
}

export default User
