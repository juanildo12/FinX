import React, { useState, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useCurrency, useBudgeting } from '../../hooks';
import { CategoryBudget } from '../../types';
import { Button } from '../../components/atoms/Button';
import { Text } from '../../components/atoms/Text';
import { SuccessAnimation } from '../../components/molecules/SuccessAnimation';

type SettingsStackParamList = {
  CoverOverspending: undefined;
};

type NavigationProp = NativeStackNavigationProp<SettingsStackParamList, 'CoverOverspending'>;

type Step = 'select' | 'source' | 'amount';

export const CoverOverspendingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
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
  const [showSuccess, setShowSuccess] = useState(false);
  const [step, setStep] = useState<Step>('select');

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
        navigation.goBack();
      }, 2500);
    }
  };

  const handleBack = () => {
    if (step === 'source') {
      setStep('select');
      setSelectedOverspent(null);
    } else if (step === 'amount') {
      setStep('source');
      setSelectedSource(null);
      setTransferAmount(0);
    } else {
      navigation.goBack();
    }
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

  const renderHeader = () => {
    let title = '';
    if (step === 'select') title = 'Categorías Overspent';
    else if (step === 'source') title = 'Seleccionar Fuente';
    else if (step === 'amount') title = 'Cubrir Overspending';

    return (
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text variant="h3" style={styles.headerTitle}>{title}</Text>
        <View style={styles.headerSpacer} />
      </View>
    );
  };

  const renderSelectStep = () => (
    <View style={styles.content}>
      <Text variant="body" color={theme.colors.textSecondary} style={styles.subtitle}>
        Selecciona una categoría para cubrir
      </Text>
      <ScrollView showsVerticalScrollIndicator={false}>
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
    </View>
  );

  const renderSourceStep = () => (
    <View style={styles.content}>
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
      <ScrollView showsVerticalScrollIndicator={false}>
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
    </View>
  );

  const renderAmountStep = () => (
    <View style={styles.content}>
      <View style={styles.previewCard}>
        <View style={styles.previewRow}>
          <Text variant="body" color={theme.colors.textSecondary}>
            {getCategoryName(selectedOverspent?.categoryId || '')}
          </Text>
          <View style={styles.previewArrows}>
            <Ionicons name="arrow-forward" size={16} color={theme.colors.textMuted} />
          </View>
          <Text variant="body" color={theme.colors.textSecondary}>
            {getCategoryName(selectedSource?.categoryId || '')}
          </Text>
        </View>
        
        <View style={styles.previewAmounts}>
          <View style={styles.previewColumn}>
            <Text variant="caption" color={theme.colors.textMuted}>Antes</Text>
            <Text variant="body" color={theme.colors.textMuted}>
              {formatCurrency(selectedOverspent?.available || 0)}
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color={theme.colors.primary} />
          <View style={styles.previewColumn}>
            <Text variant="caption" color={theme.colors.textMuted}>Después</Text>
            <Text variant="body" color={theme.colors.success}>
              {formatCurrency((selectedOverspent?.available || 0) + transferAmount)}
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
                width: `${maxAmount > 0 ? (transferAmount / maxAmount) * 100 : 0}%` 
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
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      {renderHeader()}
      
      {step === 'select' && renderSelectStep()}
      {step === 'source' && renderSourceStep()}
      {step === 'amount' && renderAmountStep()}

      <View style={{ height: insets.bottom }} />
      
      <SuccessAnimation
        visible={showSuccess}
        message="¡Cubierto!"
        onDismiss={() => setShowSuccess(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
    paddingTop: 16,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 20,
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
});
