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

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textMuted,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: theme.colors.card,
            borderTopColor: theme.colors.border,
            paddingTop: 8,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
            height: 70 + (insets.bottom > 0 ? insets.bottom - 8 : 0),
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            switch (route.name) {
              case 'Dashboard':
                iconName = focused ? 'home' : 'home-outline';
                break;
              case 'TransactionsTab':
                iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
                break;
              case 'Cards':
                iconName = focused ? 'card' : 'card-outline';
                break;
              case 'Goals':
                iconName = focused ? 'flag' : 'flag-outline';
                break;
              case 'Settings':
                iconName = focused ? 'settings' : 'settings-outline';
                break;
              default:
                iconName = 'ellipse';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardStack}
        />
        <Tab.Screen
          name="TransactionsTab"
          component={TransactionsStack}
        />
        <Tab.Screen
          name="Cards"
          component={CardsStack}
        />
        <Tab.Screen
          name="Goals"
          component={GoalsStack}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsStack}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const DummyScreen = () => null;
