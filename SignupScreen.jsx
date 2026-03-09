// frontend/screens/App/citizen/BrowsePoliticiansScreen.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, TouchableOpacity, StyleSheet, TextInput, Image, Dimensions } from 'react-native';
import { AuthContext } from '../../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import CitizenBottomBar from '../../../components/CitizenBottomBar';
import { API_BASE_URL, API_BASE_ROOT } from '../../../config/env';

const API_CITIZEN = `${API_BASE_URL}/citizen`; 
const { width } = Dimensions.get('window');

const PoliticianCard = ({ politician, isFollowing, onToggleFollow, onSelect }) => {
    const photoUrl = politician?.profile?.profilePhotoUrl ? `${API_BASE_ROOT}${politician.profile.profilePhotoUrl}` : null;
    return (
        <View style={styles.card}>
            {photoUrl ? (
                <Image source={{ uri: photoUrl }} style={styles.avatar} />
            ) : (
                <View style={[styles.avatar, { alignItems: 'center', justifyContent: 'center' }]}>
                    <Text style={{ color: '#6B7280', fontSize: 10 }}>No Photo</Text>
                </View>
            )}
            <TouchableOpacity onPress={() => onSelect(politician)} style={styles.cardContent}>
                <View style={{ flex: 1 }}>
                    <View style={styles.nameRow}>
                        <Text style={styles.politicianName}>{politician.username}</Text>
                        {politician.profile?.isVerified && (
                            <View style={styles.verifiedBadge}><Text style={styles.verifiedText}>VERIFIED</Text></View>
                        )}
                    </View>
                    <View style={styles.chipRow}>
                        {!!politician.profile?.party && (
                            <View style={[styles.chip, styles.partyChip]}>
                                <Text style={styles.chipText}>{politician.profile.party}</Text>
                            </View>
                        )}
                        {!!politician.profile?.position && (
                            <View style={[styles.chip, styles.positionChip]}>
                                <Text style={styles.chipText}>{politician.profile.position}</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.politicianBio} numberOfLines={2}>{politician.profile?.bio || 'No public bio available.'}</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.followButton, isFollowing ? styles.unfollowButton : styles.followButtonDefault]}
                onPress={() => onToggleFollow(politician._id, isFollowing)}
            >
                <Text style={styles.followButtonText}>{isFollowing ? 'Unfollow' : '+ Follow'}</Text>
            </TouchableOpacity>
        </View>
    );
};

const BrowsePoliticiansScreen = () => {
    const navigation = useNavigation();
    const { user } = useContext(AuthContext); 
    const [politicians, setPoliticians] = useState([]);
    const [citizenProfile, setCitizenProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchPoliticiansAndProfile = useCallback(async () => {
        setLoading(true);
        try {
            // 1. Fetch all politicians
            const pResponse = await axios.get(`${API_CITIZEN}/politicians`); 
            setPoliticians(pResponse.data);

            // 2. Fetch citizen's follow list (only if user is logged in)
            if (user) {
                const cResponse = await axios.get(`${API_CITIZEN}/profile`); 
                setCitizenProfile(cResponse.data);
            }

        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to fetch data.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchPoliticiansAndProfile();
        // Refresh data whenever the screen comes into focus
        const unsubscribe = navigation.addListener('focus', fetchPoliticiansAndProfile);
        return unsubscribe;
    }, [navigation, fetchPoliticiansAndProfile]);

    const handleToggleFollow = async (politicianId, currentlyFollowing) => {
        if (!user || user.role !== 'citizen') {
            Alert.alert('Login Required', 'You must log in as a citizen to follow politicians.');
            return;
        }

        try {
            await axios.post(`${API_CITIZEN}/follow/${politicianId}`);
            
            // Update the local citizen profile state
            setCitizenProfile(prev => {
                const followed = new Set(prev.followedPoliticians.map(id => id.toString()));
                if (currentlyFollowing) {
                    followed.delete(politicianId);
                } else {
                    followed.add(politicianId);
                }
                return { ...prev, followedPoliticians: Array.from(followed) };
            });

        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to update follow status.');
        }
    };
    
    // Filtering logic
    const filteredPoliticians = politicians.filter(p => {
        const lowerSearch = searchTerm.toLowerCase();
        return (
            p.username.toLowerCase().includes(lowerSearch) ||
            p.profile?.party.toLowerCase().includes(lowerSearch) ||
            p.profile?.position.toLowerCase().includes(lowerSearch)
        );
    });

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#1D4ED8" />
                <Text style={styles.loadingText}>Loading Politicians...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Browse Politicians</Text>
            <Text style={styles.subHeader}>Discover leaders and track their promises</Text>
            <TextInput
                style={styles.searchInput}
                placeholder="Search by name, party, or position..."
                placeholderTextColor="#9CA3AF"
                value={searchTerm}
                onChangeText={setSearchTerm}
            />

            <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 24 }}>
                {filteredPoliticians.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyTitle}>No matches</Text>
                        <Text style={styles.emptyText}>Try a different keyword or clear your search.</Text>
                    </View>
                ) : (
                    filteredPoliticians.map(p => (
                        <PoliticianCard
                            key={p._id}
                            politician={p}
                            isFollowing={citizenProfile?.followedPoliticians.includes(p._id.toString())}
                            onToggleFollow={handleToggleFollow}
                            // Navigate to the public promise view
                            onSelect={() => navigation.navigate('PoliticianPromisesPublic', { politicianId: p._id, politicianName: p.username })} 
                        />
                    ))
                )}
                <View style={styles.spacer}></View>
            </ScrollView>
            <CitizenBottomBar />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#E0E7FF', paddingHorizontal: 20, paddingTop: 36 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, color: '#374151' },
    header: { fontSize: 32, fontWeight: '900', color: '#4C1D95', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1.2, textAlign: 'center' },
    subHeader: { color: '#4338CA', textAlign: 'center', marginBottom: 18, fontWeight: '700' },
    searchInput: { height: 48, borderColor: '#C7D2FE', borderWidth: 2, borderRadius: 12, paddingHorizontal: 16, backgroundColor: 'white', marginBottom: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
    scrollContainer: { flex: 1 },
    card: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 16, padding: 14, marginBottom: 14, alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5,
        borderWidth: 1, borderColor: '#E5E7EB' },
    cardContent: { flex: 1, marginRight: 10, marginLeft: 12 },
    avatar: { width: Math.min(width * 0.2, 70), height: Math.min(width * 0.2, 70), borderRadius: 9999, backgroundColor: '#E5E7EB', borderWidth: 3, borderColor: '#C7D2FE' },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    politicianName: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
    verifiedBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 9999 },
    verifiedText: { color: '#065F46', fontWeight: '800', fontSize: 10 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
    chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9999, borderWidth: 1 },
    partyChip: { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' },
    positionChip: { backgroundColor: '#ECFEFF', borderColor: '#A5F3FC' },
    chipText: { color: '#1F2937', fontWeight: '700', fontSize: 12 },
    politicianBio: { fontSize: 12, color: '#4B5563', marginTop: 8 },
    followButton: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
    followButtonDefault: { backgroundColor: '#22C55E' },
    unfollowButton: { backgroundColor: '#F97316' },
    followButtonText: { color: 'white', fontWeight: '800', fontSize: 14 },
    emptyCard: { backgroundColor: 'white', borderRadius: 16, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
    emptyTitle: { fontWeight: '800', color: '#1F2937', marginBottom: 4 },
    emptyText: { textAlign: 'center', color: '#6B7280' },
    spacer: { height: 80 }
});

export default BrowsePoliticiansScreen;
