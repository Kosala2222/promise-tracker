import './global.css'; 
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { ActivityIndicator, View, Text } from 'react-native'; 
import { StatusBar } from 'expo-status-bar';

// --- AUTH SCREENS ---
import LoginScreen from './screens/Auth/LoginScreen';
import SignupScreen from './screens/Auth/SignupScreen';
import OnboardingScreen from './screens/OnboardingScreen';

// --- APP SCREENS (DASHBOARDS) ---
// methana wenas krndone, App eke role wala widiht filders hadala path wenas krndone,anika navigation dandone,ekiynne e role ekata specific dashboard ekakata dandone
import CitizenStack from './navigation/CitizenStack';
import NgoStack from './navigation/NgoStack';
import JournalistStack from './navigation/JournalistStack';
import AdminDashboard from './screens/App/AdminDashboard';

// --- STACK NAVIGATORS ---
import PoliticianStack from './navigation/PoliticianStack';

const Stack = createNativeStackNavigator();

/**
 * Renders the correct dashboard component (Navigator Stack) based on the authenticated user's role.
 * This component is only rendered when `user` is confirmed to be logged in.
 */
const RoleBasedDashboard = () => {
    const { user } = useContext(AuthContext);

    // CRITICAL GUARD CLAUSE: This check prevents the race condition crash by
    // forcing the component to wait until the `user` object is stable and 
    // explicitly contains a string value for `role`.
    if (!user || typeof user.role !== 'string') {
        console.warn('RoleBasedDashboard: User object is present but role is unstable/undefined. Waiting...');
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text className="mt-4 text-gray-500">Authenticating role for dashboard...</Text>
            </View>
        );
    }
    
    // At this point, user.role is GUARANTEED to be a stable string.
    const role = user.role; 

    // Use a switch statement for clean, explicit role-based rendering
    switch (role) {
        case 'politician':
            return <PoliticianStack />; 
        case 'ngo':
            return <NgoStack />;
        case 'journalist':
            return <JournalistStack />;
        case 'admin':
            return <AdminDashboard />;
        case 'citizen':
        default:
            // Default catches 'citizen' and any unexpected role string safely
            return <CitizenStack />;
    }
};

/**
 * Component responsible for managing the root navigation structure (Auth vs. App).
 */
const AppNav = () => {
    const { user, isAppReady } = useContext(AuthContext);

    // Show a global loading screen while checking storage/token status
    if (!isAppReady) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text className="mt-4 text-indigo-500">Checking session...</Text>
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {user ? (
                    <Stack.Screen name="Dashboard" component={RoleBasedDashboard} />
                ) : (
                    <>
                        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Signup" component={SignupScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};


// Main component wrapped in AuthProvider
const App = () => {
    return (
        <AuthProvider>
            <StatusBar style="auto" />
            <AppNav />
        </AuthProvider>
    );
};

export default App;
