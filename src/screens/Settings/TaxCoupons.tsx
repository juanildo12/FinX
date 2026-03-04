import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, Card } from '../../components/atoms';
import { useTheme, useTaxCoupons, useCurrency } from '../../hooks';
import { TaxCoupon } from '../../types';
import { formatDate } from '../../utils';

interface TaxCouponsScreenProps {
  navigation: any;
}

const TaxCouponsScreen: React.FC<TaxCouponsScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { taxCoupons } = useTaxCoupons();
  const { formatCurrency } = useCurrency();

  const totalAmount = taxCoupons.reduce((sum, c) => sum + c.amount, 0);

  const renderCoupon = ({ item }: { item: TaxCoupon }) => (
    <Card style={styles.couponCard}>
      <View style={styles.couponHeader}>
        <Text variant="body" style={{ fontWeight: '600' }}>{item.vendor}</Text>
        <Text variant="body" color={theme.colors.primary} style={{ fontWeight: '600' }}>{formatCurrency(item.amount)}</Text>
      </View>
      <View style={styles.couponDetails}>
        <Text variant="caption" color={theme.colors.textMuted}>{item.category}</Text>
        <Text variant="caption" color={theme.colors.textMuted}>{formatDate(item.date)}</Text>
      </View>
      {item.notes && <Text variant="body" style={{ marginTop: 8 }}>{item.notes}</Text>}
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {taxCoupons.length > 0 && (
        <Card style={styles.summaryCard}>
          <Text variant="caption" color={theme.colors.textMuted}>Total en cupones</Text>
          <Text variant="h2" color={theme.colors.primary}>{formatCurrency(totalAmount)}</Text>
          <Text variant="small" color={theme.colors.textMuted}>{taxCoupons.length} comprobantes</Text>
        </Card>
      )}

      <FlatList
        data={taxCoupons}
        renderItem={renderCoupon}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="h3" color={theme.colors.textMuted}>No hay cupones</Text>
            <Text variant="body" color={theme.colors.textMuted} style={{ marginTop: 8, textAlign: 'center' }}>Guarda tus comprobantes fiscales para deducciones</Text>
          </View>
        }
      />

      <TouchableOpacity style={[styles.fab, { backgroundColor: theme.colors.primary }]} onPress={() => Alert.alert('Próximamente', 'Función de agregar cupones')}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  summaryCard: { margin: 16, marginBottom: 0 },
  list: { padding: 16 },
  couponCard: { marginBottom: 12 },
  couponHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  couponDetails: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  empty: { alignItems: 'center', paddingTop: 60 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  fabIcon: { fontSize: 32, color: '#FFFFFF', lineHeight: 34 },
});

export default TaxCouponsScreen;
