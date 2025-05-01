import React, {useContext, useMemo} from 'react';
import {
    DataGrid,
    gridClasses
} from '@mui/x-data-grid';
import {
    Box,
    Typography,
    IconButton,
    Tooltip,
    alpha,
    useTheme
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import {AppContext} from '../../contexts/AppContext';
import {drawerWidth} from "../common/Sidebar";
import CustomGridToolbar from './CustomGridToolbar';

function getAvailableWidth(drawerWidth) {
    if (typeof drawerWidth !== 'number') {
        throw new Error('drawerWidth must be a number');
    }
    return window.innerWidth - drawerWidth;
}

const ResultsTable = () => {
    const {results, loading, generateReceipt} = useContext(AppContext);
    const theme = useTheme();

    // Create columns based on the first result object
    const columns = useMemo(() => {
        if (!results || results.length === 0) return [];

        const firstResult = results[0];
        return Object.keys(firstResult).map((key) => {
            // List of columns that should display currency with $ symbol
            const currencyColumns = ['Sales', 'Sale Price', 'GST Amount', 'Total Amount'];
            const isCurrencyColumn = currencyColumns.includes(key);

            return {
                field: key,
                headerName: key,
                width: 150,
                hide: key === '_id',
                renderCell: (params) => {
                    // Handle different data types for display
                    const value = params.value;

                    if (value === null || value === undefined) {
                        return '';
                    } else if (typeof value === 'object') {
                        // Handle MongoDB ObjectId or Date objects
                        if (value && value['$oid']) {
                            return value['$oid'];
                        } else if (value && value['$date']) {
                            return new Date(value['$date']).toLocaleString();
                        } else if (value && value['$numberInt']) {
                            return isCurrencyColumn ?
                                `$ ${parseInt(value['$numberInt']).toFixed(2)}` :
                                parseInt(value['$numberInt']);
                        } else if (value && value['$numberDouble']) {
                            return isCurrencyColumn ?
                                `$ ${parseFloat(value['$numberDouble']).toFixed(2)}` :
                                parseFloat(value['$numberDouble']).toFixed(2);
                        } else {
                            return JSON.stringify(value);
                        }
                    } else if (isCurrencyColumn) {
                        // Format currency columns
                        return typeof value === 'number' ?
                            `$ ${value.toFixed(2)}` : value;
                    }

                    return value;
                }
            };
        });
    }, [results]);

    // Add action column for receipt generation
    const columnsWithActions = useMemo(() => {
        if (columns.length === 0) return [];

        return [
            ...columns,
            {
                field: 'actions',
                headerName: 'Actions',
                width: 100,
                sortable: false,
                filterable: false,
                renderCell: (params) => {
                    const docId = params.row._id && params.row._id['\$oid'] ?
                        params.row._id['\$oid'] : params.row._id;

                    return (
                        <Tooltip title="Generate Receipt">
                            <IconButton
                                onClick={() => generateReceipt(docId)}
                                size="small"
                                color="primary"
                            >
                                <ReceiptIcon/>
                            </IconButton>
                        </Tooltip>
                    );
                },
            },
        ];
    }, [columns, generateReceipt]);

    // Create rows with unique ids
    const rows = useMemo(() => {
        return results.map((result, index) => {
            const id = result._id && result._id['\$oid'] ?
                result._id['\$oid'] : (result._id || index);

            return {
                ...result,
                id
            };
        });
    }, [results]);

    if (!results || results.length === 0) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '80vh',
                    width: '100%',
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    borderRadius: 1,
                }}
            >
                <Typography variant="body1" color="textSecondary">
                    No results to display. Select a collection and execute a query.
                </Typography>
            </Box>
        );
    }

    return (
        <div style={{width: '100%', height: '80vh'}}>
            <DataGrid
                rows={rows}
                columns={columnsWithActions}
                loading={loading}
                disableRowSelectionOnClick
                getRowHeight={() => 'auto'}
                sx={{
                    [`& .MuiDataGrid-cell`]: {
                        py: 1,
                    },
                    '& .MuiDataGrid-columnHeaderTitle': {
                        fontWeight: 'bold',
                    },
                    width: `${getAvailableWidth(drawerWidth) - 80}px`,
                }}
                initialState={{
                    pagination: {
                        paginationModel: {
                            pageSize: 10,
                        },
                    },
                    columns: {
                        columnVisibilityModel: {
                            _id: false,
                        },
                    },
                }}
                pageSizeOptions={[5, 10, 25, 50, 100]}
                slots={{
                    toolbar: CustomGridToolbar
                }}
                slotProps={{
                    toolbar: {
                        showQuickFilter: true,
                        quickFilterProps: {debounceMs: 500},
                        printOptions: {disableToolbarButton: true}
                    }
                }}
                autoHeight={false}
            />
        </div>
    );
};

export default ResultsTable;