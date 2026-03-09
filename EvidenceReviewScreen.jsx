import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { Alert } from 'react-native'; 
import { API_BASE_URL } from '../config/env';

// --- SAFER STORAGE MOCK SETUP ---
// This entire mock setup is kept for your development environment
const getSafeStorage = () => {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            return window.localStorage;
        }
    } catch (e) {
        // localStorage access failed
    }
    
    // Fallback: Use a simple, non-persistent, in-memory object
    const inMemoryStorage = {};
    // console.warn("Using in-memory storage mock. Data will not persist across refreshes.");
    return {
        setItem: (key, value) => { inMemoryStorage[key] = value; },
        getItem: (key) => inMemoryStorage[key] || null,
        removeItem: (key) => { delete inMemoryStorage[key]; },
    };
};

const safeStorage = getSafeStorage();

// --- Mocks for React Native/Expo storage APIs using the safe storage mechanism ---

const SecureStore = {
    setItemAsync: async (key, value) => {
        try {
            safeStorage.setItem(`secure:${key}`, value);
        } catch (e) {
            console.error("SecureStore Mock Write Error:", e);
        }
    },
    getItemAsync: async (key) => {
        try {
            return safeStorage.getItem(`secure:${key}`);
        } catch (e) {
            console.error("SecureStore Mock Read Error:", e);
            return null;
        }
    },
    deleteItemAsync: async (key) => {
        try {
            safeStorage.removeItem(`secure:${key}`);
        } catch (e) {
            console.error("SecureStore Mock Delete Error:", e);
        }
    }
};

const AsyncStorage = {
    setItem: async (key, value) => {
        try {
            safeStorage.setItem(`async:${key}`, value);
        } catch (e) {
            console.error("AsyncStorage Mock Write Error:", e);
        }
    },
    getItem: async (key) => {
        try {
            return safeStorage.getItem(`async:${key}`);
        } catch (e) {
            console.error("AsyncStorage Mock Read Error:", e);
            return null;
        }
    },
    removeItem: async (key) => {
        try {
            safeStorage.removeItem(`async:${key}`);
        } catch (e) {
            console.error("AsyncStorage Mock Delete Error:", e);
        }
    }
};

const AUTH_API = `${API_BASE_URL}/auth`; 

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); 
    const [token, setTokenState] = useState(null); // 🔥 FIX: New state to hold the JWT token
    const [isLoading, setIsLoading] = useState(false);
    const [isAppReady, setIsAppReady] = useState(false); 

    // --- UTILITIES ---

    const setAuthToken = async (token) => {
        setTokenState(token); // 🔥 FIX: Update React state here
        if (token) {
            await SecureStore.setItemAsync('userToken', token);
            // CRITICAL: Set the default Authorization header for ALL axios calls
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            await SecureStore.deleteItemAsync('userToken');
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    const handleSuccessfulAuth = async (responseData) => {
        const { token, user: userData } = responseData;
        
        if (!token || !userData || !userData._id) {
            console.error('Server response missing token, user data, or user ID.');
            throw new Error("Invalid server response: Missing authentication data.");
        }

        const safeUserData = {
            _id: userData._id,
            username: userData.username,
            email: userData.email,
            role: userData.role?.toLowerCase() || 'citizen', 
        };

        await setAuthToken(token); // Sets token state and secure storage
        await AsyncStorage.setItem('userData', JSON.stringify(safeUserData));

        setUser(safeUserData);
    };


    // --- AUTH ACTIONS ---

    const login = async (email, password) => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${AUTH_API}/login`, { email, password });
            await handleSuccessfulAuth(response.data);
            setIsLoading(false);
            return { success: true };
        } catch (error) {
            setIsLoading(false);
            const errorMessage = error.response?.data?.message || error.message || 'Login failed. Check your credentials.';
            throw new Error(errorMessage); 
        }
    };

    const signup = async (username, email, password, role) => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${AUTH_API}/signup`, { username, email, password, role });
            await handleSuccessfulAuth(response.data);
            setIsLoading(false);
            return { success: true };
        } catch (error) {
            setIsLoading(false);
            const errorMessage = error.response?.data?.message || error.message || 'Signup failed. Check server connection.';
            throw new Error(errorMessage);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        await setAuthToken(null); // Clears token state and storage
        await AsyncStorage.removeItem('userData');
        setUser(null);
        setIsLoading(false);
    };

    // --- INITIAL LOAD ---

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const storedToken = await SecureStore.getItemAsync('userToken');
                if (storedToken) {
                    // Set token state and header globally
                    await setAuthToken(storedToken); 
                    
                    const userDataString = await AsyncStorage.getItem('userData');
                    if (userDataString) {
                        const storedUser = JSON.parse(userDataString);
                        storedUser.role = storedUser.role?.toLowerCase() || 'citizen';
                        setUser(storedUser);
                    }
                }
            } catch (error) {
                console.log('Error during initial auth check:', error);
                await setAuthToken(null);
                await AsyncStorage.removeItem('userData');
            } finally {
                setIsAppReady(true);
            }
        };

        checkLoginStatus();
    }, []);

    // Provide context values
    const contextValue = {
        user,
        token, // 🔥 FIX: Expose the token state here for screen components to use
        isLoading,
        isAppReady,
        login,
        signup,
        logout,
        API_BASE_URL,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};