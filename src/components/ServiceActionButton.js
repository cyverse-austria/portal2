import React from 'react'
import { Button, Tooltip } from '@mui/material'
import LaunchIcon from '@mui/icons-material/Launch'

const ServiceActionButton = ({ status, service, requestAccessHandler }) => {
    // Request status can be: 'granted', 'denied', 'approved', 'pending'

    const { label, icon, tooltip, action, url, disabled } = (() => {
        if (service.is_powered || status === 'granted')
            return {
                label: 'LAUNCH',
                icon: <LaunchIcon />,
                url: service.service_url,
            }
        if (
            status === 'pending' ||
            status === 'approved' ||
            status === 'requested'
        )
            return {
                label: 'ACCESS PENDING APPROVAL',
                tooltip:
                    'The access request is in process or awaiting approval.  You will be notified via email when access is granted.',
                disabled: true,
            }
        if (status === 'denied')
            return {
                label: 'ACCESS DENIED',
                tooltip:
                    'The access request was denied and an email was sent with an explanation.',
                disabled: true,
            }

        return { label: 'REQUEST ACCESS', action: requestAccessHandler }
    })()

    return (
        <Tooltip title={tooltip || ''}>
            <span>
                <Button
                    endIcon={icon}
                    variant="contained"
                    color="primary"
                    size="medium"
                    disabled={disabled}
                    href={url}
                    onClick={action}
                >
                    {label}
                </Button>
            </span>
        </Tooltip>
    )
}

export default ServiceActionButton
