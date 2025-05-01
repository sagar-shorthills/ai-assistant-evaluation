import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#d04a02', // PwC Orange
            light: '#e06e33',
            dark: '#9e3700',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#2d2d2d', // PwC Dark Grey/Charcoal
            light: '#545454',
            dark: '#1a1a1a',
            contrastText: '#ffffff',
        },
        error: {
            main: '#eb8c00', // PwC Golden/Amber
        },
        warning: {
            main: '#ffb600', // PwC Yellow
        },
        info: {
            main: '#00a3a1', // PwC Teal
        },
        success: {
            main: '#3b9c00', // PwC Green
        },
        background: {
            default: '#f4f4f4', // Light grey background
            paper: '#ffffff',
        },
        text: {
            primary: '#2d2d2d',
            secondary: '#5f5f5f',
        },
    },
    typography: {
        fontFamily: '"PwC Helvetica Neue", "Helvetica", "Arial", sans-serif', // PwC uses Helvetica Neue
        h1: {
            fontSize: '2.5rem',
            fontWeight: 700, // PwC typically uses bolder headings
        },
        h2: {
            fontSize: '2rem',
            fontWeight: 700,
        },
        h3: {
            fontSize: '1.75rem',
            fontWeight: 700,
        },
        h4: {
            fontSize: '1.5rem',
            fontWeight: 700,
        },
        h5: {
            fontSize: '1.25rem',
            fontWeight: 700,
        },
        h6: {
            fontSize: '1rem',
            fontWeight: 700,
        },
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.1)',
                    backgroundColor: '#d04a02', // PwC Orange for AppBar
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.1)',
                    borderRadius: '4px', // PwC uses more subtle rounded corners
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: '4px',
                    fontWeight: 500,
                },
                containedPrimary: {
                    backgroundColor: '#d04a02', // PwC Orange
                    '&:hover': {
                        backgroundColor: '#9e3700',
                    },
                },
                containedSecondary: {
                    backgroundColor: '#2d2d2d', // PwC Dark Grey
                    '&:hover': {
                        backgroundColor: '#1a1a1a',
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    marginBottom: '16px',
                },
            },
        },
    },
});

export default theme;