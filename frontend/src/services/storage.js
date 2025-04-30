// Local storage service for persisting app state

export const STORAGE_KEYS = {
    SELECTED_COLLECTION: 'selected_collection',
    SELECTED_FIELDS: 'selected_fields',
    LIMIT: 'limit',
    GST_CONFIG: 'gst_config',
    VIEW_TYPE: 'view_type'
};

export const saveToStorage = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error saving to localStorage: ${error}`);
    }
};

export const getFromStorage = (key, defaultValue = null) => {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage: ${error}`);
        return defaultValue;
    }
};

export const clearStorageItem = (key) => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Error clearing localStorage item: ${error}`);
    }
};

export default {
    STORAGE_KEYS,
    saveToStorage,
    getFromStorage,
    clearStorageItem
};