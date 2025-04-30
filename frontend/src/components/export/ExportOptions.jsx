import React, { useContext, useState } from 'react';
import {
    Box,
    Button,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    CircularProgress,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import FileExcelIcon from '@mui/icons-material/TableView';
import FileCsvIcon from '@mui/icons-material/GridOn';
import FileJsonIcon from '@mui/icons-material/Code';
import FilePdfIcon from '@mui/icons-material/PictureAsPdf';
import { AppContext } from '../../contexts/AppContext';

const ExportOptions = () => {
    const { exportData, loading, results } = useContext(AppContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleExport = (format) => {
        exportData(format);
        handleClose();
    };

    const exportOptions = [
        {
            label: 'Excel (.xlsx)',
            icon: <FileExcelIcon />,
            format: 'excel',
        },
        {
            label: 'CSV (.csv)',
            icon: <FileCsvIcon />,
            format: 'csv',
        },
        {
            label: 'JSON (.json)',
            icon: <FileJsonIcon />,
            format: 'json',
        },
        {
            label: 'PDF (.pdf)',
            icon: <FilePdfIcon />,
            format: 'pdf',
        },
    ];

    return (
        <Box>
            <Button
                variant="contained"
                color="primary"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                onClick={handleClick}
                disabled={loading || !results || results.length === 0}
            >
                {loading ? 'Exporting...' : 'Export Data'}
            </Button>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                {exportOptions.map((option) => (
                    <MenuItem
                        key={option.format}
                        onClick={() => handleExport(option.format)}
                        disabled={loading}
                    >
                        <ListItemIcon>{option.icon}</ListItemIcon>
                        <ListItemText>{option.label}</ListItemText>
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
};

export default ExportOptions;