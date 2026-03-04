import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Card, Input, Button } from '../../components/atoms';
import { useTheme, useCreditCards, useCurrency } from '../../hooks';
import { CreditCard, CardBrand } from '../../types';
import { validateAmount, getCurrentDate } from '../../utils';
import { CARD_BRANDS, CARD_COLORS } from '../../constants';

interface CardFormScreenProps {
  navigation: any;
  route: {
    params?: {
      card?: CreditCard;
    };
  };
}

const CardFormScreen: React.FC<CardFormScreenProps> = ({ navigation, route }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { addCreditCard, updateCreditCard, deleteCreditCard } = useCreditCards();
  const { currency, formatCurrency } = useCurrency();

  const existingCard = route.params?.card;
  const isEditing = !!existingCard;

  const [name, setName] = useState(existingCard?.name || '');
  const [lastFourDigits, setLastFourDigits] = useState(existingCard?.lastFourDigits || '');
  const [limit, setLimit] = useState(existingCard?.limit?.toString() || '');
  const [currentBalance, setCurrentBalance] = useState(existingCard?.currentBalance?.toString() || '0');
  const [brand, setBrand] = useState<CardBrand>(existingCard?.brand || 'visa');
  const [color, setColor] = useState(existingCard?.color || CARD_COLORS[0]);
  const [dueDate, setDueDate] = useState(existingCard?.dueDate || getCurrentDate());
  const [closingDate, setClosingDate] = useState(existingCard?.closingDate || getCurrentDate());

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para la tarjeta');
      return;
    }
    if (!validateAmount(limit)) {
      Alert.alert('Error', 'Por favor ingresa un límite válido');
      return;
    }

    const cardData = {
      name,
      lastFourDigits: lastFourDigits.slice(-4) || '0000',
      limit: parseFloat(limit),
      currentBalance: parseFloat(currentBalance) || 0,
      brand,
      color,
      dueDate,
      closingDate,
    };

    if (isEditing) {
      updateCreditCard(existingCard.id, cardData);
    } else {
      addCreditCard(cardData);
    }

    navigation.goBack();
  };

  const handleDelete = () => {
    if (!existingCard) return;
    Alert.alert(
      'Eliminar tarjeta',
      '¿Estás seguro de que quieres eliminar esta tarjeta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteCreditCard(existingCard.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Card style={styles.section}>
          <Input
            label="Nombre de la tarjeta"
            placeholder="Ej: Visa Platinum"
            value={name}
            onChangeText={setName}
          />
          <Input
            label="Últimos 4 dígitos"
            placeholder="1234"
            value={lastFourDigits}
            onChangeText={(text) => setLastFourDigits(text.slice(0, 4))}
            keyboardType="number-pad"
            maxLength={4}
          />
        </Card>

        <Card style={styles.section}>
          <Text variant="body" style={{ fontWeight: '600', marginBottom: 12 }}>Límite de crédito ({currency})</Text>
          <Input
            placeholder="0.00"
            value={limit}
            onChangeText={setLimit}
            keyboardType="decimal-pad"
          />
          <Input
            label="Saldo actual"
            placeholder="0.00"
            value={currentBalance}
            onChangeText={setCurrentBalance}
            keyboardType="decimal-pad"
          />
        </Card>

        <Card style={styles.section}>
          <Text variant="body" style={{ fontWeight: '600', marginBottom: 12 }}>Marca</Text>
          <View style={styles.brandRow}>
            {CARD_BRANDS.map((b) => (
              <TouchableOpacity
                key={b.id}
                style={[
                  styles.brandButton,
                  {
                    backgroundColor: brand === b.id ? theme.colors.primary : theme.colors.surface,
                  },
                ]}
                onPress={() => setBrand(b.id as CardBrand)}
              >
                <Text variant="body" color={brand === b.id ? '#FFFFFF' : theme.colors.textSecondary}>
                  {b.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card style={styles.section}>
          <Text variant="body" style={{ fontWeight: '600', marginBottom: 12 }}>Color de la tarjeta</Text>
          <View style={styles.colorsRow}>
            {CARD_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorButton,
                  {
                    backgroundColor: c,
                    borderColor: color === c ? theme.colors.primary : 'transparent',
                    borderWidth: color === c ? 3 : 0,
                  },
                ]}
                onPress={() => setColor(c)}
              />
            ))}
          </View>
        </Card>

        <Card style={styles.section}>
          <Input
            label="Fecha de vencimiento (pago)"
            placeholder="YYYY-MM-DD"
            value={dueDate}
            onChangeText={setDueDate}
          />
          <Input
            label="Fecha de cierre de ciclo"
            placeholder="YYYY-MM-DD"
            value={closingDate}
            onChangeText={setClosingDate}
          />
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={[styles.actionsFixed, { paddingBottom: insets.bottom + 16, paddingHorizontal: 16, paddingTop: 16, backgroundColor: 'transparent' }]}>
        <Button
          title={isEditing ? 'Guardar cambios' : 'Agregar tarjeta'}
          onPress={handleSave}
          variant="primary"
          fullWidth
        />
        {isEditing && (
          <Button
            title="Eliminar tarjeta"
            onPress={handleDelete}
            variant="danger"
            fullWidth
            style={{ marginTop: 12 }}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  section: { margin: 16, marginBottom: 0 },
  brandRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  brandButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  colorsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  colorButton: { width: 44, height: 44, borderRadius: 22 },
  actionsFixed: { position: 'absolute', bottom: 0, left: 0, right: 0 },
});

export default CardFormScreen;
