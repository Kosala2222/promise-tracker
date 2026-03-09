// client/components/CustomInput.jsx (Recommended Safe Structure)

import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // Assuming you use this

const CustomInput = ({ label, value, onChangeText, icon, children, containerStyle, inputStyle, labelStyle, borderColor, focusedBorderColor, defaultBorderColor, borderWidth = 2, onFocus, onBlur, ...rest }) => {
    const [focused, setFocused] = useState(false);
    const resolvedBorderColor = focused ? (focusedBorderColor || borderColor) : (defaultBorderColor || borderColor);
    return (
        <View className="mb-4">
            {label && (
                <Text className="text-sm font-medium text-gray-700 mb-1" style={labelStyle}>{label}</Text>
            )}
            
            <View
                className="relative flex-row items-center rounded-xl px-3 bg-white shadow-sm"
                style={[{ borderWidth, borderColor: resolvedBorderColor || '#E5E7EB' }, containerStyle]}
            >
                {icon && <View className="mr-3">{icon}</View>}
                
                <TextInput
                    className="flex-1 py-3 text-gray-800"
                    value={value}
                    onChangeText={onChangeText}
                    placeholderTextColor={rest.placeholderTextColor || '#9CA3AF'}
                    selectionColor={rest.selectionColor}
                    style={inputStyle}
                    onFocus={(e) => { setFocused(true); onFocus && onFocus(e); }}
                    onBlur={(e) => { setFocused(false); onBlur && onBlur(e); }}
                    {...rest}
                />
                
                {/* CRITICAL: No spaces or newlines outside of the curly braces for children */}
                {children} 
            </View>
        </View>
    );
};

export default CustomInput;