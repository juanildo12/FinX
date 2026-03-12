import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Card, Badge, Button, Input } from '../../components/atoms';
import { useTheme, useCurrency, useBudgeting, useTransactions } from '../../hooks';
import { ALL_CATEGORIES, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../../constants';
import { CoverOverspendingModal } from '../../components/organisms/CoverOverspendingModal';
import { AssignModal } from '../../components/organisms/AssignModal';
import { PinnedCategoriesModal } from '../../components/organisms/PinnedCategoriesModal';
import { CategoryContextMenu } from '../../components/molecules/CategoryContextMenu';

const { width } = Dimensions.get('window');

interface PlanScreenProps {
  navigation: any;
}

const PlanScreen: React.FC<PlanScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { formatCurrency } = useCurrency();
  const {
    plan,
    plans,
    currentPlanId,
    currentMonth,
    categoryBudgets,
    overspentCategories,
    pinnedCategories,
    categoriesByGroup,
    calculateReadyToAssign,
    getCategoryInfo,
    togglePinned,
    addPlan,
    setCurrentPlan,
  } = useBudgeting();
  
  const { transactions } = useTransactions();
  
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showPlansList, setShowPlansList] = useState(false);
  const [showPinnedModal, setShowPinnedModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [pendingPlan, setPendingPlan] = useState<{id: string; name: string; currency: string; currentMonth: string; createdAt: string} | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(ALL_CATEGORIES.map(c => c.id));
  const [pinnedExpanded, setPinnedExpanded] = useState(true);
  
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const isLoading = !categoryBudgets || categoryBudgets.length === 0;

  const handleCreatePlan = () => {
    if (newPlanName.trim()) {
      const newPlan = {
        id: `plan_${Date.now()}`,
        name: newPlanName.trim(),
        currency: 'DOP',
        currentMonth: currentMonth,
        createdAt: new Date().toISOString(),
      };
      setPendingPlan(newPlan);
      setNewPlanName('');
      setShowPlanModal(false);
      setShowCategoryModal(true);
    }
  };

  const handleConfirmCategories = () => {
    if (pendingPlan && selectedCategories.length > 0) {
      addPlan(pendingPlan, selectedCategories);
      setPendingPlan(null);
      setSelectedCategories(ALL_CATEGORIES.map(c => c.id));
      setShowCategoryModal(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  if (isLoading && !plan) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="body" color={theme.colors.textMuted} style={{ marginTop: 12 }}>
          Cargando...
        </Text>
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, padding: 20 }]}>
        <Text variant="h2">Bienvenido</Text>
        <Text variant="body" color={theme.colors.textMuted} style={{ marginTop: 12 }}>
          No tienes un plan de presupuesto. Crea uno para comenzar.
        </Text>
        <Button 
          title="Crear Plan" 
          onPress={() => setShowPlanModal(true)} 
          style={{ marginTop: 20 }}
        />
        <Modal
          visible={showPlanModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowPlanModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
              <View style={styles.modalHeader}>
                <Text variant="h3">Nuevo Plan</Text>
                <TouchableOpacity onPress={() => setShowPlanModal(false)}>
                  <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <View style={styles.modalContent}>
                <Input
                  label="Nombre del Plan"
                  placeholder="Ej: Plan Mensual"
                  value={newPlanName}
                  onChangeText={setNewPlanName}
                />
              </View>
              <View style={styles.modalFooter}>
                <Button
                  title="Crear Plan"
                  onPress={handleCreatePlan}
                  variant="primary"
                  fullWidth
                  disabled={!newPlanName.trim()}
                />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }, []);

  const monthName = useMemo(() => {
    if (!currentMonth) return '';
    const [year, month] = currentMonth.split('-');
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  }, [currentMonth]);

  const handleLongPressCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setContextMenuVisible(true);
  };

  const handleAddTransaction = () => {
    if (selectedCategoryId) {
      const info = getCategoryInfo(selectedCategoryId);
      navigation.navigate('TransactionForm', {
        voiceData: {
          amount: null,
          description: '',
          category: selectedCategoryId,
          type: 'expense',
        },
      });
    }
  };

  const handleViewActivity = () => {
    if (selectedCategoryId) {
      navigation.navigate('Transactions', { category: selectedCategoryId });
    }
  };

  const handleMoveMoney = () => {
    if (selectedCategoryId) {
      setSelectedCategoryId(selectedCategoryId);
      setShowAssignModal(true);
    }
  };

  const contextMenuOptions = [
    { label: 'Agregar Transacción', icon: 'add-circle', iconColor: '#3B82F6', onPress: handleAddTransaction },
    { label: 'Ver Actividad', icon: 'stats-chart', iconColor: '#10B981', onPress: handleViewActivity },
    { label: 'Ver Movimientos', icon: 'time', iconColor: '#F59E0B', onPress: handleViewActivity },
    { label: 'Mover Dinero', icon: 'swap-horizontal', iconColor: '#8B5CF6', onPress: handleMoveMoney },
    { label: 'Editar Meta', icon: 'flag', iconColor: '#EF4444', onPress: () => Alert.alert('Editar Meta', 'Funcionalidad en desarrollo') },
    { label: 'Ver Detalles', icon: 'information-circle', iconColor: '#6B7280', onPress: () => Alert.alert('Ver Detalles', 'Funcionalidad en desarrollo') },
    { label: '...', icon: 'ellipsis-horizontal', iconColor: '#6B7280', onPress: () => {} },
  ];

  const renderAvailableBadge = (available: number) => {
    if (available < 0) {
      return (
        <Badge
          label={formatCurrency(available)}
          backgroundColor={theme.colors.error + '20'}
          color={theme.colors.error}
        />
      );
    }
    if (available > 0) {
      return (
        <Badge
          label={formatCurrency(available)}
          backgroundColor={theme.colors.success + '20'}
          color={theme.colors.success}
        />
      );
    }
    return (
      <Badge
        label={formatCurrency(0)}
        backgroundColor={theme.colors.textMuted + '20'}
        color={theme.colors.textMuted}
      />
    );
  };

  const renderCategoryItem = (categoryId: string, available: number, assigned: number, spent: number, showLongPress: boolean = false) => {
    const info = getCategoryInfo(categoryId);
    return (
      <View key={categoryId} style={styles.categoryRow}>
        <TouchableOpacity 
          style={styles.categoryInfo}
          onPress={() => togglePinned(categoryId)}
          onLongPress={() => showLongPress && handleLongPressCategory(categoryId)}
          delayLongPress={500}
        >
          <View style={[styles.categoryIcon, { backgroundColor: info?.color || theme.colors.textMuted }]}>
            <Ionicons 
              name={(info?.icon as keyof typeof Ionicons.glyphMap) || 'help-circle'} 
              size={16} 
              color="#FFF" 
            />
          </View>
          <View style={styles.categoryText}>
            <Text variant="body">{info?.name || categoryId}</Text>
            <Text variant="caption" color={theme.colors.textMuted}>
              Asignado: {formatCurrency(assigned)}
            </Text>
          </View>
        </TouchableOpacity>
        {renderAvailableBadge(available)}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View
        style={[
          styles.header, 
          { 
            paddingTop: insets.top + 16,
            backgroundColor: theme.colors.primary,
          }
        ]}
      >
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text variant="h2" color="#FFFFFF">
              {plan?.name || 'El Nuevo'}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowPlanModal(true)}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.addButton, { marginLeft: 8 }]}
            onPress={() => setShowMenuModal(true)}
          >
            <Ionicons name="ellipsis-vertical" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text variant="body" color="#FFFFFFCC">
          {greeting}
        </Text>
        <Text variant="caption" color="#FFFFFFAA">
          {monthName}
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {overspentCategories.length > 0 && (
          <TouchableOpacity 
            style={[styles.overspendBanner, { backgroundColor: theme.colors.error }]}
            onPress={() => setShowCoverModal(true)}
          >
            <View style={styles.bannerContent}>
              <Ionicons name="warning" size={20} color="#FFFFFF" />
              <Text variant="body" color="#FFFFFF" style={{ marginLeft: 8, flex: 1 }}>
                {overspentCategories.length} categor{overspentCategories.length === 1 ? 'ía' : 'ías'} overspent{overspentCategories.length === 1 ? 'a' : 'as'}
              </Text>
            </View>
            <View style={styles.coverButton}>
              <Text variant="body" color="#FFFFFF" style={{ fontWeight: '600' }}>
                Cubrir
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[styles.assignBanner, { backgroundColor: theme.colors.success }]}
          onPress={() => setShowAssignModal(true)}
        >
          <View style={styles.bannerContent}>
            <Ionicons name="wallet" size={20} color="#FFFFFF" />
            <Text variant="body" color="#FFFFFF" style={{ marginLeft: 8, flex: 1 }}>
              {formatCurrency(calculateReadyToAssign)} Listo para asignar
            </Text>
          </View>
          <View style={styles.coverButton}>
            <Text variant="body" color="#FFFFFF" style={{ fontWeight: '600' }}>
              Asignar
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <View style={styles.section}>
          <TouchableOpacity 
            style={[
              styles.pinnedHeader,
              { backgroundColor: pinnedExpanded ? '#1E293B' : 'transparent' }
            ]}
            onPress={() => setPinnedExpanded(!pinnedExpanded)}
          >
            <View style={styles.sectionTitleRow}>
              <Ionicons 
                name={pinnedExpanded ? 'pin' : 'pin-outline'} 
                size={18} 
                color={pinnedExpanded ? '#FFFFFF' : theme.colors.primary} 
              />
              <Text 
                variant="h3" 
                style={{ marginLeft: 8 }}
                color={pinnedExpanded ? '#FFFFFF' : undefined}
              >
                Fijados
              </Text>
              {pinnedCategories.length > 0 && (
                <Badge 
                  label={pinnedCategories.length.toString()} 
                  backgroundColor={pinnedExpanded ? '#374151' : theme.colors.primary + '20'}
                  color={pinnedExpanded ? '#FFFFFF' : theme.colors.primary}
                  style={{ marginLeft: 8 }}
                />
              )}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {pinnedCategories.length > 0 && pinnedExpanded && (
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => setShowPinnedModal(true)}
                >
                  <Text variant="small" color="#FFFFFF">Edit</Text>
                </TouchableOpacity>
              )}
              <Ionicons 
                name={pinnedExpanded ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color={pinnedExpanded ? '#FFFFFF' : theme.colors.textMuted} 
                style={{ marginLeft: 8 }}
              />
            </View>
          </TouchableOpacity>
          
          {pinnedExpanded && (
            pinnedCategories.length === 0 ? (
              <Card style={styles.pinnedEmptyCard}>
                <View style={styles.pinnedEmptyState}>
                  <View style={styles.pinnedIllustrationRow}>
                    <View style={styles.pinnedIllustrationBox}>
                      <View style={styles.pinnedIllustrationPin}>
                        <Ionicons name="pin" size={12} color="#10B981" />
                      </View>
                      <Ionicons name="basket" size={40} color="#10B981" />
                    </View>
                    <View style={styles.pinnedIllustrationBox}>
                      <View style={styles.pinnedIllustrationPin}>
                        <Ionicons name="pin" size={12} color="#10B981" />
                      </View>
                      <Ionicons name="cafe" size={40} color="#10B981" />
                    </View>
                    <View style={styles.pinnedIllustrationBox}>
                      <View style={styles.pinnedIllustrationPin}>
                        <Ionicons name="pin" size={12} color="#10B981" />
                      </View>
                      <Ionicons name="leaf" size={40} color="#10B981" />
                    </View>
                  </View>
                  <Text variant="body" style={styles.pinnedEmptyTitle} color="#FFFFFF">
                    Pin your go-to categories
                  </Text>
                  <Text variant="caption" color="#9CA3AF" style={styles.pinnedEmptySubtitle}>
                    See frequently used category balances at a glance.
                  </Text>
                  <TouchableOpacity 
                    style={styles.pinnedAddButton}
                    onPress={() => setShowPinnedModal(true)}
                  >
                    <Text variant="body" color="#FFFFFF" style={{ fontWeight: '600' }}>
                      + Add Pinned Categories
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ) : (
              <View style={styles.pinnedList}>
                {pinnedCategories.map(cb => {
                  const info = getCategoryInfo(cb.categoryId);
                  return (
                    <TouchableOpacity 
                      key={cb.id} 
                      style={styles.pinnedRow}
                      onPress={() => handleLongPressCategory(cb.categoryId)}
                      onLongPress={() => handleLongPressCategory(cb.categoryId)}
                      delayLongPress={500}
                    >
                      <View style={[styles.pinnedIcon, { backgroundColor: info?.color || '#64748B' }]}>
                        <Ionicons name={(info?.icon as keyof typeof Ionicons.glyphMap) || 'help-circle'} size={18} color="#FFF" />
                      </View>
                      <Text variant="body" style={styles.pinnedName}>{info?.name || cb.categoryId}</Text>
                      <View style={styles.pinnedBadge}>
                        <Text variant="body" color="#FFFFFF">RD$0.00</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )
          )}
        </View>

        {pinnedCategories.length < categoryBudgets.length && (['Bills', 'Needs', 'Wants'].map(group => {
          const pinnedCategoryIds = pinnedCategories.map(cb => cb.categoryId);
          const categories = (categoriesByGroup?.[group] || []).filter(cb => !pinnedCategoryIds.includes(cb.categoryId));
          if (!categories || categories.length === 0) return null;
          
          const groupNames: Record<string, string> = {
            Bills: 'Facturas',
            Needs: 'Necesidades',
            Wants: 'Deseos',
            Ingresos: 'Ingresos',
          };
          
          return (
            <View key={group} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text variant="h3">{groupNames[group] || group}</Text>
                <Text variant="caption" color={theme.colors.textMuted}>
                  {categories.length} categor{categories.length === 1 ? 'ía' : 'ías'}
                </Text>
              </View>
              
              <Card style={styles.sectionContent}>
                {categories.map(cb => 
                  renderCategoryItem(
                    cb.categoryId, 
                    cb.available, 
                    cb.assignedThisMonth, 
                    cb.spent
                  )
                )}
              </Card>
            </View>
          );
        }))}

        {calculateReadyToAssign <= 0 && overspentCategories.length === 0 && categoryBudgets.length > 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle" size={48} color={theme.colors.success} />
            <Text variant="body" color={theme.colors.textSecondary} style={{ marginTop: 12, textAlign: 'center' }}>
              ¡Todo equilibrado! No hay nada pendiente.
            </Text>
          </View>
        )}
      </ScrollView>

      <CoverOverspendingModal
        visible={showCoverModal}
        onClose={() => setShowCoverModal(false)}
      />
      
      <AssignModal
        visible={showAssignModal}
        onClose={() => setShowAssignModal(false)}
      />

      <CategoryContextMenu
        visible={contextMenuVisible}
        onClose={() => setContextMenuVisible(false)}
        categoryName={selectedCategoryId ? getCategoryInfo(selectedCategoryId)?.name || '' : ''}
        categoryColor={selectedCategoryId ? getCategoryInfo(selectedCategoryId)?.color || theme.colors.primary : theme.colors.primary}
        options={contextMenuOptions}
      />

      <Modal
        visible={showPlanModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPlanModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
            <View style={styles.modalHeader}>
              <Text variant="h3">Nuevo Plan</Text>
              <TouchableOpacity onPress={() => setShowPlanModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <Input
                label="Nombre del Plan"
                placeholder="Ej: Plan Mensual, Presupuesto 2024"
                value={newPlanName}
                onChangeText={setNewPlanName}
              />
              
              <View style={styles.currencyInfo}>
                <Text variant="caption" color={theme.colors.textMuted}>
                  Moneda: RD$ (Peso Dominicano)
                </Text>
                <Text variant="caption" color={theme.colors.textMuted}>
                  Formato: RD$ antes del monto
                </Text>
                <Text variant="caption" color={theme.colors.textMuted}>
                  Fecha: DD/MM/YYYY
                </Text>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <Button
                title="Crear Plan"
                onPress={handleCreatePlan}
                variant="primary"
                fullWidth
                disabled={!newPlanName.trim()}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.categoryModalContainer}>
            {/* Header */}
            <View style={styles.categoryModalHeader}>
              <TouchableOpacity onPress={() => {
                setShowCategoryModal(false);
                setCategorySearchQuery('');
              }}>
                <Text variant="body" style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <Text variant="h3" style={styles.categoryModalTitle}>Selecciona Categorías</Text>
              <TouchableOpacity onPress={handleConfirmCategories}>
                <Text variant="body" style={styles.doneText}>Listo</Text>
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.categorySearchContainer}>
              <Ionicons name="search" size={18} color="#9CA3AF" />
              <TextInput
                style={styles.categorySearchInput}
                placeholder="Buscar"
                placeholderTextColor="#9CA3AF"
                value={categorySearchQuery}
                onChangeText={setCategorySearchQuery}
              />
            </View>

            {/* Subtitle */}
            <Text variant="body" style={styles.categorySubtitle}>
              Elige las categorías que quieres incluir en tu plan
            </Text>

            <ScrollView style={styles.categoryModalScroll}>
              <Text variant="h3" style={styles.categoryGroupTitle}>Gastos</Text>
              {EXPENSE_CATEGORIES
                .filter(cat => cat.name.toLowerCase().includes(categorySearchQuery.toLowerCase()))
                .map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.categorySelectItem}
                  onPress={() => toggleCategory(cat.id)}
                >
                  <Ionicons name="pin" size={16} color="#10B981" style={styles.categoryPinIcon} />
                  <View style={[styles.categorySelectIcon, { backgroundColor: cat.color }]}>
                    <Ionicons name={(cat.icon as keyof typeof Ionicons.glyphMap) || 'help-circle'} size={16} color="#FFF" />
                  </View>
                  <Text variant="body" style={styles.categoryItemName}>{cat.name}</Text>
                  <View style={styles.categoryCheckbox}>
                    {selectedCategories.includes(cat.id) ? (
                      <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
                    ) : (
                      <Ionicons name="ellipse-outline" size={24} color="#6B7280" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showMenuModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowMenuModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
            <View style={styles.modalHeader}>
              <Text variant="h3">Menú</Text>
              <TouchableOpacity onPress={() => setShowMenuModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <TouchableOpacity 
                style={styles.menuOption}
                onPress={() => {
                  setShowMenuModal(false);
                  setShowPlansList(true);
                }}
              >
                <Ionicons name="folder-open-outline" size={24} color={theme.colors.primary} />
                <Text variant="body" style={{ marginLeft: 12 }}>Abrir Plan</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuOption}
                onPress={() => {
                  setShowMenuModal(false);
                  setShowPlanModal(true);
                }}
              >
                <Ionicons name="add-circle-outline" size={24} color={theme.colors.primary} />
                <Text variant="body" style={{ marginLeft: 12 }}>Crear Nuevo Plan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showPlansList}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPlansList(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
            <View style={styles.modalHeader}>
              <Text variant="h3">Mis Planes</Text>
              <TouchableOpacity onPress={() => setShowPlansList(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.categoryModalContent}>
              {plans.length === 0 ? (
                <Text variant="body" color={theme.colors.textMuted} style={{ textAlign: 'center', padding: 20 }}>
                  No hay planes creados
                </Text>
              ) : (
                plans.map(p => (
                  <TouchableOpacity 
                    key={p.id}
                    style={[
                      styles.menuOption,
                      p.id === plan?.id && { backgroundColor: theme.colors.primary + '20' }
                    ]}
                    onPress={() => {
                      setCurrentPlan(p.id);
                      setShowPlansList(false);
                    }}
                  >
                    <Ionicons 
                      name={p.id === plan?.id ? 'checkmark-circle' : 'folder-outline'} 
                      size={24} 
                      color={p.id === plan?.id ? theme.colors.primary : theme.colors.textMuted} 
                    />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text variant="body">{p.name}</Text>
                      <Text variant="caption" color={theme.colors.textMuted}>
                        {p.currentMonth}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <PinnedCategoriesModal 
        key={showPinnedModal ? 'open' : 'closed'}
        visible={showPinnedModal} 
        onClose={() => setShowPinnedModal(false)} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    marginTop: -12,
  },
  overspendBanner: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  assignBanner: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  coverButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionContent: {
    marginHorizontal: 20,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryText: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalContent: {
    padding: 20,
  },
  currencyInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  modalFooter: {
    padding: 20,
    paddingTop: 0,
  },
  categoryModalContent: {
    padding: 20,
    maxHeight: '70%',
  },
  categorySelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categorySelectIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  pinnedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 8,
  },
  pinnedEmptyCard: {
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: '#1E293B',
    borderRadius: 12,
  },
  pinnedEmptyState: {
    alignItems: 'center',
  },
  pinnedIllustrationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  pinnedIllustrationBox: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    position: 'relative',
  },
  pinnedIllustrationPin: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pinnedEmptyTitle: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  pinnedEmptySubtitle: {
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  pinnedAddButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  editButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pinnedList: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  pinnedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 0,
  },
  pinnedIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pinnedName: {
    color: '#FFFFFF',
    flex: 1,
    fontSize: 15,
  },
  pinnedBadge: {
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryModalContainer: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 40,
    flex: 1,
  },
  categoryModalHeader: {
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
  categoryModalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  doneText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
  categorySearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  categorySearchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 16,
  },
  categorySubtitle: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    fontSize: 14,
  },
  categoryModalScroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categoryGroupTitle: {
    color: '#FFFFFF',
    marginBottom: 12,
    marginTop: 8,
    fontWeight: '700',
  },
  categoryPinIcon: {
    marginRight: 10,
  },
  categoryItemName: {
    color: '#FFFFFF',
    flex: 1,
    fontSize: 15,
  },
  categoryCheckbox: {
    marginLeft: 8,
  },
});

export default PlanScreen;
