import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Card, Divider } from '../../components/atoms';
import { CardItem } from '../../components/molecules';
import { useTheme, useCreditCards } from '../../hooks';
import { CreditCard } from '../../types';

interface CardsScreenProps {
  navigation: any;
}

const CardsScreen: React.FC<CardsScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { creditCards, deleteCreditCard } = useCreditCards();

  const handleDelete = (id: string) => {
    Alert.alert(
      'Eliminar tarjeta',
      '¿Estás seguro de que quieres eliminar esta tarjeta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteCreditCard(id),
        },
      ]
    );
  };

  const renderCard = ({ item }: { item: CreditCard }) => (
    <CardItem
      card={item}
      onPress={() => navigation.navigate('CardForm', { card: item })}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={creditCards}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="h3" color={theme.colors.textMuted}>No hay tarjetas</Text>
            <Text variant="body" color={theme.colors.textMuted} style={{ marginTop: 8 }}>
              Agrega tu primera tarjeta de crédito
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary, bottom: insets.bottom + 20 }]}
        onPress={() => navigation.navigate('CardForm', {})}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
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
});

export default CardsScreen;
