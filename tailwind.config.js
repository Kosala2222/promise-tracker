import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { AuthContext } from '../../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import CitizenBottomBar from '../../../components/CitizenBottomBar';
import axios from 'axios';
import { API_BASE_URL, API_BASE_ROOT } from '../../../config/env';

const API_CITIZEN_BASE = `${API_BASE_URL}/citizen`;
const API_PROMISES_BASE = `${API_BASE_URL}/promises`;
const PROFILE_API = `${API_BASE_URL}/citizen/profile`;

const CitizenDashboard = () => {
    const { logout, user, token } = useContext(AuthContext);
    const navigation = useNavigation();
    const [politicians, setPoliticians] = useState([]);
    const [promiseImages, setPromiseImages] = useState([]);
    const [citizenPhotoUri, setCitizenPhotoUri] = useState(null);

    useEffect(() => {
        const fetchPoliticians = async () => {
            try {
                const res = await axios.get(`${API_CITIZEN_BASE}/politicians`);
                const list = Array.isArray(res.data) ? res.data : (res.data?.politicians || []);
                setPoliticians(list);
            } catch (e) {
                setPoliticians([]);
            }
        };
        fetchPoliticians();
    }, []);

    useEffect(() => {
        const fetchPromises = async () => {
            try {
                const res = await axios.get(`${API_PROMISES_BASE}/all`);
                const list = Array.isArray(res.data) ? res.data : [];
                const imgs = list
                    .map(p => p?.imageUrl ? (p.imageUrl.startsWith('http') ? p.imageUrl : `${API_BASE_ROOT}${p.imageUrl}`) : null)
                    .filter(Boolean)
                    .slice(0, 20);
                setPromiseImages(imgs);
            } catch (e) {
                setPromiseImages([]);
            }
        };
        fetchPromises();
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!token) { setCitizenPhotoUri(null); return; }
            try {
                const res = await axios.get(PROFILE_API, { headers: { Authorization: `Bearer ${token}` } });
                const data = res.data;
                if (data?.profilePhotoUrl) {
                    setCitizenPhotoUri(`${API_BASE_ROOT}${data.profilePhotoUrl}`);
                } else {
                    setCitizenPhotoUri(null);
                }
            } catch (e) {
                setCitizenPhotoUri(null);
            }
        };
        fetchProfile();
    }, [token]);
    
    return (
        <View style={{ flex: 1, backgroundColor: '#F5F3FF' }}>
        <ScrollView contentContainerStyle={[styles.container, { paddingBottom: 120 }]}>
            <View style={styles.headerRow}>
                <Text style={styles.header}>Citizen Home</Text>
                <TouchableOpacity
                    accessibilityLabel="Notifications"
                    onPress={() => navigation.navigate('CitizenNotifications')}
                    style={styles.notificationIcon}
                >
                    <Text style={styles.notificationIconText}>🔔</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.subheader}>Welcome back, {user?.username || 'Citizen'}!</Text>
            <Text style={styles.roleText}>Access your main actions below.</Text>

            <View style={styles.sectionCard}>
                <Text style={styles.carouselHeader}>Our registered politicians</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.carouselRow}
                    style={styles.carouselContainer}
                >
                    {politicians.slice(0, 20).map((p) => {
                        const uri = p?.profile?.profilePhotoUrl
                            ? `${API_BASE_ROOT}${p.profile.profilePhotoUrl}`
                            : null;
                        return (
                            <View key={p._id} style={styles.carouselItem}>
                                <View style={styles.imageWrapper}>
                                    {uri ? (
                                        <Image source={{ uri }} style={styles.politicianImage} />
                                    ) : (
                                        <View style={[styles.politicianImage, styles.imagePlaceholder]} />
                                    )}
                                </View>
                                <Text numberOfLines={1} style={styles.politicianName}>
                                    {p?.username || 'Unknown'}
                                </Text>
                            </View>
                        );
                    })}
                </ScrollView>
            </View>

            <View style={styles.buttonContainer}>

                {/* Browse Politicians (placed right below carousel) */}
                <TouchableOpacity 
                    onPress={() => navigation.navigate('BrowsePoliticians')}
                    style={[styles.navButton, styles.browseButton]}
                >
                    <Text style={styles.navButtonText}>Browse Politicians</Text>
                </TouchableOpacity>

                <View style={styles.sectionCardAlt}>
                    <Text style={styles.promisesHeader}>Check politician's promises</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.promisesRow}
                        style={styles.promisesContainer}
                    >
                        {promiseImages.map((uri, idx) => (
                            <View key={idx} style={styles.promiseItem}>
                                <View style={styles.promiseImageWrapper}>
                                    <Image source={{ uri }} style={styles.promiseImage} />
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Global Promise Feed (placed right below promises carousel) */}
                <TouchableOpacity 
                    onPress={() => navigation.navigate('PoliticianPromisesPublic')} 
                    style={[styles.navButton, styles.feedButton]}
                >
                    <Text style={styles.navButtonText}> Promises Feed</Text>
                </TouchableOpacity>

                {/* Decorative middle image */}
                <View style={styles.middleImageContainer}>
                    <Image
                        source={require('../../../assets/middle_image.png')}
                        style={styles.middleImage}
                        resizeMode="cover"
                    />
                </View>

                {/* Contributions / Achievements (placed right below image) */}
                <TouchableOpacity 
                    onPress={() => navigation.navigate('CitizenAchievements')} 
                    style={[styles.navButton, styles.achievementsButton]}
                >
                    <Text style={styles.navButtonText}>Contributions</Text>
                </TouchableOpacity>

                {/* Citizen profile image */}
                {citizenPhotoUri && (
                    <View style={styles.citizenImageContainer}>
                        <Image source={{ uri: citizenPhotoUri }} style={styles.citizenImage} />
                    </View>
                )}

                {/* Task 1: Profile/Interests */}
                <TouchableOpacity 
                    onPress={() => navigation.navigate('CitizenProfile')}
                    style={[styles.navButton, styles.profileButton]}
                >
                    <Text style={styles.navButtonText}>My Profile </Text>
                </TouchableOpacity>

                {/* Logout */}
                <TouchableOpacity 
                    onPress={logout}
                    style={[styles.navButton, styles.logoutButton]}
                >
                    <Text style={styles.navButtonText}>Log Out</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
        <CitizenBottomBar />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20, alignItems: 'center' },
    headerRow: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    header: { fontSize: 34, fontWeight: '800', color: '#4C1D95', marginBottom: 6, letterSpacing: 0.3 },
    notificationIcon: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: '#EDE9FE' },
    notificationIconText: { fontSize: 20 },
    subheader: { fontSize: 18, color: '#8B5CF6', marginBottom: 10 },
    roleText: { fontSize: 14, color: '#475569', marginBottom: 16, textAlign: 'center' },
    carouselHeader: { width: '100%', fontSize: 16, fontWeight: '800', color: '#7C3AED', marginBottom: 10, textTransform: 'capitalize' },
    carouselContainer: { width: '100%', marginBottom: 24 },
    carouselRow: { paddingRight: 12 },
    carouselItem: { width: 110, marginRight: 14, alignItems: 'center' },
    imageWrapper: { width: 110, height: 110, borderRadius: 18, overflow: 'hidden', backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#C4B5FD' },
    politicianImage: { width: '100%', height: '100%', borderRadius: 18 },
    imagePlaceholder: { backgroundColor: '#E5E7EB' },
    politicianName: { marginTop: 8, fontSize: 13, color: '#4C1D95', fontWeight: '800', textAlign: 'center', width: '100%' },
    promisesHeader: { width: '100%', fontSize: 16, fontWeight: '800', color: '#7C3AED', marginTop: 4, marginBottom: 10 },
    promisesContainer: { width: '100%', marginBottom: 20 },
    promisesRow: { paddingRight: 12 },
    promiseItem: { width: 110, marginRight: 14 },
    promiseImageWrapper: { width: 110, height: 110, borderRadius: 18, overflow: 'hidden', backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#E9D5FF' },
    promiseImage: { width: '100%', height: '100%', borderRadius: 18 },
    middleImageContainer: { width: '100%', marginBottom: 24, marginTop: 8, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#E9D5FF' },
    middleImage: { width: '100%', height: 160 },
    citizenImageContainer: { width: '100%', alignItems: 'center', marginBottom: 20 },
    citizenImage: { width: 110, height: 110, borderRadius: 18, backgroundColor: '#E5E7EB', borderWidth: 2, borderColor: '#DDD6FE' },
    buttonContainer: { width: '100%', marginTop: 8 },
    navButton: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 14,
        marginBottom: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
    },
    navButtonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 16,
    },
    profileButton: { backgroundColor: '#6D28D9' }, 
    browseButton: { backgroundColor: '#4C1D95' }, 
    feedButton: { backgroundColor: '#7C3AED' },   
    achievementsButton: { backgroundColor: '#8B5CF6' },
    logoutButton: { backgroundColor: '#EF4444', marginTop: 30 }, 
    sectionCard: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 16 },
    sectionCardAlt: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#E9D5FF', marginBottom: 16 },
});

export default CitizenDashboard;
