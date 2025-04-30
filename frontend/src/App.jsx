import React, { useContext } from 'react';
import { Box, CssBaseline, Toolbar, Paper, Stack } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import ResultsTable from './components/results/ResultsTable';
import JsonViewer from './components/results/JsonViewer';
import ViewToggle from './components/results/ViewToggle';
import ExportOptions from './components/export/ExportOptions';
import LoadingIndicator from './components/common/LoadingIndicator';
import { AppContext, AppProvider } from './contexts/AppContext';
import 'react-toastify/dist/ReactToastify.css';

// Main content area
const MainContent = () => {
    const { viewType, loading } = useContext(AppContext);

    return (
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Toolbar />
            <Paper sx={{ p: 2 }}>
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <ViewToggle />
                    <Box sx={{ flexGrow: 1 }} />
                    <ExportOptions />
                </Stack>

                {viewType === 'table' ? <ResultsTable /> : <JsonViewer />}
            </Paper>

            <LoadingIndicator open={loading} />
        </Box>
    );
};

// App component with providers
const App = () => {
    return (
        <ThemeProvider theme={theme}>
            <AppProvider>
                <Box sx={{ display: 'flex' }}>
                    <CssBaseline />
                    <Header />
                    <Sidebar />
                    <MainContent />
                    <ToastContainer position="bottom-right" theme="colored" />
                </Box>
            </AppProvider>
        </ThemeProvider>
    );
};

export default App;