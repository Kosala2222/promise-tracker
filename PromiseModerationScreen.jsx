// frontend/navigation/NgoStack.jsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NgoDashboard from '../screens/App/ngo/NgoDashboard';
import NgoPromiseList from '../screens/App/ngo/NgoPromiseList';
import NgoProfileScreen from '../screens/App/ngo/NgoProfileScreen';
import PromiseModerationScreen from '../screens/App/ngo/PromiseModerationScreen'; // For editing promise details/status
import EvidenceReviewScreen from '../screens/App/ngo/EvidenceReviewScreen';     // For viewing and verifying citizen evidence
import NgoHeader from '../components/NgoHeader';
import NgoVerifyScreen from '../screens/App/ngo/NgoVerifyScreen';

const Stack = createNativeStackNavigator();

const NgoStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: true,
                header: ({ navigation }) => <NgoHeader navigation={navigation} />,
            }}
        >
            <Stack.Screen name="NgoHome" component={NgoDashboard} />
            <Stack.Screen 
                name="NgoPromiseList" 
                component={NgoPromiseList} 
                options={{ title: 'Promises' }}
            />
            <Stack.Screen 
                name="NgoProfile" 
                component={NgoProfileScreen} 
                options={{ headerShown: true, title: 'My Profile' }}
            />
            <Stack.Screen 
                name="NgoVerify" 
                component={NgoVerifyScreen} 
                options={{ title: 'Verify Politicians' }}
            />

            <Stack.Screen 
                name="PromiseModeration" 
                component={PromiseModerationScreen} 
                options={{ headerShown: true, title: 'Moderate Promise' }}
            />
            <Stack.Screen 
                name="EvidenceReview" 
                component={EvidenceReviewScreen} 
                options={{ headerShown: true, title: 'Review Citizen Evidence' }}
            />
        </Stack.Navigator>
    );
};

export default NgoStack;