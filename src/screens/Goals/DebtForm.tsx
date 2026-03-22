import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card, Input, Button } from '../../components/atoms';
import { useTheme, useDebts } from '../../hooks';
import { validateAmount } from '../../utils';
import { DebtType, Debt } from '../../types';

interface DebtFormScreenProps {
  navigation: any;
  route?: {
    params?: {
      debt?: Debt;
    };
  };
}

const DEBT_TYPES = [
  { value: 'personal', label: 'Personal', description: 'Préstamo de persona' },
  { value: 'banking', label: 'Bancaria', description: 'Préstamo de banco' },
] as const;

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DAYS_WEEK = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

const DebtFormScreen: React.FC<DebtFormScreenProps> = ({ navigation, route }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { addDebt, updateDebt } = useDebts();
  
  const editingDebt = route?.params?.debt;
  const isEditing = !!editingDebt;

  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [debtType, setDebtType] = useState<DebtType>(editingDebt?.type || 'banking');
  const [name, setName] = useState(editingDebt?.name || '');
  const [person, setPerson] = useState(editingDebt?.person || '');
  const [institution, setInstitution] = useState(editingDebt?.institution || '');
  const [totalAmount, setTotalAmount] = useState(editingDebt?.totalAmount.toString() || '');
  const [remainingAmount, setRemainingAmount] = useState(editingDebt?.remainingAmount.toString() || '');
  const [interestRate, setInterestRate] = useState(editingDebt?.interestRate?.toString() || '');
  const [monthlyPayment, setMonthlyPayment] = useState(editingDebt?.monthlyPayment?.toString() || '');
  
  const [selectedDate, setSelectedDate] = useState(
    editingDebt?.dueDate ? new Date(editingDebt.dueDate) : new Date()
  );
  const [pickerMonth, setPickerMonth] = useState(
    editingDebt?.dueDate ? new Date(editingDebt.dueDate) : new Date()
  );

  useEffect(() => {
    navigation.setOptions({ title: isEditing ? 'Editar deuda' : 'Nueva deuda' });
  }, [isEditing]);

  const selectedType = DEBT_TYPES.find(t => t.value === debtType);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const selectedMonthNum = pickerMonth.getMonth();
  const selectedYearNum = pickerMonth.getFullYear();
  const daysInMonth = getDaysInMonth(selectedMonthNum, selectedYearNum);
  const firstDay = getFirstDayOfMonth(selectedMonthNum, selectedYearNum);

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const handleSelectDay = (day: number) => {
    const newDate = new Date(selectedYearNum, selectedMonthNum, day);
    setSelectedDate(newDate);
    setShowDatePicker(false);
  };

  const handleSave = () => {
    if (!name.trim()) { Alert.alert('Error', 'Ingresa el nombre de la deuda'); return; }
    if (!validateAmount(totalAmount)) { Alert.alert('Error', 'Ingresa el monto total'); return; }
    if (debtType === 'personal' && !person.trim()) { Alert.alert('Error', 'Ingresa el nombre de la persona'); return; }
    if (debtType === 'banking' && !institution.trim()) { Alert.alert('Error', 'Ingresa el nombre del acreedor'); return; }

    const debtData = {
      name,
      type: debtType,
      creditor: debtType === 'banking' ? institution : person,
      person: debtType === 'personal' ? person : undefined,
      institution: debtType === 'banking' ? institution : undefined,
      totalAmount: parseFloat(totalAmount),
      remainingAmount: parseFloat(remainingAmount) || parseFloat(totalAmount),
      interestRate: parseFloat(interestRate) || 0,
      monthlyPayment: parseFloat(monthlyPayment) || 0,
      dueDate: formatDate(selectedDate),
      status: 'active' as const,
    };

    if (isEditing && editingDebt) {
      updateDebt(editingDebt.id, debtData);
    } else {
      addDebt(debtData);
    }
    navigation.goBack();
  };

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Card style={styles.section}>
          <Text variant="body" style={{ fontWeight: '600', marginBottom: 8 }}>Tipo de deuda</Text>
          
          <TouchableOpacity
            style={[styles.selector, { borderColor: theme.colors.border }]}
            onPress={() => setShowTypePicker(!showTypePicker)}
          >
            <View style={{ flexDirection: 'column' }}>
              <Text variant="body" color={theme.colors.textPrimary}>
                {selectedType?.label}
              </Text>
              <Text variant="caption" color={theme.colors.textMuted} style={{ marginTop: 4 }}>
                {selectedType?.description}
              </Text>
            </View>
            <Ionicons 
              name={showTypePicker ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={theme.colors.textMuted} 
            />
          </TouchableOpacity>

          {showTypePicker && (
            <View style={[styles.dropdown, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              {DEBT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.dropdownItem,
                    debtType === type.value && { backgroundColor: theme.colors.primary + '15' }
                  ]}
                  onPress={() => {
                    setDebtType(type.value);
                    setShowTypePicker(false);
                  }}
                >
                  <View style={{ flexDirection: 'column', flex: 1 }}>
                    <Text 
                      variant="body" 
                      color={debtType === type.value ? theme.colors.primary : theme.colors.textPrimary}
                      style={{ fontWeight: debtType === type.value ? '600' : '400' }}
                    >
                      {type.label}
                    </Text>
                    <Text variant="caption" color={theme.colors.textMuted} style={{ marginTop: 4 }}>
                      {type.description}
                    </Text>
                  </View>
                  {debtType === type.value && (
                    <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Card>

        <Card style={styles.section}>
          <Input label="Nombre de la deuda" placeholder="Ej: Préstamo personal" value={name} onChangeText={setName} />
          
          {debtType === 'personal' ? (
            <Input label="Persona" placeholder="Ej: Juan Pérez" value={person} onChangeText={setPerson} />
          ) : (
            <Input label="Acreedor" placeholder="Ej: Banco Nacional" value={institution} onChangeText={setInstitution} />
          )}
        </Card>

        <Card style={styles.section}>
          <Text variant="body" style={{ fontWeight: '600', marginBottom: 12 }}>Montos</Text>
          <Input label="Monto total" placeholder="0.00" value={totalAmount} onChangeText={setTotalAmount} keyboardType="decimal-pad" />
          <Input label="Monto restante" placeholder="0.00" value={remainingAmount} onChangeText={setRemainingAmount} keyboardType="decimal-pad" />
          
          {debtType === 'banking' && (
            <>
              <Input label="Tasa de interés (%)" placeholder="0" value={interestRate} onChangeText={setInterestRate} keyboardType="decimal-pad" />
              <Input label="Pago mensual" placeholder="0.00" value={monthlyPayment} onChangeText={setMonthlyPayment} keyboardType="decimal-pad" />
            </>
          )}
        </Card>

        <Card style={styles.section}>
          <Text variant="body" style={{ fontWeight: '600', marginBottom: 8 }}>Fecha de vencimiento</Text>
          
          <TouchableOpacity
            style={[styles.selector, { borderColor: theme.colors.border }]}
            onPress={() => setShowDatePicker(true)}
          >
            <View style={styles.selectorContent}>
              <Ionicons name="calendar" size={20} color={theme.colors.primary} style={{ marginRight: 12 }} />
              <Text variant="body" color={theme.colors.textPrimary}>
                {formatDate(selectedDate)}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={[styles.actionsFixed, { paddingBottom: insets.bottom + 16, paddingHorizontal: 16, paddingTop: 16, backgroundColor: 'transparent' }]}>
        <Button title={isEditing ? 'Guardar cambios' : 'Crear deuda'} onPress={handleSave} variant="primary" fullWidth />
      </View>

      {/* Date Picker Modal */}
      <Modal visible={showDatePicker} transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowDatePicker(false)}>
          <Pressable style={[styles.calendarContainer, { backgroundColor: theme.colors.card }]} onPress={() => {}}>
            <View style={styles.calendarHeader}>
              <Text variant="h3">Seleccionar fecha</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Month Navigation */}
            <View style={styles.monthNav}>
              <TouchableOpacity 
                style={styles.navButton}
                onPress={() => setPickerMonth(new Date(selectedYearNum, selectedMonthNum - 1, 1))}
              >
                <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
              <Text variant="h3" color={theme.colors.textPrimary}>
                {MONTHS[selectedMonthNum]} {selectedYearNum}
              </Text>
              <TouchableOpacity 
                style={styles.navButton}
                onPress={() => setPickerMonth(new Date(selectedYearNum, selectedMonthNum + 1, 1))}
              >
                <Ionicons name="chevron-forward" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              <View style={styles.weekDaysRow}>
                {DAYS_WEEK.map((day) => (
                  <View key={day} style={styles.weekDayCell}>
                    <Text variant="caption" color={theme.colors.textMuted} style={{ fontWeight: '600' }}>
                      {day}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.daysGridContainer}>
                {emptyDays.map((_, index) => (
                  <View key={`empty-${index}`} style={styles.dayCell} />
                ))}
                {days.map((day) => {
                  const isSelected = selectedDate.getDate() === day && 
                    selectedMonthNum === selectedDate.getMonth() && 
                    selectedYearNum === selectedDate.getFullYear();
                  return (
                    <TouchableOpacity
                      key={day}
                      style={[styles.dayCell, isSelected && styles.dayCellSelected]}
                      onPress={() => handleSelectDay(day)}
                    >
                      <Text 
                        variant="body" 
                        color={isSelected ? '#FFFFFF' : theme.colors.textPrimary}
                        style={{ fontWeight: isSelected ? '600' : '400' }}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <Button 
              title="Confirmar" 
              onPress={() => setShowDatePicker(false)} 
              variant="primary" 
              fullWidth 
              style={{ marginTop: 20 }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  section: { margin: 16, marginBottom: 0 },
  actionsFixed: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  selectorContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdown: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dropdownItemContent: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarContainer: {
    width: '100%',
    maxWidth: 350,
    borderRadius: 20,
    padding: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  calendarGrid: {
    marginTop: 10,
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  daysGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  dayCellSelected: {
    backgroundColor: '#10B981',
  },
});

export default DebtFormScreen;
