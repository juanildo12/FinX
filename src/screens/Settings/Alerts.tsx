import React, { useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Button } from '../../components/atoms';
import { AlertItem } from '../../components/molecules';
import { useTheme, useAlerts } from '../../hooks';
import { Alert as AlertType } from '../../types';

interface AlertsScreenProps {
  navigation: any;
}

const AlertsScreen: React.FC<AlertsScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { alerts, completeAlert, deleteAlert } = useAlerts();
  const [filter, setFilter] = useState<'pending' | 'completed'>('pending');

  const filteredAlerts = alerts.filter((a) => filter === 'pending' ? !a.isCompleted : a.isCompleted);

  const handleComplete = (id: string) => {
    completeAlert(id);
  };

  const renderAlert = ({ item }: { item: AlertType }) => (
    <AlertItem alert={item} onPress={() => {}} />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, { backgroundColor: filter === 'pending' ? theme.colors.primary : theme.colors.surface }]} onPress={() => setFilter('pending')}>
          <Text variant="body" color={filter === 'pending' ? '#FFFFFF' : theme.colors.textSecondary}>Pendientes ({alerts.filter((a) => !a.isCompleted).length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, { backgroundColor: filter === 'completed' ? theme.colors.primary : theme.colors.surface }]} onPress={() => setFilter('completed')}>
          <Text variant="body" color={filter === 'completed' ? '#FFFFFF' : theme.colors.textSecondary}>Completadas ({alerts.filter((a) => a.isCompleted).length})</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredAlerts}
        renderItem={renderAlert}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="h3" color={theme.colors.textMuted}>{filter === 'pending' ? 'No hay alertas pendientes' : 'No hay alertas completadas'}</Text>
          </View>
        }
      />

      <TouchableOpacity style={[styles.fab, { backgroundColor: theme.colors.primary }]} onPress={() => Alert.alert('Próximamente', 'Función de agregar alertas')}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabs: { flexDirection: 'row', padding: 16, gap: 12 },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  list: { padding: 16, paddingTop: 0 },
  empty: { alignItems: 'center', paddingTop: 60 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  fabIcon: { fontSize: 32, color: '#FFFFFF', lineHeight: 34 },
});

export default AlertsScreen;
