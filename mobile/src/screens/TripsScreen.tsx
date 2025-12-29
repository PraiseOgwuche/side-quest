import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Trip } from '../types';
import { tripService } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

export default function TripsScreen({ navigation }: any) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadTrips();
    }, [])
  );

  const loadTrips = async () => {
    try {
      const data = await tripService.getUserTrips();
      setTrips(data);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (trips.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No trips yet</Text>
        <Text style={styles.emptyText}>
          Start exploring recommendations to create your first trip!
        </Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.emptyButtonText}>Discover Trips</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.trips}>
        {trips.map((trip) => (
          <TouchableOpacity
            key={trip.id}
            style={styles.card}
            onPress={() => navigation.navigate('TripDetail', { tripId: trip.id })}
          >
            <Text style={styles.cardTitle}>{trip.destination}</Text>

            <View style={styles.cardStats}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Distance</Text>
                <Text style={styles.statValue}>{trip.distance.toFixed(0)} mi</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Duration</Text>
                <Text style={styles.statValue}>{Math.round(trip.duration / 60)}h</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Est. Cost</Text>
                <Text style={styles.statValue}>${trip.estimatedCost.toFixed(0)}</Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <View style={[styles.statusBadge, getStatusStyle(trip.status)]}>
                <Text style={styles.statusText}>{trip.status}</Text>
              </View>
              <Text style={styles.viewDetails}>View Details →</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'planned':
      return { backgroundColor: '#dbeafe' };
    case 'ongoing':
      return { backgroundColor: '#fef3c7' };
    case 'completed':
      return { backgroundColor: '#d1fae5' };
    default:
      return { backgroundColor: '#f3f4f6' };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  trips: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  cardStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  viewDetails: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
});
