// src/utils/slackUserCache.js
import { reportError } from './errorReporter';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const CACHE_KEY = 'slack_users_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

class SlackUserCache {
    constructor() {
        this.users = [];
        this.usersMap = new Map();
        this.loaded = false;
        this.loading = false;
    }

    /**
     * Load users from cache or fetch from backend
     */
    async loadUsers() {
        if (this.loaded || this.loading) {
            return this.users;
        }

        this.loading = true;

        try {
            // Try to load from localStorage first
            const cached = this.loadFromCache();
            if (cached) {
                this.setUsers(cached);
                this.loaded = true;
                this.loading = false;
                return this.users;
            }

            // Fetch from backend
            const response = await fetch(`${BACKEND_URL}/api/usersList`);
            const data = await response.json();

            if (!data.ok) {
                throw new Error(`Failed to fetch users: ${data.error}`);
            }

            this.setUsers(data.users);
            this.saveToCache(data.users);
            this.loaded = true;
            this.loading = false;

            return this.users;
        } catch (error) {
            console.error('Error loading Slack users:', error);
            await reportError(error, { context: 'SlackUserCache.loadUsers' });
            this.loading = false;
            throw error;
        }
    }

    /**
     * Set users and build map
     */
    setUsers(users) {
        this.users = users;
        this.usersMap = new Map();

        users.forEach(user => {
            this.usersMap.set(user.id, user);
        });
    }

    /**
     * Find user by name (fuzzy match)
     */
    findUserByName(name) {
        if (!name) return null;

        const searchName = name.toLowerCase().trim();
        let bestMatch = null;
        let bestScore = 0;

        for (const user of this.users) {
            const realName = (user.realName || '').toLowerCase();
            const displayName = (user.displayName || '').toLowerCase();
            const userName = (user.name || '').toLowerCase();

            // Exact match
            if (realName === searchName || displayName === searchName || userName === searchName) {
                return user;
            }

            // Calculate similarity
            const realNameScore = this.calculateSimilarity(realName, searchName);
            const displayNameScore = this.calculateSimilarity(displayName, searchName);
            const userNameScore = this.calculateSimilarity(userName, searchName);

            const maxScore = Math.max(realNameScore, displayNameScore, userNameScore);

            if (maxScore > bestScore) {
                bestScore = maxScore;
                bestMatch = user;
            }
        }

        // Return match if score is 90% or higher
        return bestScore >= 90 ? bestMatch : null;
    }

    /**
     * Get user by ID
     */
    getUserById(id) {
        return this.usersMap.get(id);
    }

    /**
     * Calculate similarity between two strings
     */
    calculateSimilarity(str1, str2) {
        if (!str1 || !str2) return 0;

        const s1 = str1.toLowerCase().trim();
        const s2 = str2.toLowerCase().trim();

        if (s1 === s2) return 100;

        if (s1.includes(s2) || s2.includes(s1)) {
            const longer = Math.max(s1.length, s2.length);
            const shorter = Math.min(s1.length, s2.length);
            return (shorter / longer) * 100;
        }

        // Levenshtein distance
        const matrix = [];
        for (let i = 0; i <= s2.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= s1.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= s2.length; i++) {
            for (let j = 1; j <= s1.length; j++) {
                if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        const distance = matrix[s2.length][s1.length];
        const maxLength = Math.max(s1.length, s2.length);
        return ((maxLength - distance) / maxLength) * 100;
    }

    /**
     * Load from localStorage
     */
    loadFromCache() {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (!cached) return null;

            const { users, timestamp } = JSON.parse(cached);
            const age = Date.now() - timestamp;

            if (age > CACHE_DURATION) {
                localStorage.removeItem(CACHE_KEY);
                return null;
            }

            return users;
        } catch (error) {
            console.error('Error loading from cache:', error);
            return null;
        }
    }

    /**
     * Save to localStorage
     */
    saveToCache(users) {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                users,
                timestamp: Date.now(),
            }));
        } catch (error) {
            console.error('Error saving to cache:', error);
        }
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.users = [];
        this.usersMap = new Map();
        this.loaded = false;
        localStorage.removeItem(CACHE_KEY);
    }
}

// Export singleton instance
export const slackUserCache = new SlackUserCache();