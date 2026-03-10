import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Card, Divider } from '../../components/atoms';
import { TransactionItem, AlertItem, VoiceInputButton } from '../../components/molecules';
import { useTheme, useTransactions, useAlerts, useCurrency, useSettings, useAccounts } from '../../hooks';
import { calculateMonthlySummary, getCurrentMonth, getExpensesByCategory, parseVoiceTransaction } from '../../utils';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

interface DashboardScreenProps {
  navigation: any;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { transactions, addTransaction, deleteTransaction } = useTransactions();
  const { alerts } = useAlerts();
  const { formatCurrency } = useCurrency();
  const { settings } = useSettings();
  const { accounts } = useAccounts();
  const [refreshing, setRefreshing] = useState(false);
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);
  const [voiceFormModalVisible, setVoiceFormModalVisible] = useState(false);
  const [pendingVoiceData, setPendingVoiceData] = useState<{
    amount: number;
    description: string;
    category: string;
    type: 'income' | 'expense';
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const currentMonth = getCurrentMonth();
  const currentYear = new Date().getFullYear();
  const summary = calculateMonthlySummary(transactions, currentMonth);
  const recentTransactions = transactions.slice(0, 5);
  const pendingAlerts = alerts.filter((a) => !a.isCompleted).slice(0, 3);
  const expensesByCategory = getExpensesByCategory(transactions, currentMonth);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const pieData = expensesByCategory.slice(0, 5).map((item) => ({
    name: item.category,
    amount: item.amount,
    color: item.color,
    legendFontColor: theme.colors.textSecondary,
    legendFontSize: 12,
  }));

  const handleDeleteTransaction = (id: string) => {
    Alert.alert(
      'Eliminar transacción',
      '¿Estás seguro de que quieres eliminar esta transacción?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteTransaction(id),
        },
      ]
    );
  };

  const handleVoiceInput = (text: string) => {
    const parsed = parseVoiceTransaction(text);
    
    if (!parsed.amount) {
      Alert.alert(
        'Transacción por voz',
        'No se detectó un monto. Por favor intenta de nuevo diciendo por ejemplo: "gasté 50 pesos en comida"',
        [{ text: 'OK' }]
      );
      return;
    }

    if (settings.voiceAutoSave) {
      setPendingVoiceData({
        amount: parsed.amount,
        description: parsed.description,
        category: parsed.category,
        type: parsed.type,
      });
      setVoiceModalVisible(true);
    } else {
      const categoryName = parsed.category === 'food' ? 'Alimentación' 
        : parsed.category === 'transport' ? 'Transporte'
        : parsed.category === 'housing' ? 'Vivienda'
        : parsed.category === 'utilities' ? 'Servicios'
        : parsed.category === 'entertainment' ? 'Entretenimiento'
        : parsed.category === 'health' ? 'Salud'
        : parsed.category === 'education' ? 'Educación'
        : parsed.category === 'shopping' ? 'Compras'
        : parsed.category === 'salary' ? 'Salario'
        : parsed.category === 'investment' ? 'Inversión'
        : parsed.category === 'gift' ? 'Regalo'
        : 'Otros';

      setPendingVoiceData({
        amount: parsed.amount,
        description: parsed.description,
        category: parsed.category,
        type: parsed.type,
      });
      setVoiceFormModalVisible(true);
    }
  };

  const handleSaveVoiceTransaction = () => {
    if (!pendingVoiceData || isSaving) return;
    
    setIsSaving(true);
    const defaultAccount = accounts.find(a => a.type === 'cash') || accounts[0];
    
    addTransaction({
      type: pendingVoiceData.type,
      amount: pendingVoiceData.amount,
      description: pendingVoiceData.description,
      category: pendingVoiceData.category,
      tags: [],
      date: new Date().toISOString(),
      paymentMethod: 'cash',
      accountId: defaultAccount?.id,
    });
    
    setVoiceModalVisible(false);
    setPendingVoiceData(null);
    setIsSaving(false);
  };

  const getCategoryName = (catId: string) => {
    return catId === 'food' ? 'Alimentación' 
      : catId === 'transport' ? 'Transporte'
      : catId === 'housing' ? 'Vivienda'
      : catId === 'utilities' ? 'Servicios'
      : catId === 'entertainment' ? 'Entretenimiento'
      : catId === 'health' ? 'Salud'
      : catId === 'education' ? 'Educación'
      : catId === 'shopping' ? 'Compras'
      : catId === 'salary' ? 'Salario'
      : catId === 'investment' ? 'Inversión'
      : catId === 'gift' ? 'Regalo'
      : 'Otros';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.headerFixed, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text variant="h1">Vixo</Text>
            <Text variant="body" color={theme.colors.textSecondary}>
              Tus finanzas en orden
            </Text>
          </View>
          <View style={styles.headerButtons}>
            <VoiceInputButton 
              onTranscript={handleVoiceInput} 
              size="small" 
              variant="primary"
            />
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.colors.primary, marginLeft: 8 }]}
              onPress={() => navigation.navigate('TransactionForm', {})}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >

        <Card style={styles.summaryCard}>
          <Text variant="caption" color={theme.colors.textSecondary}>
            Balance del mes
          </Text>
          <Text
            variant="h1"
            color={summary.savings >= 0 ? theme.colors.income : theme.colors.expense}
            style={{ marginVertical: 8 }}
          >
            {formatCurrency(summary.savings)}
          </Text>
          
          <View style={styles.row}>
            <View style={styles.col}>
              <Text variant="small" color={theme.colors.textMuted}>Ingresos</Text>
              <Text variant="body" color={theme.colors.income} style={{ fontWeight: '600' }}>
                {formatCurrency(summary.income)}
              </Text>
            </View>
            <View style={styles.col}>
              <Text variant="small" color={theme.colors.textMuted}>Gastos</Text>
              <Text variant="body" color={theme.colors.expense} style={{ fontWeight: '600' }}>
                {formatCurrency(summary.expenses)}
              </Text>
            </View>
          </View>
        </Card>

        {pieData.length > 0 && (
          <Card style={styles.chartCard}>
            <Text variant="h3" style={{ marginBottom: 16 }}>Gastos por categoría</Text>
            
            <View style={styles.pieChartContainer}>
              <PieChart
                data={pieData}
                width={screenWidth - 80}
                height={160}
                chartConfig={{
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="12"
                absolute={false}
                hasLegend={false}
              />
            </View>

            <View style={styles.categoryList}>
              {expensesByCategory.slice(0, 5).map((item) => {
                const total = expensesByCategory.reduce((sum, c) => sum + c.amount, 0);
                const percentage = ((item.amount / total) * 100).toFixed(0);
                
                const categoryLabels: Record<string, string> = {
                  food: 'Alimentación',
                  transport: 'Transporte',
                  housing: 'Vivienda',
                  utilities: 'Servicios',
                  entertainment: 'Entretenimiento',
                  health: 'Salud',
                  education: 'Educación',
                  shopping: 'Compras',
                  other_expense: 'Otros',
                };

                return (
                  <View key={item.category} style={styles.categoryItem}>
                    <View style={styles.categoryLeft}>
                      <View style={[styles.categoryDot, { backgroundColor: item.color }]} />
                      <Text variant="body" color={theme.colors.textPrimary}>
                        {categoryLabels[item.category] || item.category}
                      </Text>
                    </View>
                    <View style={styles.categoryRight}>
                      <Text variant="body" color={theme.colors.textPrimary}>
                        {formatCurrency(item.amount)}
                      </Text>
                      <Text variant="caption" color={theme.colors.textMuted}>
                        {percentage}%
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </Card>
        )}

        <View style={styles.sectionHeader}>
          <Text variant="h3">Últimas transacciones</Text>
          <TouchableOpacity onPress={() => navigation.navigate('TransactionsTab')}>
            <Text variant="body" color={theme.colors.primary}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        <Card>
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction, index) => (
              <React.Fragment key={transaction.id}>
                {index > 0 && <Divider spacing={0} />}
                <Swipeable
                  renderRightActions={() => (
                    <TouchableOpacity
                      style={[styles.deleteButton, { backgroundColor: theme.colors.error }]}
                      onPress={() => handleDeleteTransaction(transaction.id)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.deleteText}>Eliminar</Text>
                    </TouchableOpacity>
                  )}
                  overshootRight={false}
                >
                  <TransactionItem
                    transaction={transaction}
                    onPress={() => navigation.navigate('TransactionsTab', { 
                      screen: 'TransactionForm', 
                      params: { transaction } 
                    })}
                  />
                </Swipeable>
              </React.Fragment>
            ))
          ) : (
            <Text variant="body" color={theme.colors.textMuted} style={{ textAlign: 'center', padding: 20 }}>
              No hay transacciones aún
            </Text>
          )}
        </Card>

        <View style={styles.sectionHeader}>
          <Text variant="h3">Alertas pendientes</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Settings', { screen: 'Alerts' })}>
            <Text variant="body" color={theme.colors.primary}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        <Card>
          {pendingAlerts.map((alert, index) => (
            <React.Fragment key={alert.id}>
              {index > 0 && <Divider spacing={0} />}
              <AlertItem alert={alert} />
            </React.Fragment>
          ))}
        </Card>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal
        visible={voiceModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setVoiceModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setVoiceModalVisible(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: theme.colors.card }]} onPress={() => {}}>
            <Text variant="h3" style={{ marginBottom: 16, textAlign: 'center' }}>
              Confirma tu transacción
            </Text>
            
            {pendingVoiceData && (
              <View style={styles.modalData}>
                <View style={styles.modalRow}>
                  <Text variant="body" color={theme.colors.textMuted}>Monto:</Text>
                  <Text variant="h3" color={theme.colors.primary}>{pendingVoiceData.amount}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text variant="body" color={theme.colors.textMuted}>Categoría:</Text>
                  <Text variant="body">{getCategoryName(pendingVoiceData.category)}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text variant="body" color={theme.colors.textMuted}>Tipo:</Text>
                  <Text variant="body" color={pendingVoiceData.type === 'income' ? theme.colors.income : theme.colors.expense}>
                    {pendingVoiceData.type === 'income' ? '📥 Ingreso' : '📤 Gasto'}
                  </Text>
                </View>
                {pendingVoiceData.description && (
                  <View style={styles.modalRow}>
                    <Text variant="body" color={theme.colors.textMuted}>Descripción:</Text>
                    <Text variant="body">{pendingVoiceData.description}</Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: theme.colors.expense }]}
                onPress={() => {
                  setVoiceModalVisible(false);
                  setPendingVoiceData(null);
                }}
              >
                <Text variant="body" color="#FFFFFF">🔄 Volver a grabar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleSaveVoiceTransaction}
                disabled={isSaving}
              >
                <Text variant="body" color="#FFFFFF">💾 Guardar</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={voiceFormModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setVoiceFormModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setVoiceFormModalVisible(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: theme.colors.card }]} onPress={() => {}}>
            <Text variant="h3" style={{ marginBottom: 16, textAlign: 'center' }}>
              Confirma tu transacción
            </Text>
            
            {pendingVoiceData && (
              <View style={styles.modalData}>
                <View style={styles.modalRow}>
                  <Text variant="body" color={theme.colors.textMuted}>Monto:</Text>
                  <Text variant="h3" color={theme.colors.primary}>{pendingVoiceData.amount}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text variant="body" color={theme.colors.textMuted}>Categoría:</Text>
                  <Text variant="body">{getCategoryName(pendingVoiceData.category)}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text variant="body" color={theme.colors.textMuted}>Tipo:</Text>
                  <Text variant="body" color={pendingVoiceData.type === 'income' ? theme.colors.income : theme.colors.expense}>
                    {pendingVoiceData.type === 'income' ? '📥 Ingreso' : '📤 Gasto'}
                  </Text>
                </View>
                {pendingVoiceData.description && (
                  <View style={styles.modalRow}>
                    <Text variant="body" color={theme.colors.textMuted}>Descripción:</Text>
                    <Text variant="body">{pendingVoiceData.description}</Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: theme.colors.expense }]}
                onPress={() => {
                  setVoiceFormModalVisible(false);
                  setPendingVoiceData(null);
                }}
              >
                <Text variant="body" color="#FFFFFF">🔄 Volver a grabar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => {
                  if (pendingVoiceData) {
                    setVoiceFormModalVisible(false);
                    navigation.navigate('TransactionForm', {
                      voiceData: pendingVoiceData,
                    });
                    setPendingVoiceData(null);
                  }
                }}
              >
                <Text variant="body" color="#FFFFFF">📝 Editar en formulario</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 50,
  },
  headerFixed: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    zIndex: 100,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  chartCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  pieChartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  donutInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryList: {
    marginTop: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  row: {
    flexDirection: 'row',
    marginTop: 16,
  },
  col: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 8,
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    lineHeight: 34,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    paddingVertical: 12,
  },
  deleteText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 16,
    padding: 20,
  },
  modalData: {
    marginBottom: 20,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
});

export default DashboardScreen;
