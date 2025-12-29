import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { UserPreferences } from '../types';
import { onboardingService } from '../services/api';

export default function OnboardingScreen({ navigation }: any) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<Partial<UserPreferences>>({});

  useEffect(() => {
    checkExistingPreferences();
  }, []);

  const checkExistingPreferences = async () => {
    try {
      const existing = await onboardingService.getPreferences();
      if (existing) {
        navigation.replace('Main');
      }
    } catch (error) {
      console.error('Error checking preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!isComplete()) {
      Alert.alert('Incomplete', 'Please answer all questions');
      return;
    }

    setLoading(true);
    try {
      await onboardingService.savePreferences(preferences as UserPreferences);
      navigation.replace('Main');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to save preferences');
      setLoading(false);
    }
  };

  const isComplete = () => {
    return (
      preferences.tripLength &&
      preferences.driverStatus &&
      preferences.hasCar !== undefined &&
      preferences.foodPreference &&
      preferences.mealType &&
      preferences.eatLocation &&
      preferences.scenicPreference &&
      preferences.natureLover !== undefined &&
      preferences.sightseeing !== undefined
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const questions = [
    {
      title: 'What type of trips do you prefer?',
      options: [
        { label: 'Day trips (there and back in a day)', value: 'day' },
        { label: 'Weekend getaways', value: 'weekend' },
        { label: 'Short trips (under 50 miles)', value: 'short' },
        { label: 'Long adventures (80+ miles)', value: 'long' },
      ],
      key: 'tripLength',
    },
    {
      title: 'Are you usually the driver or passenger?',
      options: [
        { label: 'I love driving', value: 'driver' },
        { label: 'I prefer being a passenger', value: 'passenger' },
        { label: 'I do both', value: 'both' },
      ],
      key: 'driverStatus',
    },
    {
      title: 'Do you have a car?',
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
      key: 'hasCar',
    },
  ];

  if (preferences.hasCar) {
    questions.push({
      title: 'What type of car do you have?',
      options: [
        { label: 'Electric Vehicle (EV)', value: 'ev' },
        { label: 'Gas', value: 'gas' },
        { label: 'Hybrid', value: 'hybrid' },
      ],
      key: 'carType',
    });
  }

  questions.push(
    {
      title: 'How do you feel about food pit-stops?',
      options: [
        { label: 'Always stop for food', value: 'pitstop_always' },
        { label: 'Sometimes', value: 'pitstop_sometimes' },
        { label: 'Never, I eat in the car', value: 'pitstop_never' },
      ],
      key: 'foodPreference',
    },
    {
      title: 'What kind of meals do you prefer?',
      options: [
        { label: 'Quick sandwich or snack', value: 'sandwich' },
        { label: 'Sit-down meal', value: 'meal' },
        { label: 'Flexible', value: 'flexible' },
      ],
      key: 'mealType',
    },
    {
      title: 'Where do you prefer to eat?',
      options: [
        { label: 'Stop at restaurants', value: 'stop' },
        { label: 'Eat in the car', value: 'car' },
        { label: 'Either is fine', value: 'flexible' },
      ],
      key: 'eatLocation',
    },
    {
      title: 'How important are scenic routes?',
      subtitle: '1 = Fastest route, 5 = Most scenic',
      options: [
        { label: '1 - Get there fast', value: 1 },
        { label: '2', value: 2 },
        { label: '3 - Balanced', value: 3 },
        { label: '4', value: 4 },
        { label: '5 - Maximum scenery', value: 5 },
      ],
      key: 'scenicPreference',
    },
    {
      title: 'Do you enjoy experiencing nature?',
      options: [
        { label: 'Yes, I love it!', value: true },
        { label: 'Not really', value: false },
      ],
      key: 'natureLover',
    },
    {
      title: 'Interested in sightseeing and attractions?',
      options: [
        { label: 'Yes, definitely', value: true },
        { label: 'No, just the drive', value: false },
      ],
      key: 'sightseeing',
    }
  );

  const currentQuestion = questions[step];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.progress}>
          Question {step + 1} of {questions.length}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((step + 1) / questions.length) * 100}%` },
            ]}
          />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{currentQuestion.title}</Text>
        {currentQuestion.subtitle && (
          <Text style={styles.subtitle}>{currentQuestion.subtitle}</Text>
        )}

        <View style={styles.options}>
          {currentQuestion.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.option,
                preferences[currentQuestion.key as keyof UserPreferences] === option.value &&
                  styles.optionSelected,
              ]}
              onPress={() => {
                setPreferences({ ...preferences, [currentQuestion.key]: option.value });
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  preferences[currentQuestion.key as keyof UserPreferences] === option.value &&
                    styles.optionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.navigation}>
        {step > 0 && (
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setStep(step - 1)}
          >
            <Text style={styles.navButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        {step < questions.length - 1 ? (
          <TouchableOpacity
            style={[styles.navButton, styles.navButtonPrimary]}
            onPress={() => setStep(step + 1)}
            disabled={!preferences[currentQuestion.key as keyof UserPreferences]}
          >
            <Text style={styles.navButtonTextPrimary}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navButton, styles.navButtonPrimary]}
            onPress={handleComplete}
            disabled={!isComplete()}
          >
            <Text style={styles.navButtonTextPrimary}>Complete</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  progress: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 2,
  },
  content: {
    padding: 20,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  options: {
    gap: 12,
  },
  option: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  optionSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  optionText: {
    fontSize: 16,
    color: '#1f2937',
  },
  optionTextSelected: {
    color: '#2563eb',
    fontWeight: '600',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    gap: 12,
  },
  navButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  navButtonPrimary: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  navButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  navButtonTextPrimary: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
