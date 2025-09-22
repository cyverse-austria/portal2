import { createMakeStyles, createWithStyles } from 'tss-react'
import { useTheme as useMuiTheme } from '@mui/material/styles'

export const { makeStyles, useStyles } = createMakeStyles({
    useTheme: useMuiTheme,
})
export const { withStyles } = createWithStyles({ useTheme: useMuiTheme })
