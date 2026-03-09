// frontend/components/NgoHeader.jsx
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Text, Platform } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL, API_BASE_ROOT } from '../config/env';

const PROFILE_API = `${API_BASE_URL}/ngo/profile/me`;

const NgoHeader = ({ navigation }) => {
  const { user, token } = useContext(AuthContext);
  const [photoUri, setPhotoUri] = useState(null);

  const loadProfilePhoto = useCallback(async () => {
    try {
      if (!user || user.role !== 'ngo' || !token) return;
      const res = await axios.get(PROFILE_API, { headers: { Authorization: `Bearer ${token}` } });
      const url = res.data?.profilePhotoUrl ? `${API_BASE_ROOT}${res.data.profilePhotoUrl}` : null;
      setPhotoUri(url);
    } catch (e) {
      setPhotoUri(null);
    }
  }, [user, token]);

  useEffect(() => {
    loadProfilePhoto();
  }, [loadProfilePhoto]);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation?.navigate('NgoHome')} activeOpacity={0.8}>
        <Image source={require('../assets/logos.png')} style={styles.logo} resizeMode="contain" />
      </TouchableOpacity>

      <View style={styles.centerWrap}>
        <Text style={styles.brandCenter} numberOfLines={1} ellipsizeMode="tail">Promise TrackerSL</Text>
      </View>

      <TouchableOpacity onPress={() => navigation?.navigate('NgoProfile')} activeOpacity={0.8}>
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
  logo: { width: 40, height: 40 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E5E7EB' },
  avatarPlaceholder: { borderWidth: 1, borderColor: '#D1D5DB' },
});

export default NgoHeader;
