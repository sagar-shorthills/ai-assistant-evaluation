import React, { useContext } from 'react';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    useTheme,
    useMediaQuery,
    Typography,
    Toolbar,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CollectionSelector from '../collection/CollectionSelector';
import FieldSelector from '../collection/FieldSelector';
import GstConfig from '../gst/GstConfig';
import { AppContext } from '../../contexts/AppContext';

export const drawerWidth = 320;

const Sidebar = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { loading } = useContext(AppContext);

    const drawer = (
        <>
            <Toolbar />
            <Box sx={{ overflow: 'auto', p: 2 }}>
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                    Data Selection
                </Typography>

                <CollectionSelector />
                <FieldSelector />

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
                    GST Configuration
                </Typography>

                <GstConfig />
            </Box>
        </>
    );

    return (
        <Box
            component="nav"
            sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            aria-label="sidebar navigation"
        >
            {/* Mobile drawer */}
            {isMobile ? (
                <Drawer
                    variant="temporary"
                    open={false} // Control this with state if needed
                    sx={{
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            backgroundColor: theme.palette.background.paper
                        },
                    }}
                    ModalProps={{ keepMounted: true }}
                >
                    {drawer}
                </Drawer>
            ) : (
                // Desktop permanent drawer
                <Drawer
                    variant="permanent"
                    sx={{
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            backgroundColor: theme.palette.background.paper,
                            borderRight: `1px solid \${theme.palette.divider}`
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            )}
        </Box>
    );
};

export default Sidebar;