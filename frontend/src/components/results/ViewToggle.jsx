import React, { useContext } from 'react';
import {
    Box,
    ToggleButtonGroup,
    ToggleButton,
    Tooltip
} from '@mui/material';
import TableViewIcon from '@mui/icons-material/TableView';
import CodeIcon from '@mui/icons-material/Code';
import { AppContext } from '../../contexts/AppContext';

const ViewToggle = () => {
    const { viewType, setViewType } = useContext(AppContext);

    const handleViewChange = (event, newView) => {
        if (newView !== null) {
            setViewType(newView);
        }
    };

    return (
        <Box sx={{ mb: 2 }}>
            <ToggleButtonGroup
                value={viewType}
                exclusive
                onChange={handleViewChange}
                aria-label="view type"
                size="small"
            >
                <ToggleButton value="table" aria-label="table view">
                    <Tooltip title="Table View">
                        <TableViewIcon />
                    </Tooltip>
                </ToggleButton>
                <ToggleButton value="json" aria-label="json view">
                    <Tooltip title="JSON View">
                        <CodeIcon />
                    </Tooltip>
                </ToggleButton>
            </ToggleButtonGroup>
        </Box>
    );
};

export default ViewToggle;