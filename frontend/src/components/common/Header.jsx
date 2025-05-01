import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    useTheme,
    useMediaQuery,
    Avatar,
} from '@mui/material';
import DatabaseIcon from '@mui/icons-material/Storage';
import {styled} from '@mui/material/styles';
import Badge from '@mui/material/Badge';

const StyledBadge = styled(Badge)(({theme}) => ({
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

const Header = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
                <DatabaseIcon sx={{mr: 2}}/>
                <Typography variant="h6" component="div" sx={{flexGrow: 1, fontWeight: 500}}>
                    {isMobile ? 'MongoDB Explorer' : 'MongoDB Data Exploration Tool with GST Integration'}
                </Typography>

                <Box sx={{display: 'flex', alignItems: 'center'}}>
                    <StyledBadge
                        overlap="circular"
                        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                        variant="dot"
                    >
                        <Avatar
                            sx={{
                                bgcolor: theme.palette.secondary.main,
                                color: theme.palette.secondary.contrastText,
                                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)',
                                width: 36,
                                height: 36
                            }}
                            sizes={'small'}
                        >
                            SS
                        </Avatar>
                    </StyledBadge>

                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;