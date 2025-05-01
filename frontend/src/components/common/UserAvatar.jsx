import React from 'react';
import { Avatar, Badge, styled } from '@mui/material';

/**
 * StyledBadge component for the user status indicator
 */
const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        backgroundColor: '#44b700',
        color: '#44b700',
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
        '&::after': {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            animation: 'ripple 1.2s infinite ease-in-out',
            border: '1px solid currentColor',
            content: '""',
        },
    },
    '@keyframes ripple': {
        '0%': {
            transform: 'scale(.8)',
            opacity: 1,
        },
        '100%': {
            transform: 'scale(2.4)',
            opacity: 0,
        },
    },
}));

/**
 * UserAvatar component displays the user's avatar with a status badge
 * @param {Object} props - Component props
 * @param {Object} props.user - User information object
 * @param {string} props.user.avatar - User's avatar image URL
 * @param {string} props.user.name - User's name (for alt text)
 * @param {Function} props.onClick - Click handler for the avatar
 * @returns {JSX.Element} UserAvatar component
 */
const UserAvatar = ({ user, onClick }) => {
    return (
        <Avatar
            onClick={onClick}
            src={user.avatar}
            alt={user.name}
            sx={{
                bgcolor: 'secondary.main',
                color: 'secondary.contrastText',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)',
                width: 36,
                height: 36,
                cursor: 'pointer',
            }}
        >
            {user.name?.charAt(0)}
        </Avatar>
    );
};

export default UserAvatar; 