import React from 'react'
import { IconButton } from '@mui/material'
import CopyIcon from '@mui/icons-material/FileCopyOutlined'

export default function CopyToClipboardButton({ text }) {
    return (
        <IconButton
            size="small"
            onClick={e => {
                e.preventDefault()
                navigator.clipboard.writeText(text)
            }}
        >
            <CopyIcon sx={{ fontSize: '0.85em' }} />
        </IconButton>
    )
}
