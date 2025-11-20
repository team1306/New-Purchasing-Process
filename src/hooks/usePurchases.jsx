
import { useState, useEffect } from 'react';
import { fetchPurchases, updatePurchaseByRequestId } from '../utils/googleSheets';
import { getRefreshedAccessToken } from '../utils/googleAuth';

export const usePurchases = () => {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    const loadPurchases = async () => {
        try {
            setLoading(true);
            const token = await getRefreshedAccessToken();
            const data = await fetchPurchases(token);
            setPurchases(data);
            setError(null);
        } catch (err) {
            console.error('Error loading purchases:', err);
            setError('Failed to load data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const refreshPurchases = async () => {
        try {
            setRefreshing(true);
            const token = await getRefreshedAccessToken();
            const data = await fetchPurchases(token);
            setPurchases(data);
            setError(null);
        } catch (err) {
            console.error('Error refreshing purchases:', err);
            alert('Failed to refresh data. Please try again.');
        } finally {
            setRefreshing(false);
        }
    };

    const updatePurchase = async (requestId, updates) => {
        try {
            const token = await getRefreshedAccessToken();
            await updatePurchaseByRequestId(requestId, updates, token);
            await refreshPurchases();
        } catch (err) {
            console.error('Error updating purchase:', err);
            throw err;
        }
    };

    useEffect(() => {
        loadPurchases();
    }, []);

    return {
        purchases,
        loading,
        error,
        refreshing,
        loadPurchases,
        refreshPurchases,
        updatePurchase
    };
};
