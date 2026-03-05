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
import { useTheme, useCategories } from '../../hooks';
import { Category, TransactionType } from '../../types';

const ICON_OPTIONS = [
  'restaurant', 'car', 'home', 'flash', 'film', 'heart', 'book', 'bag',
  'cash', 'trending-up', 'gift', 'wallet', 'document-text', 'fitness',
  'school', 'medical', 'cart', 'game-controller', 'paw', 'airplane',
  'water', 'phone-portrait', 'wifi', 'hardware-chip', 'ellipse',
];

const COLOR_OPTIONS = [
  '#F59E0B', '#EF4444', '#8B5CF6', '#3B82F6', '#EC4899', '#10B981',
  '#6366F1', '#F97316', '#64748B', '#22C55E', '#06B6D4', '#EAB308',
];

interface CategoriesScreenProps {
  navigation: any;
}

const CategoriesScreen: React.FC<CategoriesScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('home');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [selectedType, setSelectedType] = useState<TransactionType>('expense');

  const incomeCategories = categories.filter((c) => c.type === 'income');
  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const openAddModal = (type: TransactionType) => {
    setEditingCategory(null);
    setName('');
    setSelectedIcon('home');
    setSelectedColor('#3B82F6');
    setSelectedType(type);
    setModalVisible(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setSelectedIcon(category.icon);
    setSelectedColor(category.color);
    setSelectedType(category.type);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para la categoría');
      return;
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor,
      });
    } else {
      addCategory({
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor,
        type: selectedType,
      });
    }

    setModalVisible(false);
  };

  const handleDelete = (category: Category) => {
    Alert.alert(
      'Eliminar categoría',
      `¿Estás seguro de que quieres eliminar "${category.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteCategory(category.id),
        },
      ]
    );
  };

  const renderCategoryItem = (category: Category) => (
    <TouchableOpacity
      key={category.id}
      style={styles.categoryItem}
      onPress={() => openEditModal(category)}
    >
      <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
        <Ionicons
          name={category.icon as keyof typeof Ionicons.glyphMap}
          size={20}
          color={category.color}
        />
      </View>
      <Text variant="body" style={styles.categoryName}>{category.name}</Text>
      <TouchableOpacity
        onPress={() => handleDelete(category)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="trash-outline" size={20} color={theme.colors.expense} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="body" style={{ fontWeight: '600' }}>Gastos</Text>
            <TouchableOpacity onPress={() => openAddModal('expense')}>
              <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          <Divider />
          {expenseCategories.map(renderCategoryItem)}
        </Card>

        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="body" style={{ fontWeight: '600' }}>Ingresos</Text>
            <TouchableOpacity onPress={() => openAddModal('income')}>
              <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          <Divider />
          {incomeCategories.map(renderCategoryItem)}
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
              {editingCategory ? 'Editar' : 'Nueva'} Categoría
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Text variant="body" color={theme.colors.primary} style={{ fontWeight: '600' }}>Guardar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Card style={styles.modalSection}>
              <Input
                label="Nombre"
                placeholder="Nombre de la categoría"
                value={name}
                onChangeText={setName}
              />
            </Card>

            <Card style={styles.modalSection}>
              <Text variant="body" style={{ fontWeight: '600', marginBottom: 12 }}>Tipo</Text>
              <View style={styles.typeRow}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor: selectedType === 'expense' ? theme.colors.expense : theme.colors.surface,
                    },
                  ]}
                  onPress={() => setSelectedType('expense')}
                >
                  <Text variant="body" color={selectedType === 'expense' ? '#FFFFFF' : theme.colors.textSecondary}>
                    Gasto
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor: selectedType === 'income' ? theme.colors.income : theme.colors.surface,
                    },
                  ]}
                  onPress={() => setSelectedType('income')}
                >
                  <Text variant="body" color={selectedType === 'income' ? '#FFFFFF' : theme.colors.textSecondary}>
                    Ingreso
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>

            <Card style={styles.modalSection}>
              <Text variant="body" style={{ fontWeight: '600', marginBottom: 12 }}>Icono</Text>
              <View style={styles.iconGrid}>
                {ICON_OPTIONS.map((icon) => (
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

            <Card style={styles.modalSection}>
              <Text variant="body" style={{ fontWeight: '600', marginBottom: 12 }}>Color</Text>
              <View style={styles.colorGrid}>
                {COLOR_OPTIONS.map((color) => (
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
  section: { marginBottom: 16, padding: 0 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingVertical: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryName: { flex: 1 },
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
  typeRow: { flexDirection: 'row', gap: 12 },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
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
});

export default CategoriesScreen;
