import React, { useContext, useState, useEffect } from 'react';
import {
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
    Typography,
    Button,
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import { AppContext } from '../../contexts/AppContext';

const GST_PERCENTAGES = [5, 12, 18, 28];

const GstConfig = () => {
    const {
        fields,
        gstConfig,
        handleGstConfigChange,
        loading,
        selectedCollection,
        results,
        executeQuery,
    } = useContext(AppContext);

    // Filter fields that might be suitable for GST calculation (numeric fields)
    const [numericFields, setNumericFields] = useState([]);

    useEffect(() => {
        if (results && results.length > 0) {
            // Try to determine which fields contain numeric values
            const potentialNumericFields = fields.filter(fieldName => {
                const firstResult = results[0];
                const value = firstResult[fieldName];
                // Check if the value is a number or can be parsed as one
                return (
                    typeof value === 'number' ||
                    (typeof value === 'string' && !isNaN(parseFloat(value)))
                );
            });
            setNumericFields(potentialNumericFields);
        } else {
            setNumericFields(fields);
        }
    }, [fields, results]);

    const handleGstEnabledChange = (event) => {
        handleGstConfigChange({
            ...gstConfig,
            enabled: event.target.checked
        });
    };

    const handleGstFieldChange = (event) => {
        handleGstConfigChange({
            ...gstConfig,
            field: event.target.value
        });
    };

    const handleGstPercentageChange = (event) => {
        handleGstConfigChange({
            ...gstConfig,
            percentage: event.target.value
        });
    };

    const applyGstCalculation = () => {
        if (gstConfig.enabled && gstConfig.field) {
            executeQuery();
        }
    };

    return (
        <Box sx={{ mb: 2 }}>
            <FormControlLabel
                control={
                    <Switch
                        checked={gstConfig.enabled}
                        onChange={handleGstEnabledChange}
                        disabled={loading || !selectedCollection || fields.length === 0}
                    />
                }
                label="Enable GST Calculation"
            />

            {gstConfig.enabled && (
                <>
                    <Box sx={{ mt: 2 }}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel id="gst-field-label">GST Field</InputLabel>
                            <Select
                                labelId="gst-field-label"
                                id="gst-field-select"
                                value={gstConfig.field}
                                label="GST Field"
                                onChange={handleGstFieldChange}
                                disabled={loading || numericFields.length === 0}
                            >
                                {numericFields.map((field) => (
                                    <MenuItem key={field} value={field}>
                                        {field}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel id="gst-percentage-label">GST Percentage</InputLabel>
                            <Select
                                labelId="gst-percentage-label"
                                id="gst-percentage-select"
                                value={gstConfig.percentage}
                                label="GST Percentage"
                                onChange={handleGstPercentageChange}
                                disabled={loading}
                            >
                                {GST_PERCENTAGES.map((percentage) => (
                                    <MenuItem key={percentage} value={percentage}>
                                        {percentage}%
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            GST Amount will be calculated as: {gstConfig.field} × {gstConfig.percentage}%
                        </Typography>

                        <Button
                            variant="outlined"
                            color="primary"
                            fullWidth
                            onClick={applyGstCalculation}
                            disabled={loading || !gstConfig.field || !selectedCollection}
                            startIcon={<CalculateIcon />}
                        >
                            Apply GST Calculation
                        </Button>
                    </Box>
                </>
            )}
        </Box>
    );
};

export default GstConfig;