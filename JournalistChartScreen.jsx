// frontend/components/NgoBottomBar.jsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const NgoBottomBar = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.item}
        onPress={() => navigation.navigate('NgoHome')}
      >
        <Ionicons name="home" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.item}
        onPress={() => navigation.navigate('NgoProfile')}
      >
        <Ionicons name="person-circle" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.item}
        onPress={() => navigation.navigate('NgoPromiseList')}
      >
        <Ionicons name="list" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 92,
    backgroundColor: '#4C1D95',
    borderTopWidth: 1,
    borderTopColor: '#3B0764',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingBottom: 28,
  },
  item: { padding: 12, borderRadius: 12 },
});

export default NgoBottomBar;
