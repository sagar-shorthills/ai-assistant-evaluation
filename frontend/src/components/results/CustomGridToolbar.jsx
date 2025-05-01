import React from 'react';
import {
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarDensitySelector,
    GridToolbarExport,
    GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import { Box } from '@mui/material';

/**
 * CustomGridToolbar component provides a customized toolbar for the DataGrid
 * with an outlined search box and other grid controls
 * @returns {JSX.Element} CustomGridToolbar component
 */
const CustomGridToolbar = () => {
    return (
        <GridToolbarContainer sx={{ p: 1 }}>
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                width: '100%',
                gap: 1
            }}>
                <Box sx={{ 
                    display: 'flex', 
                    gap: 1,
                    flex: 1
                }}>
                    <GridToolbarColumnsButton />
                    <GridToolbarFilterButton />
                    <GridToolbarDensitySelector />
                    <GridToolbarExport />
                </Box>
                <Box sx={{ 
                    minWidth: 200,
                    '& .MuiInputBase-root': {
                        height: 32
                    }
                }}>
                    <GridToolbarQuickFilter
                        variant="outlined"
                        size="small"
                        placeholder="Search..."
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'primary.main',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'primary.main',
                                },
                            },
                        }}
                    />
                </Box>
            </Box>
        </GridToolbarContainer>
    );
};

export default CustomGridToolbar; 