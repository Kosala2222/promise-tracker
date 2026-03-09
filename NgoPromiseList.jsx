// frontend/navigation/CitizenStack.jsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CitizenDashboard from '../screens/App/citizen/CitizenDashboard';
import CitizenProfileScreen from '../screens/App/citizen/CitizenProfileScreen';
import BrowsePoliticiansScreen from '../screens/App/citizen/BrowsePoliticiansScreen';
import PoliticianPromisesPublicScreen from '../screens/App/citizen/PoliticianPromisesPublicScreen';
import SubmitEvidenceScreen from '../screens/App/citizen/SubmitEvidenceScreen';
import CitizenAchievementsScreen from '../screens/App/citizen/CitizenAchievementsScreen';
import CitizenHeader from '../components/CitizenHeader';
import CitizenNotificationScreen from '../screens/App/citizen/CitizenNotificationScreen';

const Stack = createNativeStackNavigator();

const CitizenStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: true,
                header: ({ navigation }) => <CitizenHeader navigation={navigation} />,
            }}
        >
            <Stack.Screen name="CitizenHome" component={CitizenDashboard} />
            <Stack.Screen name="CitizenProfile" component={CitizenProfileScreen} />
            <Stack.Screen name="BrowsePoliticians" component={BrowsePoliticiansScreen} />
            {/* Screen to view all promises of a selected politician or the global feed */}
            <Stack.Screen name="PoliticianPromisesPublic" component={PoliticianPromisesPublicScreen} />
            {/* Screen to submit evidence on a specific promise */}
            <Stack.Screen name="SubmitEvidence" component={SubmitEvidenceScreen} />
            {/* Citizen achievements based on evidence status */}
            <Stack.Screen name="CitizenAchievements" component={CitizenAchievementsScreen} />
            <Stack.Screen name="CitizenNotifications" component={CitizenNotificationScreen} />
        </Stack.Navigator>
    );
};

export default CitizenStack;
