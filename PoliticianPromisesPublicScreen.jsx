// frontend/components/CitizenHeader.jsx
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Text, Platform } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL, API_BASE_ROOT } from '../config/env';

const API_CITIZEN = `${API_BASE_URL}/citizen`;

const CitizenHeader = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [photoUri, setPhotoUri] = useState(null);

  const loadProfilePhoto = useCallback(async () => {
    try {
      if (!user || user.role !== 'citizen') return;
      const res = await axios.get(`${API_CITIZEN}/profile`);
      const url = res.data?.profilePhotoUrl ? `${API_BASE_ROOT}${res.data.profilePhotoUrl}` : null;
      setPhotoUri(url);
    } catch (e) {
      // silently ignore in header
      setPhotoUri(null);
    }
  }, [user]);

  useEffect(() => {
    loadProfilePhoto();
  }, [loadProfilePhoto]);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation?.navigate('CitizenHome')} activeOpacity={0.8}>
        <Image source={require('../assets/logos.png')} style={styles.logo} resizeMode="contain" />
      </TouchableOpacity>

      <View style={styles.centerWrap}>
        <Text style={styles.brandCenter} numberOfLines={1} ellipsizeMode="tail">Promise TrackerSL</Text>
      </View>

      <TouchableOpacity onPress={() => navigation?.navigate('CitizenProfile')} activeOpacity={0.8}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 120,
    paddingHorizontal: 16,
    paddingTop: 28,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  centerWrap: { flex: 1, paddingHorizontal: 12 },
  brandCenter: {
    textAlign: 'center',
    color: '#4C1D95',
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
    fontSize: 22,
  },
  logo: {
    width: 40,
    height: 40,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E5E7EB',
  },
  avatarPlaceholder: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
});

export default CitizenHeader;
