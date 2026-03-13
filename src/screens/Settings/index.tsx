import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card, Divider } from '../../components/atoms';
import { useTheme, useSync } from '../../hooks';

interface SettingsScreenProps {
  navigation: any;
}

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  color?: string;
}

const SettingItem: React.FC<SettingItemProps> = ({ icon, title, subtitle, onPress, color }) => {
  const theme = useTheme();
  return (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: (color || theme.colors.primary) + '15' }]}>
        <Ionicons name={icon} size={22} color={color || theme.colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text variant="body">{title}</Text>
        {subtitle && <Text variant="caption" color={theme.colors.textMuted}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
    </TouchableOpacity>
  );
};

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { lastSync } = useSync();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.section}>
        <SettingItem icon="heart" title="Salud Financiera" subtitle="Evalua tu capacidad para grandes decisiones" onPress={() => navigation.navigate('FinancialHealth')} color={theme.colors.income} />
        <Divider spacing={0} />
        <SettingItem icon="help-circle" title="¿Cómo estoy?" subtitle="Antigüedad del dinero y más" onPress={() => navigation.navigate('HowAmIDoing')} color={theme.colors.secondary} />
        <Divider spacing={0} />
        <SettingItem icon="card" title="Tarjetas de Credito" subtitle="Gestiona tus tarjetas" onPress={() => navigation.navigate('Cards')} color={theme.colors.secondary} />
        <Divider spacing={0} />
        <SettingItem icon="stats-chart" title="Flujo de Caja" subtitle="Analisis mensual y anual" onPress={() => navigation.navigate('CashFlow')} />
        <Divider spacing={0} />
        <SettingItem icon="notifications" title="Alertas y Recordatorios" subtitle="Gestiona tus notificaciones" onPress={() => navigation.navigate('Alerts')} />
      </Card>

      <Card style={styles.section}>
        <SettingItem icon="albums" title="Plan de Presupuesto" subtitle="Asigna tu dinero a categorías" onPress={() => navigation.navigate('Plan')} color={theme.colors.primary} />
        <Divider spacing={0} />
        <SettingItem icon="receipt" title="Cupones Fiscales" subtitle="Almacena tus comprobantes" onPress={() => navigation.navigate('TaxCoupons')} />
        <Divider spacing={0} />
        <SettingItem icon="pricetag" title="Categorías" subtitle="Gestiona tus categorías" onPress={() => navigation.navigate('Categories')} />
        <Divider spacing={0} />
        <SettingItem icon="wallet" title="Cuentas" subtitle="Gestiona tus cuentas" onPress={() => navigation.navigate('Accounts')} />
        <Divider spacing={0} />
        <SettingItem icon="chatbubbles" title="Soporte" subtitle="Chat de ayuda" onPress={() => navigation.navigate('Support')} />
      </Card>

      <Card style={styles.section}>
        <SettingItem icon="settings" title="Configuracion" subtitle="Tema, moneda, idioma" onPress={() => navigation.navigate('Configuration')} />
      </Card>

      <View style={styles.footer}>
        <Text variant="small" color={theme.colors.textMuted}>Vixo v1.0.0</Text>
        {lastSync && <Text variant="small" color={theme.colors.textMuted}>Ultima sincronizacion: {new Date(lastSync).toLocaleString()}</Text>}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { margin: 16, marginBottom: 0, padding: 0 },
  settingItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  iconContainer: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  settingContent: { flex: 1 },
  chevron: { fontSize: 24, color: '#94A3B8' },
  footer: { alignItems: 'center', padding: 32 },
});

export default SettingsScreen;
