import React, { useContext } from 'react';
import {
    Box,
    FormControl,
    InputLabel,
    Checkbox,
    ListItemText,
    MenuItem,
    Select,
    Chip,
    OutlinedInput,
} from '@mui/material';
import { AppContext } from '../../contexts/AppContext';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const FieldSelector = () => {
    const {
        fields,
        selectedFields,
        handleFieldsChange,
        loading,
        selectedCollection,
    } = useContext(AppContext);

    const handleChange = (event) => {
        const {
            target: { value },
        } = event;
        handleFieldsChange(typeof value === 'string' ? value.split(',') : value);
    };

    return (
        <Box sx={{ mb: 2 }}>
            <FormControl fullWidth disabled={loading || !selectedCollection || fields.length === 0}>
                <InputLabel id="field-select-label">Select Fields</InputLabel>
                <Select
                    labelId="field-select-label"
                    id="field-select"
                    multiple
                    value={selectedFields}
                    onChange={handleChange}
                    input={<OutlinedInput id="select-multiple-fields" label="Select Fields" />}
                    renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                                <Chip key={value} label={value} size="small" />
                            ))}
                        </Box>
                    )}
                    MenuProps={MenuProps}
                >
                    {fields.map((field) => (
                        <MenuItem key={field} value={field}>
                            <Checkbox checked={selectedFields.indexOf(field) > -1} />
                            <ListItemText primary={field} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
};

export default FieldSelector;