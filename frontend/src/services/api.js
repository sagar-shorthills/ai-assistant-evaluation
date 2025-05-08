import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with base URL
const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// API service functions
export const collectionsApi = {
    // Get all collections
    getCollections: async () => {
        try {
            const response = await apiClient.get('/collections');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error?.message || 'Failed to fetch collections');
        }
    },

    // Get fields from a collection
    getFields: async (collectionName) => {
        try {
            const response = await apiClient.get(`/fields?collection=${collectionName}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error?.message || 'Failed to fetch fields');
        }
    }
};

export const queryApi = {
    // Execute a query with optional GST calculation
    executeQuery: async (collection, fields, limit, gstConfig) => {
        try {
            const response = await apiClient.post('/query', {
                collection,
                fields,
                limit,
                gstConfig
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error?.message || 'Failed to execute query');
        }
    },

    // Export data in a specified format
    exportData: async (data, format, filename) => {
        try {
            const response = await apiClient.post('/export', {
                data,
                format,
                filename
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error?.message || 'Failed to export data');
        }
    },

    // Generate receipt for a specific document
    generateReceipt: async (collection, documentId, gstConfig) => {
        try {
            const response = await apiClient.post(`/receipt/${collection}/${documentId}`, {
                gstConfig
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error?.message || 'Failed to generate receipt');
        }
    },


    // Generate receipt for a specific document
    generateGSTReceipt: async (gstConfig) => {
        try {
            const response = await apiClient.post(`/report/gstr3b`, gstConfig
            );
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error?.message || 'Failed to generate receipt');
        }
    }
};

export default {
    collectionsApi,
    queryApi
};