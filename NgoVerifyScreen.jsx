// frontend/navigation/JournalistStack.jsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import JournalistDashboard from '../screens/App/journalist/JournalistDashboard';
import PoliticiansPerformanceDashboard from '../screens/App/journalist/PoliticiansPerformanceDashboard';
import PoliticianReportScreen from '../screens/App/journalist/PoliticianReportScreen'; // Detail view/Report Generation
import JournalistProfileScreen from '../screens/App/journalist/JournalistProfileScreen';
import JournalistChartScreen from '../screens/App/journalist/JournalistChartScreen';
import JournalistGraphScreen from '../screens/App/journalist/JournalistGraphScreen';

const Stack = createNativeStackNavigator();

const JournalistStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="JournalistHome" component={JournalistDashboard} />
            <Stack.Screen name="JournalistProfile" component={JournalistProfileScreen} />
            <Stack.Screen name="JournalistCharts" component={JournalistChartScreen} />
            <Stack.Screen name="JournalistGraphs" component={JournalistGraphScreen} />
            <Stack.Screen name="PoliticiansPerformanceDashboard" component={PoliticiansPerformanceDashboard} />
            <Stack.Screen name="PoliticianReport" component={PoliticianReportScreen} />
        </Stack.Navigator>
    );
};

export default JournalistStack;