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
import { TripRecommendation } from '../types';
import { tripService } from '../services/api';

export default function HomeScreen({ navigation }: any) {
  const [recommendations, setRecommendations] = useState<TripRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const data = await tripService.getRecommendations();
      setRecommendations(data);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTrip = async (rec: TripRecommendation) => {
    setGenerating(rec.destination);
    try {
      const result = await tripService.generateTrip(rec.destination, rec.lat, rec.lng);
      navigation.navigate('TripDetail', { tripId: result.trip.id });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to generate trip');
    } finally {
      setGenerating(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover Your Next Adventure</Text>
        <Text style={styles.subtitle}>Personalized road trip recommendations just for you</Text>
      </View>

      <View style={styles.recommendations}>
        {recommendations.map((rec, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => handleGenerateTrip(rec)}
            disabled={generating !== null}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{rec.destination}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{rec.matchScore}% match</Text>
              </View>
            </View>

            <Text style={styles.cardDescription}>{rec.description}</Text>

            <View style={styles.cardStats}>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Distance</Text>
                <Text style={styles.statValue}>{rec.distance} mi</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statLabel}>Duration</Text>
                <Text style={styles.statValue}>{Math.round(rec.estimatedDuration / 60)}h</Text>
              </View>
            </View>

            {rec.highlights.length > 0 && (
              <View style={styles.highlights}>
                {rec.highlights.map((highlight, i) => (
                  <View key={i} style={styles.highlight}>
                    <Text style={styles.highlightText}>{highlight}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.cardFooter}>
              {generating === rec.destination ? (
                <ActivityIndicator color="#2563eb" />
              ) : (
                <Text style={styles.cardButton}>Plan This Trip →</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
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
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  recommendations: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  badge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  cardStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
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
  highlights: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  highlight: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  highlightText: {
    fontSize: 12,
    color: '#4b5563',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    alignItems: 'center',
  },
  cardButton: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
});
