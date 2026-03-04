import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card, Input, Button } from '../../components/atoms';
import { useTheme, useGoals } from '../../hooks';
import { validateAmount, getCurrentDate } from '../../utils';

interface GoalFormScreenProps {
  navigation: any;
}

const GoalFormScreen: React.FC<GoalFormScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { addGoal } = useGoals();

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [category, setCategory] = useState('other');
  const [deadline, setDeadline] = useState('');

  const categories = [
    { id: 'travel', name: 'Viajes', icon: 'airplane-outline' as keyof typeof Ionicons.glyphMap },
    { id: 'emergency', name: 'Emergencia', icon: 'medkit-outline' as keyof typeof Ionicons.glyphMap },
    { id: 'technology', name: 'Tecnología', icon: 'laptop-outline' as keyof typeof Ionicons.glyphMap },
    { id: 'education', name: 'Educación', icon: 'school-outline' as keyof typeof Ionicons.glyphMap },
    { id: 'car', name: 'Auto', icon: 'car-outline' as keyof typeof Ionicons.glyphMap },
    { id: 'home', name: 'Hogar', icon: 'home-outline' as keyof typeof Ionicons.glyphMap },
    { id: 'other', name: 'Otro', icon: 'flag-outline' as keyof typeof Ionicons.glyphMap },
  ];

  const handleSave = () => {
    if (!name.trim()) { Alert.alert('Error', 'Ingresa un nombre'); return; }
    if (!validateAmount(targetAmount)) { Alert.alert('Error', 'Ingresa un monto objetivo'); return; }

    addGoal({
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount) || 0,
      category,
      deadline: deadline || getCurrentDate(),
      status: 'active',
    });
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Card style={styles.section}>
          <Input label="Nombre de la meta" placeholder="Ej: Vacaciones" value={name} onChangeText={setName} />
          <Input label="Monto objetivo" placeholder="0.00" value={targetAmount} onChangeText={setTargetAmount} keyboardType="decimal-pad" />
          <Input label="Monto actual (opcional)" placeholder="0.00" value={currentAmount} onChangeText={setCurrentAmount} keyboardType="decimal-pad" />
        </Card>

        <Card style={styles.section}>
          <Text variant="body" style={{ fontWeight: '600', marginBottom: 12 }}>Categoría</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((cat) => (
              <TouchableOpacity key={cat.id} style={[styles.categoryItem, { backgroundColor: category === cat.id ? theme.colors.primary + '20' : theme.colors.surface, borderColor: category === cat.id ? theme.colors.primary : theme.colors.border }]} onPress={() => setCategory(cat.id)}>
                <Ionicons name={cat.icon} size={20} color={category === cat.id ? theme.colors.primary : theme.colors.textSecondary} />
                <Text variant="caption" color={category === cat.id ? theme.colors.primary : theme.colors.textSecondary} style={{ marginLeft: 6 }}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card style={styles.section}>
          <Input label="Fecha límite (YYYY-MM-DD)" placeholder="2026-12-31" value={deadline} onChangeText={setDeadline} />
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={[styles.actionsFixed, { paddingBottom: insets.bottom + 16, paddingHorizontal: 16, paddingTop: 16, backgroundColor: 'transparent' }]}>
        <Button title="Crear meta" onPress={handleSave} variant="primary" fullWidth />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  section: { margin: 16, marginBottom: 0 },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 1 },
  actionsFixed: { position: 'absolute', bottom: 0, left: 0, right: 0 },
});

export default GoalFormScreen;
