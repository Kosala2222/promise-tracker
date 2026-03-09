import React, { useContext } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AuthContext } from '../../context/AuthContext';

const AdminDashboard = () => {
   
    const { logout, user } = useContext(AuthContext);

    return (
        <View className="flex-1 items-center justify-center bg-red-100">
            <Text className="text-2xl font-bold text-red-700">Admin Dashboard</Text>
            <Text className="mt-2 text-red-600">System maintenance and user management.</Text>

            <TouchableOpacity 
                            onPress={logout}
                            className="w-full max-w-xs py-3 rounded-lg bg-purple-700 shadow-lg"
                        >
                            <Text className="text-white text-center font-bold text-lg">Log Out</Text>
                        </TouchableOpacity>
                        
        </View>
    );
};

export default AdminDashboard;
