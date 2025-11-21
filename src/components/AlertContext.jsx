import { createContext, useContext, useState } from 'react';
import CustomAlert from './CustomAlert';

const AlertContext = createContext();

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within AlertProvider');
    }
    return context;
};

export const AlertProvider = ({ children }) => {
    const [alertConfig, setAlertConfig] = useState(null);

    const showAlert = (message, options = {}) => {
        return new Promise((resolve) => {
            setAlertConfig({
                message,
                type: options.type || 'info', // 'info', 'warning', 'error', 'success'
                confirmText: options.confirmText || 'OK',
                cancelText: options.cancelText,
                onConfirm: () => {
                    setAlertConfig(null);
                    resolve(true);
                },
                onCancel: () => {
                    setAlertConfig(null);
                    resolve(false);
                }
            });
        });
    };

    const showConfirm = (message, options = {}) => {
        return showAlert(message, {
            type: 'warning',
            confirmText: options.confirmText || 'Confirm',
            cancelText: options.cancelText || 'Cancel',
            ...options
        });
    };

    const showError = (message, options = {}) => {
        return showAlert(message, {
            type: 'error',
            confirmText: 'OK',
            ...options
        });
    };

    const showSuccess = (message, options = {}) => {
        return showAlert(message, {
            type: 'success',
            confirmText: 'OK',
            ...options
        });
    };

    return (
        <AlertContext.Provider value={{ showAlert, showConfirm, showError, showSuccess }}>
            {children}
            {alertConfig && <CustomAlert {...alertConfig} />}
        </AlertContext.Provider>
    );
};