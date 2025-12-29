import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Trip, Stop } from '../types';
import { tripService } from '../services/api';

export default function TripDetailScreen({ route, navigation }: any) {
  const { tripId } = route.params;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    loadTrip();
  }, []);

  const loadTrip = async () => {
    try {
      const data = await tripService.getTrip(tripId);
      setTrip(data);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to load trip');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    try {
      await tripService.inviteToTrip(tripId, inviteEmail);
      Alert.alert('Success', 'Invitation sent!');
      setShowInvite(false);
      setInviteEmail('');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to send invitation');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!trip) {
    return null;
  }

  const itinerary = trip.itineraryData;
  const stops = itinerary.stops;

  const getStopIcon = (type: Stop['type']) => {
    switch (type) {
      case 'fuel':
        return '⛽';
      case 'charging':
        return '🔌';
      case 'food':
        return '🍽️';
      case 'scenic':
        return '🌄';
      case 'attraction':
        return '🎯';
      default:
        return '📍';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: (itinerary.route.startLat + itinerary.route.endLat) / 2,
          longitude: (itinerary.route.startLng + itinerary.route.endLng) / 2,
          latitudeDelta: Math.abs(itinerary.route.startLat - itinerary.route.endLat) * 1.5,
          longitudeDelta: Math.abs(itinerary.route.startLng - itinerary.route.endLng) * 1.5,
        }}
      >
        <Marker
          coordinate={{
            latitude: itinerary.route.startLat,
            longitude: itinerary.route.startLng,
          }}
          title="Start"
          pinColor="green"
        />

        <Marker
          coordinate={{
            latitude: itinerary.route.endLat,
            longitude: itinerary.route.endLng,
          }}
          title={trip.destination}
          pinColor="red"
        />

        {stops.map((stop, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: stop.lat,
              longitude: stop.lng,
            }}
            title={stop.name}
            description={stop.notes}
          />
        ))}

        <Polyline
          coordinates={[
            { latitude: itinerary.route.startLat, longitude: itinerary.route.startLng },
            ...stops.map((s) => ({ latitude: s.lat, longitude: s.lng })),
            { latitude: itinerary.route.endLat, longitude: itinerary.route.endLng },
          ]}
          strokeColor="#2563eb"
          strokeWidth={3}
        />
      </MapView>

      <View style={styles.content}>
        <Text style={styles.title}>{trip.destination}</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{trip.distance.toFixed(0)} mi</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{Math.round(trip.duration / 60)}h</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>${trip.estimatedCost.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Est. Cost</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cost Breakdown</Text>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Fuel/Charging</Text>
            <Text style={styles.costValue}>${itinerary.estimatedCost.fuel.toFixed(2)}</Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Food</Text>
            <Text style={styles.costValue}>${itinerary.estimatedCost.food.toFixed(2)}</Text>
          </View>
          <View style={[styles.costRow, styles.costTotal]}>
            <Text style={styles.costTotalLabel}>Total</Text>
            <Text style={styles.costTotalValue}>${itinerary.estimatedCost.total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Itinerary ({stops.length} stops)</Text>
          {stops.map((stop, index) => (
            <View key={index} style={styles.stop}>
              <View style={styles.stopIcon}>
                <Text style={styles.stopIconText}>{getStopIcon(stop.type)}</Text>
              </View>
              <View style={styles.stopContent}>
                <Text style={styles.stopName}>{stop.name}</Text>
                <Text style={styles.stopAddress}>{stop.address}</Text>
                {stop.notes && <Text style={styles.stopNotes}>{stop.notes}</Text>}
                <Text style={styles.stopDuration}>~{stop.duration} minutes</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowInvite(!showInvite)}
          >
            <Text style={styles.buttonText}>Invite Friends</Text>
          </TouchableOpacity>
        </View>

        {showInvite && (
          <View style={styles.inviteContainer}>
            <TextInput
              style={styles.input}
              placeholder="Friend's email"
              value={inviteEmail}
              onChangeText={setInviteEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TouchableOpacity style={styles.button} onPress={handleInvite}>
              <Text style={styles.buttonText}>Send Invitation</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

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
  map: {
    height: 300,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  costLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  costValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  costTotal: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 8,
    paddingTop: 12,
  },
  costTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  costTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  stop: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  stopIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stopIconText: {
    fontSize: 20,
  },
  stopContent: {
    flex: 1,
  },
  stopName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  stopAddress: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  stopNotes: {
    fontSize: 13,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  stopDuration: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '500',
  },
  actions: {
    marginTop: 8,
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  inviteContainer: {
    marginTop: 16,
    gap: 12,
  },
  input: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
  },
});
