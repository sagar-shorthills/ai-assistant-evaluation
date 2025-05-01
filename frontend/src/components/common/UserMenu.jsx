import React, { useState, useRef } from 'react';
import {
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    ListItem,
    Typography,
    Divider,
    Avatar,
    Popover,
    Box,
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import ComputerOutlinedIcon from '@mui/icons-material/ComputerOutlined';
import { useThemeContext } from '../../contexts/ThemeContext';

/**
 * UserMenu component displays a dropdown menu with user information and options
 * @param {Object} props - Component props
 * @param {Object} props.anchorEl - The anchor element for the menu
 * @param {Function} props.onClose - Function to handle menu close
 * @param {Object} props.user - User information object
 * @param {string} props.user.name - User's full name
 * @param {string} props.user.email - User's email address
 * @param {string} props.user.avatar - User's avatar image URL
 * @returns {JSX.Element} UserMenu component
 */
const UserMenu = ({ anchorEl, onClose, user }) => {
    const { mode, toggleTheme } = useThemeContext();
    const [themeAnchorEl, setThemeAnchorEl] = useState(null);
    const themeButtonRef = useRef(null);
    const open = Boolean(anchorEl);
    const themeOpen = Boolean(themeAnchorEl);

    const handleThemeClick = (event) => {
        event.stopPropagation();
        setThemeAnchorEl(event.currentTarget);
    };

    const handleThemeClose = () => {
        setThemeAnchorEl(null);
    };

    const handleThemeChange = (newMode) => {
        toggleTheme(newMode);
        handleThemeClose();
    };

    const handleMainMenuClick = (event) => {
        // Only close the main menu if clicking outside the theme button
        if (!event.currentTarget.contains(themeButtonRef.current)) {
            onClose();
        }
    };

    return (
        <>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={onClose}
                onClick={handleMainMenuClick}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        minWidth: 280,
                        '& .MuiAvatar-root': {
                            width: 64,
                            height: 64,
                            ml: -0.5,
                            mr: 2,
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                {/* User Info Section */}
                <ListItem sx={{ py: 2 }}>
                    <Avatar
                        src={user.avatar}
                        alt={user.name}
                        sx={{ 
                            width: 64, 
                            height: 64,
                            fontSize: '1.5rem',
                            bgcolor: 'secondary.main',
                            color: 'secondary.contrastText',
                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)',
                        }}
                    >
                        {user.name?.charAt(0)}
                    </Avatar>
                    <ListItemText
                        primary={
                            <Typography variant="subtitle1" fontWeight="medium">
                                {user.name}
                            </Typography>
                        }
                        secondary={
                            <Typography variant="body2" color="text.secondary">
                                {user.email}
                            </Typography>
                        }
                    />
                </ListItem>
                <Divider />

                {/* Menu Options */}
                <MenuItem>
                    <ListItemIcon>
                        <PersonOutlineIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Profile</ListItemText>
                </MenuItem>
                <MenuItem>
                    <ListItemIcon>
                        <SettingsOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Settings</ListItemText>
                </MenuItem>

                {/* Theme Menu Item */}
                <MenuItem 
                    ref={themeButtonRef}
                    onClick={handleThemeClick}
                >
                    <ListItemIcon>
                        <PaletteOutlinedIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Theme</ListItemText>
                </MenuItem>
            </Menu>

            {/* Theme Popover */}
            <Popover
                open={themeOpen}
                anchorEl={themeAnchorEl}
                onClose={handleThemeClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                PaperProps={{
                    sx: {
                        mt: 1,
                        ml: 1,
                        minWidth: 180,
                        borderRadius: 2,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    },
                }}
            >
                <Box sx={{ py: 1 }}>
                    <MenuItem onClick={() => handleThemeChange('light')}>
                        <ListItemIcon>
                            <LightModeOutlinedIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Light Mode</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => handleThemeChange('dark')}>
                        <ListItemIcon>
                            <DarkModeOutlinedIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Dark Mode</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => handleThemeChange('system')}>
                        <ListItemIcon>
                            <ComputerOutlinedIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>System Preference</ListItemText>
                    </MenuItem>
                </Box>
            </Popover>
        </>
    );
};

export default UserMenu; 