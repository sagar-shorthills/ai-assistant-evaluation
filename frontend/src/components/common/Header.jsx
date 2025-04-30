import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    useTheme,
    useMediaQuery,
    IconButton,
} from '@mui/material';
import DatabaseIcon from '@mui/icons-material/Storage';
import GitHubIcon from '@mui/icons-material/GitHub';
import HelpIcon from '@mui/icons-material/Help';

const Header = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <AppBar position="fixed" color="primary" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
            <Toolbar>
                <DatabaseIcon sx={{ mr: 2 }} />
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    {isMobile ? 'MongoDB Explorer' : 'MongoDB Data Exploration Tool with GST Integration'}
                </Typography>

                <Box sx={{ display: 'flex' }}>
                    <IconButton
                        color="inherit"
                        aria-label="help"
                        title="Help"
                        onClick={() => alert('MongoDB Data Explorer with GST integration.\nSelect a collection, configure fields and GST options, and explore your data!')}
                    >
                        <HelpIcon />
                    </IconButton>

                    <IconButton
                        color="inherit"
                        aria-label="github"
                        title="GitHub Repository"
                        component="a"
                        href="https://github.com/yourusername/mongodb-data-explorer"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <GitHubIcon />
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;