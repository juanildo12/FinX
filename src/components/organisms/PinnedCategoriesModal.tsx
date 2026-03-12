import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useBudgeting } from '../../hooks';
import { Text } from '../atoms/Text';
import { ALL_CATEGORIES, EXPENSE_CATEGORIES } from '../../constants';
import { Category } from '../../types';

interface PinnedCategoriesModalProps {
  visible: boolean;
  onClose: () => void;
}

const getCategoryInfoFromList = (categoryId: string): Category | undefined => {
  return ALL_CATEGORIES.find((c) => c.id === categoryId);
};

export const PinnedCategoriesModal: React.FC<PinnedCategoriesModalProps> = ({
  visible,
  onClose,
}) => {
  const theme = useTheme();
  const { categoryBudgets, togglePinned, pinnedCategories, removeCategoryBudget } = useBudgeting();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Update selected categories when pinnedCategories changes or modal opens
  useEffect(() => {
    setSelectedCategories(pinnedCategories.map(cb => cb.categoryId));
  }, [pinnedCategories]);

  // Use expense categories from constants instead of categoryBudgets
  const expenseCategories = useMemo(() => {
    return EXPENSE_CATEGORIES;
  }, []);

  const groupedCategories = useMemo(() => {
    const groups: Record<string, typeof expenseCategories> = {
      Bills: [],
      Needs: [],
      Wants: [],
    };
    
    expenseCategories.forEach(cat => {
      if (cat.id === 'housing' || cat.id === 'utilities') {
        groups.Bills.push(cat);
      } else if (cat.id === 'food' || cat.id === 'transport' || cat.id === 'health') {
        groups.Needs.push(cat);
      } else {
        groups.Wants.push(cat);
      }
    });
    
    return groups;
  }, [expenseCategories]);

  const filteredGroups = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    
    const filtered: Record<string, typeof expenseCategories> = {};
    
    Object.entries(groupedCategories).forEach(([group, categories]) => {
      const matchingCategories = categories.filter(cat => {
        const name = cat.name.toLowerCase();
        return name.includes(query);
      });
      
      if (matchingCategories.length > 0) {
        filtered[group] = matchingCategories;
      }
    });
    
    return filtered;
  }, [groupedCategories, searchQuery]);

  const groupNames: Record<string, string> = {
    Bills: 'Facturas',
    Needs: 'Necesidades',
    Wants: 'Deseos',
  };

  const handleToggle = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSave = () => {
    // Remove categories that were unpinned (not in selectedCategories anymore)
    pinnedCategories.forEach(cb => {
      if (!selectedCategories.includes(cb.categoryId)) {
        removeCategoryBudget(cb.categoryId);
      }
    });
    
    // Note: Adding back categories would require more complex logic to recreate budgets
    // For now, users can only remove categories from the plan
    
    onClose();
  };

  const handleCancel = () => {
    setSelectedCategories(pinnedCategories.map(cb => cb.categoryId));
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleCancel}>
              <Text variant="body" style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <Text variant="h3" style={styles.titleText}>Pinned</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text variant="body" style={styles.doneText}>Listo</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Subtitle */}
          <Text variant="body" style={styles.subtitle}>
            ¿Qué categorías consultas constantemente? Agrúpalas para acceso rápido.
          </Text>

          {/* Categories List */}
          <ScrollView style={styles.content}>
            {Object.keys(filteredGroups).length === 0 ? (
              <View style={styles.noResults}>
                <Text variant="body" style={{ color: '#6B7280', textAlign: 'center', marginBottom: 8 }}>
                  No hay categorías disponibles
                </Text>
                <Text variant="caption" style={{ color: '#4B5563', textAlign: 'center' }}>
                  Expense: {JSON.stringify(EXPENSE_CATEGORIES.map(c => c.name))}
                </Text>
              </View>
            ) : (
              Object.entries(filteredGroups).map(([group, categories]) => {
                if (categories.length === 0) return null;
                
                return (
                  <View key={group} style={styles.groupSection}>
                    <Text variant="h3" style={styles.groupTitle}>
                      {groupNames[group] || group}
                    </Text>
                    
                    {categories.map(cat => {
                      const isSelected = selectedCategories.includes(cat.id);
                      
                      return (
                        <TouchableOpacity
                          key={cat.id}
                          style={styles.categoryItem}
                          onPress={() => handleToggle(cat.id)}
                        >
                          <Ionicons 
                            name="pin" 
                            size={16} 
                            color="#10B981" 
                            style={styles.pinIcon}
                          />
                          <View style={[styles.categoryIcon, { backgroundColor: cat.color || '#64748B' }]}>
                            <Ionicons 
                              name={(cat.icon as keyof typeof Ionicons.glyphMap) || 'help-circle'} 
                              size={16} 
                              color="#FFF" 
                            />
                          </View>
                          <Text variant="body" style={styles.categoryName}>
                            {cat.name}
                          </Text>
                          <View style={styles.checkbox}>
                            {isSelected ? (
                              <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
                            ) : (
                              <Ionicons name="ellipse-outline" size={24} color="#6B7280" />
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                );
              })
            )}
            
            {Object.keys(filteredGroups).length > 0 && searchQuery.trim() && Object.entries(filteredGroups).every(([_, cats]) => cats.length === 0) && (
              <Text variant="body" style={styles.noResults}>
                No se encontraron categorías
              </Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 40,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  cancelText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  doneText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 16,
  },
  subtitle: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  groupSection: {
    marginBottom: 20,
  },
  groupTitle: {
    color: '#FFFFFF',
    marginBottom: 12,
    marginTop: 8,
    fontWeight: '700',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  pinIcon: {
    marginRight: 10,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryName: {
    color: '#FFFFFF',
    flex: 1,
    fontSize: 15,
  },
  checkbox: {
    marginLeft: 8,
  },
  noResults: {
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 40,
  },
});
