import React from 'react'
import { format } from 'date-fns'

const DateRange = ({ date1, date2, hideTime }) => {
    return (
        <>
            <DateSpan date={date1} hideTime={hideTime} /> to{' '}
            <DateSpan date={date2} hideTime={hideTime} />
        </>
    )
}

/*
 * Convert date/time to user's local time.
 *
 * - Postgres stores timestamps in Phoenix time.
 * - Sequelize automatically converts to UTC
 * - The format() function converts from UTC to user's local time
 */
const DateSpan = ({ date, hideTime }) => {
    const d = new Date(date)

    if (hideTime) return <>{format(d, 'MMM d, yyyy')}</>

    return <>{format(d, 'MMM d, yyyy hh:mm a')} MST</>
}

export { DateSpan, DateRange }
