import React, { createContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { collectionsApi, queryApi } from '../services/api';
import { STORAGE_KEYS, getFromStorage, saveToStorage } from '../services/storage';

// Create context
export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    // State variables
    const [collections, setCollections] = useState([]);
    const [selectedCollection, setSelectedCollection] = useState(
        getFromStorage(STORAGE_KEYS.SELECTED_COLLECTION, '')
    );
    const [fields, setFields] = useState([]);
    const [selectedFields, setSelectedFields] = useState(
        getFromStorage(STORAGE_KEYS.SELECTED_FIELDS, [])
    );
    const [limit, setLimit] = useState(
        getFromStorage(STORAGE_KEYS.LIMIT, 5)
    );
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewType, setViewType] = useState(
        getFromStorage(STORAGE_KEYS.VIEW_TYPE, 'table')
    );
    const [gstConfig, setGstConfig] = useState(
        getFromStorage(STORAGE_KEYS.GST_CONFIG, { enabled: false, field: '', percentage: 18 })
    );

    // Fetch collections when the component mounts
    useEffect(() => {
        const fetchCollections = async () => {
            try {
                setLoading(true);
                const response = await collectionsApi.getCollections();
                setCollections(response.data);
            } catch (error) {
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCollections();
    }, []);

    // Fetch fields when a collection changes
    useEffect(() => {
        const fetchFields = async () => {
            if (!selectedCollection) return;

            try {
                setLoading(true);
                const response = await collectionsApi.getFields(selectedCollection);
                setFields(response.data);

                // Auto-select all fields if none selected yet
                if (selectedFields.length === 0) {
                    setSelectedFields(response.data);
                    saveToStorage(STORAGE_KEYS.SELECTED_FIELDS, response.data);
                }
            } catch (error) {
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFields();
    }, [selectedCollection]);

    // Save preferences to localStorage when they change
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.SELECTED_COLLECTION, selectedCollection);
    }, [selectedCollection]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.SELECTED_FIELDS, selectedFields);
    }, [selectedFields]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.LIMIT, limit);
    }, [limit]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.VIEW_TYPE, viewType);
    }, [viewType]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.GST_CONFIG, gstConfig);
    }, [gstConfig]);

    // Handler function for collection change
    const handleCollectionChange = useCallback((collectionName) => {
        setSelectedCollection(collectionName);
        setSelectedFields([]);
        setResults([]);
    }, []);

    // Handler function for field selection
    const handleFieldsChange = useCallback((newFields) => {
        setSelectedFields(newFields);
    }, []);

    // Handler function for limit change
    const handleLimitChange = useCallback((newLimit) => {
        setLimit(parseInt(newLimit) || 5);
    }, []);

    // Handler function for GST configuration
    const handleGstConfigChange = useCallback((config) => {
        setGstConfig(config);
    }, []);

    // Handler function to execute query
    const executeQuery = useCallback(async () => {
        if (!selectedCollection) {
            toast.warning('Please select a collection first');
            return;
        }

        try {
            setLoading(true);
            const response = await queryApi.executeQuery(
                selectedCollection,
                selectedFields,
                limit,
                gstConfig
            );
            setResults(response.data);
            toast.success(`Retrieved ${response.data.length} records`);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }, [selectedCollection, selectedFields, limit, gstConfig]);

    // Handler function for exporting data
    const exportData = useCallback(async (format) => {
        if (!results || results.length === 0) {
            toast.warning('No data to export');
            return;
        }

        try {
            setLoading(true);
            const response = await queryApi.exportData(
                results,
                format,
                selectedCollection
            );

            // Create and download the file
            const dataUrl = `data:${response.mimeType};base64,${response.data}`;
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = response.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success(`Exported data as ${format.toUpperCase()}`);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }, [results, selectedCollection]);

    // Handler function for generating receipt
    const generateReceipt = useCallback(async (documentId) => {
        try {
            setLoading(true);
            const response = await queryApi.generateGSTReceipt(
                { companyId: "7d09171c-2b93-4f09-8f2d-f6cccaea47d4", year: 2025, month: 1, format: "pdf" }
            );

            // Create and download the receipt
            const dataUrl = `data: ${response.mimeType};base64, ${response.data}`;
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = response.filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success('Receipt generated');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }, [selectedCollection, gstConfig]);

    return (
        <AppContext.Provider
            value={{
                collections,
                selectedCollection,
                fields,
                selectedFields,
                limit,
                results,
                loading,
                viewType,
                gstConfig,
                handleCollectionChange,
                handleFieldsChange,
                handleLimitChange,
                handleGstConfigChange,
                executeQuery,
                exportData,
                generateReceipt,
                setViewType
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export default AppProvider;