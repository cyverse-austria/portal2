/*
 *  Wrapper component around the Intercom chat widget
 *  Based on Sonora module of same name
 */

import React from 'react'
import getConfig from 'next/config'
import { Badge, Button, IconButton, Tooltip } from '@mui/material'
import { styled } from '@mui/material/styles'
import {
    Person as PersonIcon,
    LiveHelp as LiveHelpIcon,
} from '@mui/icons-material'
import { useUser } from '../contexts/user'
import { useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'

const IconStyled = styled('div')(({ theme }) => ({
    color: 'white',
}))

function CustomIntercom() {
    const config = getConfig().publicRuntimeConfig
    if (!config.INTERCOM_ENABLED) {
        console.warn('Intercom is disabled')
        return <></>
    }

    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const [user] = useUser()
    const [unreadCount, setUnreadCount] = React.useState(0)

    React.useEffect(() => {
        if (typeof window.Intercom === 'function') {
            window.Intercom('reattach_activator')
            window.Intercom('update', window.intercomSettings)
            return
        }

        if (!user) {
            // should never happen
            console.warn('CustomIntercom: missing user')
            return
        }

        // Initialize Intercom chat widget
        // UP-66: moved all initialization code due to race condition between this useEffect hook and the one in _app.js
        window.intercomSettings = {
            app_id: config.INTERCOM_APP_ID,
            alignment: 'right',
            hide_default_launcher: true,
        }

        // Load Intercom library -- copied from developer docs, modified app ID
        // https://developers.intercom.com/installing-intercom/docs/basic-javascript
        console.log('Initializing Intercom widget')
        var w = window
        var ic = w.Intercom
        if (typeof ic === 'function') {
            ic('reattach_activator')
            ic('update', w.intercomSettings)
        } else {
            var d = document
            var i = function () {
                i.c(arguments)
            }
            i.q = []
            i.c = function (args) {
                i.q.push(args)
            }
            w.Intercom = i
            var l = function () {
                var s = d.createElement('script')
                s.type = 'text/javascript'
                s.async = true
                s.src = `https://widget.intercom.io/widget/${config.INTERCOM_APP_ID}`
                var x = d.getElementsByTagName('script')[0]
                x.parentNode.insertBefore(s, x)
            }
            if (document.readyState === 'complete') {
                l()
            } else if (w.attachEvent) {
                w.attachEvent('onload', l)
            } else {
                w.addEventListener('load', l, false)
            }
        }

        window.Intercom('boot', {
            app_id: config.INTERCOM_APP_ID,
            email: user.email,
            user_id: user.username,
            created_at: Date.now(),
            company: {
                id: config.INTERCOM_COMPANY_ID,
                //name: companyName,
            },
        })

        window.Intercom('onUnreadCountChange', newUnreadCount =>
            setUnreadCount(newUnreadCount)
        )
    })

    return (
        <>
            {!isMobile ? (
                <Tooltip title="Chat with CyVerse Support">
                    <Button
                        variant="text"
                        color="inherit"
                        size="large"
                        startIcon={
                            <Badge badgeContent={unreadCount} color="error">
                                <LiveHelpIcon />
                            </Badge>
                        }
                        onClick={intercomShow}
                    >
                        Help
                    </Button>
                </Tooltip>
            ) : (
                <IconButton onClick={intercomShow}>
                    <PersonIcon sx={{ color: 'white' }} />
                </IconButton>
            )}
        </>
    )
}

function intercomShow() {
    if (window.Intercom) window.Intercom('show')
}

export { CustomIntercom, intercomShow }
