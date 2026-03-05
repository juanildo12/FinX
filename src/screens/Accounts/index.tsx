import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card, Input, Button, Divider } from '../../components/atoms';
import { useTheme, useAccounts, useCurrency, useTransactions } from '../../hooks';
import { Account, AccountType } from '../../types';

const ACCOUNT_TYPES: { id: AccountType; name: string; icon: string }[] = [
  { id: 'checking', name: 'Cuenta Corriente', icon: 'wallet-outline' },
  { id: 'cash', name: 'Dinero', icon: 'cash-outline' },
  { id: 'savings', name: 'Ahorros', icon: 'albums-outline' },
  { id: 'investment', name: 'Inversión', icon: 'trending-up-outline' },
  { id: 'other', name: 'Otros', icon: 'ellipse-outline' },
];

const ACCOUNT_COLORS = [
  '#1E3A5F', '#2E7D32', '#7B1FA2', '#C62828', '#F57C00',
  '#00838F', '#4527A0', '#283593', '#EC4899', '#10B981',
];

const ACCOUNT_ICONS = [
  'wallet', 'cash', 'albums', 'trending-up', 'card',
  'business', 'home', 'car', 'airplane', 'heart',
];

interface AccountsScreenProps {
  navigation: any;
}

const AccountsScreen: React.FC<AccountsScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { accounts, addAccount, updateAccount, deleteAccount, totalBalance } = useAccounts();
  const { formatCurrency } = useCurrency();
  const { transactions } = useTransactions();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('checking');
  const [institution, setInstitution] = useState('');
  const [initialBalance, setInitialBalance] = useState('0');
  const [selectedColor, setSelectedColor] = useState('#1E3A5F');
  const [selectedIcon, setSelectedIcon] = useState('wallet');

  const getAccountStats = (accountId: string) => {
    const accountTransactions = transactions.filter(t => t.accountId === accountId);
    const income = accountTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = accountTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const transfers = accountTransactions.filter(t => t.paymentMethod === 'bank_transfer').length;
    return { income, expenses, transfers, count: accountTransactions.length };
  };

  const getTypeInfo = (typeId: AccountType) => {
    return ACCOUNT_TYPES.find(t => t.id === typeId) || ACCOUNT_TYPES[0];
  };

  const openAddModal = () => {
    setEditingAccount(null);
    setName('');
    setType('checking');
    setInstitution('');
    setInitialBalance('0');
    setSelectedColor('#1E3A5F');
    setSelectedIcon('wallet');
    setModalVisible(true);
  };

  const openEditModal = (account: Account) => {
    setEditingAccount(account);
    setName(account.name);
    setType(account.type);
    setInstitution(account.institution || '');
    setInitialBalance(account.initialBalance.toString());
    setSelectedColor(account.color);
    setSelectedIcon(account.icon);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para la cuenta');
      return;
    }

    const balance = parseFloat(initialBalance) || 0;

    if (editingAccount) {
      updateAccount(editingAccount.id, {
        name: name.trim(),
        type,
        institution: institution.trim() || undefined,
        initialBalance: balance,
        color: selectedColor,
        icon: selectedIcon,
      });
    } else {
      addAccount({
        name: name.trim(),
        type,
        institution: institution.trim() || undefined,
        initialBalance: balance,
        color: selectedColor,
        icon: selectedIcon,
      });
    }

    setModalVisible(false);
  };

  const handleDelete = (account: Account) => {
    Alert.alert(
      'Eliminar cuenta',
      `¿Estás seguro de que quieres eliminar "${account.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteAccount(account.id),
        },
      ]
    );
  };

  const renderAccountItem = (account: Account) => {
    const stats = getAccountStats(account.id);
    const typeInfo = getTypeInfo(account.type);

    return (
      <TouchableOpacity
        key={account.id}
        style={styles.accountItem}
        onPress={() => openEditModal(account)}
      >
        <View style={[styles.accountIcon, { backgroundColor: account.color + '20' }]}>
          <Ionicons
            name={account.icon as keyof typeof Ionicons.glyphMap}
            size={24}
            color={account.color}
          />
        </View>
        <View style={styles.accountInfo}>
          <Text variant="body" style={{ fontWeight: '600' }}>{account.name}</Text>
          <Text variant="caption" color={theme.colors.textMuted}>
            {typeInfo.name}{account.institution ? ` • ${account.institution}` : ''}
          </Text>
          <View style={styles.accountStats}>
            <Text variant="small" color={theme.colors.income}>
              +{formatCurrency(stats.income)}
            </Text>
            <Text variant="small" color={theme.colors.expense} style={{ marginLeft: 8 }}>
              -{formatCurrency(stats.expenses)}
            </Text>
            <Text variant="small" color={theme.colors.textMuted} style={{ marginLeft: 8 }}>
              {stats.transfers} transfer.
            </Text>
          </View>
        </View>
        <View style={styles.accountBalance}>
          <Text variant="body" style={{ fontWeight: '600' }}>
            {formatCurrency(account.currentBalance)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.summaryCard}>
          <Text variant="caption" color={theme.colors.textMuted}>Total en Cuentas</Text>
          <Text variant="h1" style={{ marginTop: 4 }}>{formatCurrency(totalBalance)}</Text>
          <Text variant="small" color={theme.colors.textMuted} style={{ marginTop: 8 }}>
            {accounts.length} cuenta{accounts.length !== 1 ? 's' : ''}
          </Text>
        </Card>

        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="body" style={{ fontWeight: '600' }}>Mis Cuentas</Text>
            <TouchableOpacity onPress={openAddModal}>
              <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          <Divider spacing={0} />
          {accounts.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="wallet-outline" size={48} color={theme.colors.textMuted} />
              <Text variant="body" color={theme.colors.textMuted} style={{ marginTop: 12 }}>
                No hay cuentas todavía
              </Text>
              <Button
                title="Agregar cuenta"
                onPress={openAddModal}
                variant="primary"
                style={{ marginTop: 16 }}
              />
            </View>
          ) : (
            accounts.map(renderAccountItem)
          )}
        </Card>
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text variant="body" color={theme.colors.primary}>Cancelar</Text>
            </TouchableOpacity>
            <Text variant="body" style={{ fontWeight: '600' }}>
              {editingAccount ? 'Editar' : 'Nueva'} Cuenta
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Text variant="body" color={theme.colors.primary} style={{ fontWeight: '600' }}>Guardar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Card style={styles.modalSection}>
              <Input
                label="Nombre de la cuenta"
                placeholder="Ej: Cuenta Principal"
                value={name}
                onChangeText={setName}
              />
            </Card>

            <Card style={styles.modalSection}>
              <Text variant="body" style={{ fontWeight: '600', marginBottom: 12 }}>Tipo de Cuenta</Text>
              <View style={styles.typeGrid}>
                {ACCOUNT_TYPES.map((typeOption) => (
                  <TouchableOpacity
                    key={typeOption.id}
                    style={[
                      styles.typeOption,
                      {
                        backgroundColor: type === typeOption.id ? theme.colors.primary + '20' : theme.colors.surface,
                        borderColor: type === typeOption.id ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                    onPress={() => setType(typeOption.id)}
                  >
                    <Ionicons
                      name={typeOption.icon as keyof typeof Ionicons.glyphMap}
                      size={20}
                      color={type === typeOption.id ? theme.colors.primary : theme.colors.textSecondary}
                    />
                    <Text
                      variant="small"
                      color={type === typeOption.id ? theme.colors.primary : theme.colors.textSecondary}
                      style={{ marginTop: 4, textAlign: 'center' }}
                    >
                      {typeOption.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>

            <Card style={styles.modalSection}>
              <Input
                label="Institución Financiera (opcional)"
                placeholder="Ej: Banco de Chile"
                value={institution}
                onChangeText={setInstitution}
              />
            </Card>

            <Card style={styles.modalSection}>
              <Input
                label="Saldo Inicial"
                placeholder="0"
                value={initialBalance}
                onChangeText={setInitialBalance}
                keyboardType="decimal-pad"
              />
            </Card>

            <Card style={styles.modalSection}>
              <Text variant="body" style={{ fontWeight: '600', marginBottom: 12 }}>Color</Text>
              <View style={styles.colorGrid}>
                {ACCOUNT_COLORS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      {
                        backgroundColor: color,
                        borderColor: selectedColor === color ? '#000' : 'transparent',
                        borderWidth: selectedColor === color ? 3 : 0,
                      },
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>
            </Card>

            <Card style={styles.modalSection}>
              <Text variant="body" style={{ fontWeight: '600', marginBottom: 12 }}>Icono</Text>
              <View style={styles.iconGrid}>
                {ACCOUNT_ICONS.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconOption,
                      {
                        backgroundColor: selectedIcon === icon ? selectedColor + '20' : theme.colors.surface,
                        borderColor: selectedIcon === icon ? selectedColor : theme.colors.border,
                      },
                    ]}
                    onPress={() => setSelectedIcon(icon)}
                  >
                    <Ionicons
                      name={icon as keyof typeof Ionicons.glyphMap}
                      size={24}
                      color={selectedIcon === icon ? selectedColor : theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </Card>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },
  summaryCard: { alignItems: 'center', paddingVertical: 24, marginBottom: 16 },
  section: { marginBottom: 16, padding: 0 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  accountInfo: { flex: 1 },
  accountStats: {
    flexDirection: 'row',
    marginTop: 4,
  },
  accountBalance: {
    alignItems: 'flex-end',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalContent: { flex: 1, padding: 16 },
  modalSection: { marginBottom: 16 },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    width: '31%',
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconOption: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
  },
});

export default AccountsScreen;
