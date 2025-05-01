import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import DatabaseIcon from '@mui/icons-material/Storage';
import UserAvatar from './UserAvatar';
import UserMenu from './UserMenu';

/**
 * Header component displays the application header with navigation and user controls
 * @returns {JSX.Element} Header component
 */
const Header = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [anchorEl, setAnchorEl] = useState(null);

    // Mock user data - replace with actual user data from your auth system
    const user = {
        name: 'Sagar Saini',
        email: 'sagarsaini@gmail.com',
        avatar: null,
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <AppBar
            position="fixed"
            elevation={0}
            sx={{
                zIndex: theme.zIndex.drawer + 1,
                background: 'rgba(208, 74, 2, 0.85)',
                backdropFilter: 'blur(10px)',
                borderRadius: 0,
                borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
            }}
        >
            <Toolbar>
                <DatabaseIcon sx={{ mr: 2 }} />
                <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 500 }}>
                    {isMobile ? 'MongoDB Explorer' : 'MongoDB Data Exploration Tool with GST Integration'}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <UserAvatar user={user} onClick={handleMenuOpen} />
                </Box>

                <UserMenu
                    anchorEl={anchorEl}
                    onClose={handleMenuClose}
                    user={user}
                />
            </Toolbar>
        </AppBar>
    );
};

export default Header;