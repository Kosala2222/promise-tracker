import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    StyleSheet,
    ActivityIndicator,
    TextInput,
    Alert,
} from 'react-native';
import axios from 'axios';
import CitizenBottomBar from '../../../components/CitizenBottomBar';
import { API_BASE_URL } from '../../../config/env';

// NOTE: Fetch all politician profiles from the new citizen API endpoint
const API_POLITICIANS_URL = `${API_BASE_URL}/citizen/politicians`; 

/**
 * Screen for citizens to browse and search politician profiles to follow.
 */
const BrowseScreen = () => {
    const [politicians, setPoliticians] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);

    const fetchPoliticians = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(API_POLITICIANS_URL); 
            setPoliticians(response.data.politicians || []); 
        } catch (err) {
            console.error("Fetch Politicians Error:", err.response?.data || err.message);
            setError('Failed to load politicians. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPoliticians();
    }, [fetchPoliticians]);

    // Placeholder for actual 'follow' logic (would require AuthContext and a user profile update API)
    const handleFollow = (politicianName) => {
        Alert.alert('Follow Feature', `You are now following ${politicianName}! (Requires updating user profile via API)`);
    };

    const filteredPoliticians = politicians.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.party.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <View style={styles.mainContainer}>
            <View style={styles.searchBar}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name or party..."
                    placeholderTextColor="#9CA3AF"
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                />
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#059669" />
                    <Text style={styles.loadingText}>Loading politicians...</Text>
                </View>
            ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : (
                <ScrollView contentContainerStyle={[styles.scrollContainer, { paddingBottom: 100 }]}>
                    {filteredPoliticians.length === 0 ? (
                        <Text style={styles.emptyText}>No politicians found matching "{searchTerm}"</Text>
                    ) : (
                        filteredPoliticians.map((p, index) => (
                            <View key={index} style={styles.politicianCard}>
                                <View style={styles.infoContainer}>
                                    <Text style={styles.nameText}>{p.name}</Text>
                                    <Text style={styles.partyText}>{p.party} - {p.location}</Text>
                                    <Text style={styles.bioText} numberOfLines={2}>{p.bio || 'No bio provided.'}</Text>
                                </View>
                                <TouchableOpacity 
                                    style={styles.followButton} 
                                    onPress={() => handleFollow(p.name)}
                                >
                                    <Text style={styles.followButtonText}>+ Follow</Text>
                                </TouchableOpacity>
                            </View>
                        ))
                    )}
                </ScrollView>
            )}
            <CitizenBottomBar />
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#F3F4F6' },
    searchBar: { padding: 15, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    searchInput: { height: 45, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 25, paddingHorizontal: 15, fontSize: 16, backgroundColor: '#F9FAFB' },
    scrollContainer: { padding: 20, paddingBottom: 50 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, fontSize: 16, color: '#4B5563' },
    errorText: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#EF4444' },
    emptyText: { textAlign: 'center', marginTop: 30, fontSize: 16, color: '#6B7280' },

    politicianCard: { 
        flexDirection: 'row', 
        backgroundColor: 'white', 
        padding: 15, 
        borderRadius: 12, 
        marginBottom: 10, 
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    infoContainer: { flex: 1, marginRight: 10 },
    nameText: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
    partyText: { fontSize: 14, color: '#4B5563', marginBottom: 5 },
    bioText: { fontSize: 13, color: '#6B7280' },
    
    followButton: {
        backgroundColor: '#059669',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginLeft: 10,
    },
    followButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default BrowseScreen;
