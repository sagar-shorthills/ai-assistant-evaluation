import React, { useContext } from 'react';
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Box,
    Button,
    CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { AppContext } from '../../contexts/AppContext';

const CollectionSelector = () => {
    const {
        collections,
        selectedCollection,
        handleCollectionChange,
        limit,
        handleLimitChange,
        executeQuery,
        loading,
    } = useContext(AppContext);

    const handleExecuteQuery = () => {
        executeQuery();
    };

    return (
        <Box sx={{ mb: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="collection-select-label">Collection</InputLabel>
                <Select
                    labelId="collection-select-label"
                    id="collection-select"
                    value={selectedCollection}
                    label="Collection"
                    onChange={(e) => handleCollectionChange(e.target.value)}
                    disabled={loading || collections.length === 0}
                >
                    {collections.length === 0 ? (
                        <MenuItem value="" disabled>
                            No collections available
                        </MenuItem>
                    ) : (
                        collections.map((collection) => (
                            <MenuItem key={collection} value={collection}>
                                {collection}
                            </MenuItem>
                        ))
                    )}
                </Select>
            </FormControl>

            <TextField
                label="Limit Results"
                type="number"
                fullWidth
                value={limit}
                onChange={(e) => handleLimitChange(e.target.value)}
                inputProps={{ min: 1, max: 100 }}
                disabled={loading}
                sx={{ mb: 2 }}
            />

            <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleExecuteQuery}
                disabled={!selectedCollection || loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
            >
                {loading ? 'Loading...' : 'Query Data'}
            </Button>
        </Box>
    );
};

export default CollectionSelector;