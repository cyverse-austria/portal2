import { createTheme } from '@mui/material/styles'

const theme = createTheme({
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 960,
            lg: 1280,
            xl: 1920,
        },
    },
    palette: {
        primary: {
            light: '#0c91db',
            main: '#0971ab',
            dark: '#06517b',
            contrastText: '#fff',
        },
        //Pink
        // secondary: {
        //   light: '#E33371',
        //   main: '#DC004E',
        //   dark: '#AB003C',
        //   contrastText: '#fff',
        // },
        //Grey Blue
        secondary: {
            light: '#5f98d7',
            main: '#246aa6',
            dark: '#004076',
            contrastText: '#fff',
        },
        error: {
            light: '#e57373',
            main: '#f44336',
            dark: '#9A0036',
            contrastText: '#fff',
        },
        success: {
            light: '#81C784',
            main: '#4caf50',
            dark: '#388E3C',
            contrastText: 'rgba(0,0,0,.87)',
        },
        warning: {
            light: '#ffb74d',
            main: '#ff9800',
            dark: '#f57c00',
            contrastText: 'rgba(0,0,0,.87)',
        },
        divider: 'rgba(0,0,0,.12)',
    },
    overrides: {
        MuiCardHeader: {
            root: {
                height: '0',
            },
        },
        MuiAvatar: {
            colorDefault: {
                backgroundColor: '#0971ab',
            },
        },
        MuiListItem: {
            root: {
                '& .MuiSvgIcon-root': {
                    fill: 'white',
                },
                '&$selected': {
                    backgroundColor: '#0971ab',
                    color: 'white',
                    '&:hover': {
                        backgroundColor: '#0971ab',
                    },
                },
            },
        },
    },
})

export default theme
