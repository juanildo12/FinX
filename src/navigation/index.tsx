import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks';

import DashboardScreen from '../screens/Dashboard';
import TransactionsScreen from '../screens/Transactions';
import TransactionFormScreen from '../screens/Transactions/TransactionForm';
import CardsScreen from '../screens/Cards';
import CardFormScreen from '../screens/Cards/CardForm';
import GoalsScreen from '../screens/Goals';
import GoalFormScreen from '../screens/Goals/GoalForm';
import DebtFormScreen from '../screens/Goals/DebtForm';
import SettingsScreen from '../screens/Settings';
import CashFlowScreen from '../screens/Settings/CashFlow';
import AlertsScreen from '../screens/Settings/Alerts';
import TaxCouponsScreen from '../screens/Settings/TaxCoupons';
import SupportScreen from '../screens/Settings/Support';
import ConfigurationScreen from '../screens/Settings/Configuration';
import FinancialHealthScreen from '../screens/FinancialHealth';
import CategoriesScreen from '../screens/Categories';
import AccountsScreen from '../screens/Accounts';
import HowAmIDoingScreen from '../screens/Settings/HowAmIDoing';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const DashboardStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardMain" component={DashboardScreen} />
      <Stack.Screen 
        name="TransactionForm" 
        component={TransactionFormScreen}
        options={({ route }: any) => ({ 
          title: route.params?.transaction ? 'Editar Transacción' : 'Nueva Transacción',
          presentation: 'modal'
        })}
      />
    </Stack.Navigator>
  );
};

const TransactionsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#1E293B',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen 
        name="TransactionsList" 
        component={TransactionsScreen}
        options={{ title: 'Transacciones' }}
      />
      <Stack.Screen 
        name="TransactionForm" 
        component={TransactionFormScreen}
        options={({ route }: any) => ({ 
          title: route.params?.transaction ? 'Editar Transacción' : 'Nueva Transacción',
          presentation: 'modal'
        })}
      />
    </Stack.Navigator>
  );
};

const CardsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#1E293B',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen 
        name="CardsList" 
        component={CardsScreen}
        options={{ title: 'Tarjetas' }}
      />
      <Stack.Screen 
        name="CardForm" 
        component={CardFormScreen}
        options={({ route }: any) => ({ 
          title: route.params?.card ? 'Editar Tarjeta' : 'Nueva Tarjeta',
          presentation: 'modal'
        })}
      />
    </Stack.Navigator>
  );
};

const GoalsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#1E293B',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen 
        name="GoalsList" 
        component={GoalsScreen}
        options={{ title: 'Metas y Deudas' }}
      />
      <Stack.Screen 
        name="GoalForm" 
        component={GoalFormScreen}
        options={{ title: 'Nueva Meta', presentation: 'modal' }}
      />
      <Stack.Screen 
        name="DebtForm" 
        component={DebtFormScreen}
        options={{ title: 'Nueva Deuda', presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
};

const SettingsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#1E293B',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen 
        name="SettingsMain" 
        component={SettingsScreen}
        options={{ title: 'Más' }}
      />
      <Stack.Screen 
        name="CashFlow" 
        component={CashFlowScreen}
        options={{ title: 'Flujo de Caja' }}
      />
      <Stack.Screen 
        name="Alerts" 
        component={AlertsScreen}
        options={{ title: 'Alertas' }}
      />
      <Stack.Screen 
        name="TaxCoupons" 
        component={TaxCouponsScreen}
        options={{ title: 'Cupones Fiscales' }}
      />
      <Stack.Screen 
        name="Support" 
        component={SupportScreen}
        options={{ title: 'Soporte' }}
      />
      <Stack.Screen 
        name="Configuration" 
        component={ConfigurationScreen}
        options={{ title: 'Configuración' }}
      />
      <Stack.Screen 
        name="FinancialHealth" 
        component={FinancialHealthScreen}
        options={{ title: 'Salud Financiera' }}
      />
      <Stack.Screen 
        name="HowAmIDoing" 
        component={HowAmIDoingScreen}
        options={{ title: '¿Cómo estoy?' }}
      />
      <Stack.Screen 
        name="Categories" 
        component={CategoriesScreen}
        options={{ title: 'Categorías' }}
      />
      <Stack.Screen 
        name="Accounts" 
        component={AccountsScreen}
        options={{ title: 'Cuentas' }}
      />
      <Stack.Screen 
        name="Cards" 
        component={CardsStack}
        options={{ title: 'Tarjetas' }}
      />
    </Stack.Navigator>
  );
};

export const AppNavigator = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const getTabIcon = (routeName: string, focused: boolean): keyof typeof Ionicons.glyphMap => {
    switch (routeName) {
      case 'Dashboard':
        return focused ? 'home' : 'home-outline';
      case 'TransactionsTab':
        return focused ? 'swap-horizontal' : 'swap-horizontal-outline';
      case 'Cards':
        return focused ? 'card' : 'card-outline';
      case 'Goals':
        return focused ? 'flag' : 'flag-outline';
      case 'Settings':
        return focused ? 'settings' : 'settings-outline';
      default:
        return 'ellipse';
    }
  };

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textMuted,
          tabBarStyle: {
            position: 'absolute',
            backgroundColor: theme.colors.card,
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            height: 75 + (insets.bottom > 0 ? insets.bottom : 12),
            paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
            paddingTop: 8,
            marginHorizontal: 20,
            marginBottom: 16,
            borderRadius: 24,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
            marginTop: 2,
          },
          tabBarIcon: ({ focused, color }) => {
            const iconName = getTabIcon(route.name, focused);
            return (
              <View style={focused ? styles.activeTabContainer : undefined}>
                <Ionicons 
                  name={iconName} 
                  size={24} 
                  color={color}
                  style={focused && styles.activeIcon}
                />
              </View>
            );
          },
        })}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardStack}
          options={{ tabBarLabel: 'Inicio' }}
        />
        <Tab.Screen
          name="TransactionsTab"
          component={TransactionsStack}
          options={{ tabBarLabel: 'Movimientos' }}
        />
        <Tab.Screen
          name="Cards"
          component={CardsStack}
          options={{ tabBarLabel: 'Tarjetas' }}
        />
        <Tab.Screen
          name="Goals"
          component={GoalsStack}
          options={{ tabBarLabel: 'Metas' }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsStack}
          options={{ tabBarLabel: 'Más' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const DummyScreen = () => null;

const styles = StyleSheet.create({
  activeTabContainer: {
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 16,
  },
  activeIcon: {
    transform: [{ scale: 1.1 }],
  },
});
