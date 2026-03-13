import React, { useState, useMemo } from 'react';
import {
  View,
  Text as RNText,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useCurrency, useBudgeting } from '../../hooks';
import { CategoryBudget } from '../../types';
import { Button } from '../atoms/Button';
import { Text } from '../atoms/Text';
import { SuccessAnimation } from '../molecules/SuccessAnimation';

interface CoverOverspendingModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CoverOverspendingModal: React.FC<CoverOverspendingModalProps> = ({
  visible,
  onClose,
}) => {
  const theme = useTheme();
  const { formatCurrency } = useCurrency();
  const { 
    overspentCategories, 
    categoryBudgets, 
    getCategoryInfo,
    coverOverspending,
    calculateReadyToAssign,
  } = useBudgeting();

  const [selectedOverspent, setSelectedOverspent] = useState<CategoryBudget | null>(null);
  const [selectedSource, setSelectedSource] = useState<CategoryBudget | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [transferAmount, setTransferAmount] = useState(0);
  const [showSourcePicker, setShowSourcePicker] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [step, setStep] = useState<'select' | 'source' | 'amount'>('select');

  const availableSources = useMemo(() => {
    const pinnedPositive = categoryBudgets.filter(
      cb => cb.pinned && cb.available > 0 && cb.categoryId !== selectedOverspent?.categoryId
    );
    const readyToAssignSources: CategoryBudget[] = [];
    if (calculateReadyToAssign > 0) {
      readyToAssignSources.push({
        id: 'ready_to_assign',
        categoryId: 'ready_to_assign',
        planId: '',
        month: '',
        group: 'Ready to Assign',
        assignedThisMonth: 0,
        available: calculateReadyToAssign,
        spent: 0,
        pinned: false,
      });
    }
    const otherPositive = categoryBudgets.filter(
      cb => !cb.pinned && cb.available > 0 && cb.categoryId !== selectedOverspent?.categoryId
    );
    
    return [...pinnedPositive, ...readyToAssignSources, ...otherPositive];
  }, [categoryBudgets, calculateReadyToAssign, selectedOverspent]);

  const filteredSources = useMemo(() => {
    if (!searchQuery) return availableSources;
    const query = searchQuery.toLowerCase();
    return availableSources.filter(cb => {
      const info = getCategoryInfo(cb.categoryId);
      return info?.name.toLowerCase().includes(query) || 
             cb.group.toLowerCase().includes(query);
    });
  }, [availableSources, searchQuery, getCategoryInfo]);

  const maxAmount = selectedSource 
    ? Math.min(Math.abs(selectedOverspent?.available || 0), selectedSource.available)
    : 0;

  const handleSelectOverspent = (overspent: CategoryBudget) => {
    setSelectedOverspent(overspent);
    setTransferAmount(Math.abs(overspent.available));
    setStep('source');
  };

  const handleSelectSource = (source: CategoryBudget) => {
    setSelectedSource(source);
    setTransferAmount(Math.min(Math.abs(selectedOverspent?.available || 0), source.available));
    setShowSourcePicker(false);
    setStep('amount');
  };

  const handleDone = () => {
    if (selectedOverspent && selectedSource) {
      coverOverspending(
        selectedOverspent.categoryId,
        selectedSource.categoryId === 'ready_to_assign' ? 'ready_to_assign' : selectedSource.categoryId,
        transferAmount
      );
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        resetAndClose();
      }, 2500);
    }
  };

  const resetAndClose = () => {
    setSelectedOverspent(null);
    setSelectedSource(null);
    setSearchQuery('');
    setTransferAmount(0);
    setStep('select');
    setShowSourcePicker(false);
    onClose();
  };

  const getCategoryName = (categoryId: string) => {
    if (categoryId === 'ready_to_assign') return 'Por Asignar';
    const info = getCategoryInfo(categoryId);
    return info?.name || categoryId;
  };

  const getCategoryIcon = (categoryId: string) => {
    if (categoryId === 'ready_to_assign') return 'wallet';
    const info = getCategoryInfo(categoryId);
    return info?.icon || 'help-circle';
  };

  const getCategoryColor = (categoryId: string) => {
    if (categoryId === 'ready_to_assign') return theme.colors.primary;
    const info = getCategoryInfo(categoryId);
    return info?.color || theme.colors.textMuted;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <View style={styles.header}>
            <Text variant="h3">
              {step === 'select' && 'Categorías Overspent'}
              {step === 'source' && 'Seleccionar Fuente'}
              {step === 'amount' && 'Cubrir Overspending'}
            </Text>
            <TouchableOpacity onPress={resetAndClose}>
              <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {step === 'select' && (
            <ScrollView style={styles.content}>
              <Text variant="body" color={theme.colors.textSecondary} style={styles.subtitle}>
                Selecciona una categoría para cubrir
              </Text>
              {overspentCategories.map((cb) => {
                const info = getCategoryInfo(cb.categoryId);
                return (
                  <TouchableOpacity
                    key={cb.id}
                    style={[styles.categoryItem, { borderColor: theme.colors.border }]}
                    onPress={() => handleSelectOverspent(cb)}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: info?.color || theme.colors.error }]}>
                      <Ionicons name={(info?.icon as keyof typeof Ionicons.glyphMap) || 'help-circle'} size={18} color="#FFF" />
                    </View>
                    <View style={styles.categoryInfo}>
                      <Text variant="body">{info?.name || cb.categoryId}</Text>
                      <Text variant="caption" color={theme.colors.textMuted}>
                        {cb.group}
                      </Text>
                    </View>
                    <View style={[styles.amountBadge, { backgroundColor: theme.colors.error + '20' }]}>
                      <Text variant="body" color={theme.colors.error}>
                        {formatCurrency(cb.available)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {step === 'source' && (
            <ScrollView style={styles.content}>
              <Text variant="body" color={theme.colors.textSecondary} style={styles.subtitle}>
                ¿De dónde quieres tomar el dinero?
              </Text>
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={theme.colors.textMuted} />
                <TextInput
                  style={[styles.searchInput, { color: theme.colors.textPrimary }]}
                  placeholder="Buscar categoría..."
                  placeholderTextColor={theme.colors.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              {filteredSources.map((cb) => (
                <TouchableOpacity
                  key={cb.id}
                  style={[styles.categoryItem, { borderColor: theme.colors.border }]}
                  onPress={() => handleSelectSource(cb)}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(cb.categoryId) }]}>
                    <Ionicons name={(getCategoryIcon(cb.categoryId) as keyof typeof Ionicons.glyphMap)} size={18} color="#FFF" />
                  </View>
                  <View style={styles.categoryInfo}>
                    <Text variant="body">{getCategoryName(cb.categoryId)}</Text>
                    {cb.pinned && <Text variant="caption" color={theme.colors.primary}>Fijado</Text>}
                  </View>
                  <View style={[styles.amountBadge, { backgroundColor: theme.colors.success + '20' }]}>
                    <Text variant="body" color={theme.colors.success}>
                      {formatCurrency(cb.available)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {step === 'amount' && selectedOverspent && selectedSource && (
            <View style={styles.content}>
              <View style={styles.previewCard}>
                <View style={styles.previewRow}>
                  <Text variant="body" color={theme.colors.textSecondary}>
                    {getCategoryName(selectedOverspent.categoryId)}
                  </Text>
                  <View style={styles.previewArrows}>
                    <Ionicons name="arrow-forward" size={16} color={theme.colors.textMuted} />
                  </View>
                  <Text variant="body" color={theme.colors.textSecondary}>
                    {getCategoryName(selectedSource.categoryId)}
                  </Text>
                </View>
                
                <View style={styles.previewAmounts}>
                  <View style={styles.previewColumn}>
                    <Text variant="caption" color={theme.colors.textMuted}>Antes</Text>
                    <Text variant="body" color={theme.colors.textMuted}>
                      {formatCurrency(selectedOverspent.available)}
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward" size={20} color={theme.colors.primary} />
                  <View style={styles.previewColumn}>
                    <Text variant="caption" color={theme.colors.textMuted}>Después</Text>
                    <Text variant="body" color={theme.colors.success}>
                      {formatCurrency(selectedOverspent.available + transferAmount)}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <Text variant="caption" color={theme.colors.textMuted} style={styles.sliderLabel}>
                  Cantidad a transferir: {formatCurrency(transferAmount)}
                </Text>
                <View style={styles.sliderContainer}>
                  <View 
                    style={[
                      styles.sliderFill, 
                      { 
                        backgroundColor: theme.colors.primary,
                        width: `${(transferAmount / maxAmount) * 100}%` 
                      }
                    ]} 
                  />
                  <TouchableOpacity
                    style={[
                      styles.sliderThumb,
                      { 
                        backgroundColor: theme.colors.primary,
                        left: `${((transferAmount - 0) / (maxAmount - 0)) * 100}%`,
                        marginLeft: -12,
                      }
                    ]}
                  />
                </View>
                <View style={styles.sliderButtons}>
                  <TouchableOpacity
                    style={[styles.sliderButton, { borderColor: theme.colors.border }]}
                    onPress={() => setTransferAmount(0)}
                  >
                    <Text variant="caption">RD$0</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.sliderButton, { borderColor: theme.colors.border }]}
                    onPress={() => setTransferAmount(Math.floor(maxAmount / 2))}
                  >
                    <Text variant="caption">{formatCurrency(Math.floor(maxAmount / 2))}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.sliderButton, { borderColor: theme.colors.primary }]}
                    onPress={() => setTransferAmount(maxAmount)}
                  >
                    <Text variant="caption" color={theme.colors.primary}>{formatCurrency(maxAmount)}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Button
                title="Listo"
                onPress={handleDone}
                variant="primary"
                fullWidth
                disabled={transferAmount <= 0}
              />
            </View>
          )}

          {step === 'source' && (
            <View style={styles.footer}>
              <Button
                title="Volver"
                onPress={() => setStep('select')}
                variant="outline"
                fullWidth
              />
            </View>
          )}

          {step === 'amount' && (
            <View style={styles.footer}>
              <Button
                title="Cambiar fuente"
                onPress={() => setStep('source')}
                variant="outline"
                fullWidth
              />
            </View>
          )}
        </View>
      </View>
      <SuccessAnimation
        visible={showSuccess}
        message="¡Cubierto!"
        onDismiss={() => setShowSuccess(false)}
      />
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  content: {
    padding: 20,
    flex: 1,
  },
  subtitle: {
    marginBottom: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
    marginLeft: 12,
  },
  amountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
  },
  previewCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  previewArrows: {
    marginHorizontal: 12,
  },
  previewAmounts: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  previewColumn: {
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  sliderLabel: {
    textAlign: 'center',
    marginBottom: 8,
  },
  sliderContainer: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginBottom: 12,
    position: 'relative',
  },
  sliderFill: {
    height: '100%',
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    top: -7,
    width: 24,
    height: 24,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sliderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderButton: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  footer: {
    padding: 20,
    paddingTop: 0,
  },
});
