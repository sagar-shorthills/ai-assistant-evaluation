import React, { useContext } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { JsonView } from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import { AppContext } from '../../contexts/AppContext';

const JsonViewer = () => {
    const { results, loading } = useContext(AppContext);

    if (loading) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography>Loading data...</Typography>
            </Box>
        );
    }

    if (!results || results.length === 0) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography>No results to display</Typography>
            </Box>
        );
    }

    return (
        <Paper sx={{ p: 2, overflow: 'auto', maxHeight: '70vh' }}>
            <JsonView
                data={results}
                shouldExpandNode={() => true}
                style={{
                    fontSize: '14px',
                    fontFamily: 'Monaco, monospace',
                    lineHeight: '1.5',
                    backgroundColor: 'transparent',
                    padding: '10px'
                }}
            />
        </Paper>
    );
};

export default JsonViewer;