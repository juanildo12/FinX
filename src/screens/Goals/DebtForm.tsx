import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Card, Input, Button } from '../../components/atoms';
import { useTheme, useDebts } from '../../hooks';
import { validateAmount, getCurrentDate } from '../../utils';

interface DebtFormScreenProps {
  navigation: any;
}

const DebtFormScreen: React.FC<DebtFormScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { addDebt } = useDebts();

  const [name, setName] = useState('');
  const [creditor, setCreditor] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [remainingAmount, setRemainingAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSave = () => {
    if (!name.trim()) { Alert.alert('Error', 'Ingresa el nombre de la deuda'); return; }
    if (!validateAmount(totalAmount)) { Alert.alert('Error', 'Ingresa el monto total'); return; }

    addDebt({
      name,
      creditor,
      totalAmount: parseFloat(totalAmount),
      remainingAmount: parseFloat(remainingAmount) || parseFloat(totalAmount),
      interestRate: parseFloat(interestRate) || 0,
      monthlyPayment: parseFloat(monthlyPayment) || 0,
      dueDate: dueDate || getCurrentDate(),
      status: 'active',
    });
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Card style={styles.section}>
          <Input label="Nombre de la deuda" placeholder="Ej: Préstamo personal" value={name} onChangeText={setName} />
          <Input label="Acreedor" placeholder="Ej: Banco Nacional" value={creditor} onChangeText={setCreditor} />
        </Card>

        <Card style={styles.section}>
          <Text variant="body" style={{ fontWeight: '600', marginBottom: 12 }}>Montos</Text>
          <Input label="Monto total" placeholder="0.00" value={totalAmount} onChangeText={setTotalAmount} keyboardType="decimal-pad" />
          <Input label="Monto restante" placeholder="0.00" value={remainingAmount} onChangeText={setRemainingAmount} keyboardType="decimal-pad" />
          <Input label="Tasa de interés (%)" placeholder="0" value={interestRate} onChangeText={setInterestRate} keyboardType="decimal-pad" />
          <Input label="Pago mensual" placeholder="0.00" value={monthlyPayment} onChangeText={setMonthlyPayment} keyboardType="decimal-pad" />
        </Card>

        <Card style={styles.section}>
          <Input label="Fecha de vencimiento" placeholder="YYYY-MM-DD" value={dueDate} onChangeText={setDueDate} />
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={[styles.actionsFixed, { paddingBottom: insets.bottom + 16, paddingHorizontal: 16, paddingTop: 16, backgroundColor: 'transparent' }]}>
        <Button title="Crear deuda" onPress={handleSave} variant="primary" fullWidth />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  section: { margin: 16, marginBottom: 0 },
  actionsFixed: { position: 'absolute', bottom: 0, left: 0, right: 0 },
});

export default DebtFormScreen;
