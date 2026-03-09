// client/components/CustomButton.jsx (REVISED)

import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

const CustomButton = ({ 
    title, 
    onPress, 
    loading = false, 
    // Define the default primary color and allow overrides
    className = "bg-indigo-600", 
    disabled = false,
    // Add a prop for text color in case the background changes
    textClassName = "text-white"
}) => {
    
    // Determine classes based on loading/disabled state
    let finalClass = className;
    let finalTextClass = textClassName;

    if (loading || disabled) {
        // Mute the button color and remove dynamic background classes when disabled/loading
        finalClass = finalClass.replace(/bg-[\w-]+/g, 'bg-gray-400');
        finalTextClass = "text-gray-100";
    }

    return (
        <TouchableOpacity
            // Increased shadow and added transition for better click feel
            className={`mt-4 h-12 flex items-center justify-center rounded-xl shadow-lg transition duration-150 ${finalClass}`}
            onPress={onPress}
            disabled={loading || disabled}
        >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text className={`text-lg font-bold ${finalTextClass}`}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

export default CustomButton;