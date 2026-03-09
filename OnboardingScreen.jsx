// frontend/screens/App/citizen/CitizenAchievementsScreen.jsx
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';
import CitizenBottomBar from '../../../components/CitizenBottomBar';
import { API_BASE_URL } from '../../../config/env';

const ACHIEVEMENTS_API = `${API_BASE_URL}/citizen/achievements`;

const Stat = ({ label, value, color }) => (
  <View style={[styles.statBox, { borderColor: color }]}> 
    <Text style={[styles.statLabel, { color }]}>{label}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
  </View>
);

const CitizenAchievementsScreen = () => {
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ approved: 0, rejected: 0, pending: 0, totalSubmissions: 0, totalPoints: 0, items: [] });

  const fetchAchievements = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(ACHIEVEMENTS_API, { headers: { Authorization: `Bearer ${token}` } });
      setData(res.data || {});
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load achievements.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAchievements(); }, [fetchAchievements]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#1D4ED8" />
        <Text style={styles.loadingText}>Loading Achievements...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#E0E7FF' }}>
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: 100 }]}>
      <Text style={styles.header}>My Contributions</Text>
      <Text style={styles.subheader}>Points are based on NGO-reviewed evidence.</Text>

      <View style={styles.pointsBox}>
        <Text style={styles.pointsLabel}>Total Points</Text>
        <Text style={styles.pointsValue}>{data.totalPoints || 0}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statApproved]}> 
          <Text style={styles.statTitle}>Approved</Text>
          <Text style={styles.statNumber}>{data.approved || 0}</Text>
        </View>
        <View style={[styles.statCard, styles.statRejected]}> 
          <Text style={styles.statTitle}>Rejected</Text>
          <Text style={styles.statNumber}>{data.rejected || 0}</Text>
        </View>
        <View style={[styles.statCard, styles.statPending]}> 
          <Text style={styles.statTitle}>Pending</Text>
          <Text style={styles.statNumber}>{data.pending || 0}</Text>
        </View>
      </View>

      <View style={styles.detailsBox}>
        <Text style={styles.detailsHeader}>Recent Submissions</Text>
        {Array.isArray(data.items) && data.items.length > 0 ? (
          data.items.slice(0, 10).map((item) => (
            <View key={item._id} style={styles.itemRow}>
              <Text style={styles.itemText} numberOfLines={2}>{item.comment}</Text>
              <View style={[
                styles.statusChip,
                item.status === 'approved' ? styles.statusApproved : item.status === 'rejected' ? styles.statusRejected : styles.statusPending
              ]}>
                <Text style={styles.statusChipText}>{item.status}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No submissions yet</Text>
            <Text style={styles.emptyText}>Your reviewed evidence will appear here.</Text>
          </View>
        )}
      </View>
      <View style={{ height: 80 }} />
    </ScrollView>
    <CitizenBottomBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E0E7FF' },
  content: { padding: 20, paddingTop: 30, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#374151' },
  errorText: { color: '#EF4444' },
  header: { fontSize: 32, fontWeight: '900', color: '#4C1D95', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1.2 },
  subheader: { marginTop: 6, color: '#4338CA', marginBottom: 16, textAlign: 'center', fontWeight: '700' },
  pointsBox: { backgroundColor: 'white', borderRadius: 18, paddingVertical: 22, paddingHorizontal: 16, alignItems: 'center', marginBottom: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 6, borderWidth: 1, borderColor: '#E5E7EB' },
  pointsLabel: { color: '#4F46E5', fontWeight: '800', letterSpacing: 0.6 },
  pointsValue: { fontSize: 40, fontWeight: '900', color: '#312E81' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, gap: 10 },
  statCard: { flex: 1, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 },
  statTitle: { fontWeight: '800', marginBottom: 4, color: '#0F172A' },
  statNumber: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
  statApproved: { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0' },
  statRejected: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
  statPending: { backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A' },
  detailsBox: { backgroundColor: 'white', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, elevation: 3, borderWidth: 1, borderColor: '#E5E7EB' },
  detailsHeader: { fontWeight: '900', color: '#1F2937', marginBottom: 10, letterSpacing: 0.4 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  itemText: { flex: 1, marginRight: 10, color: '#374151' },
  statusChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9999, borderWidth: 1 },
  statusChipText: { textTransform: 'capitalize', fontWeight: '800', color: '#111827' },
  statusApproved: { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
  statusRejected: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  statusPending: { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' },
  emptyCard: { backgroundColor: 'white', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', marginTop: 4 },
  emptyTitle: { fontWeight: '900', color: '#1F2937', marginBottom: 4 },
  emptyText: { color: '#6B7280' },
});

export default CitizenAchievementsScreen;
