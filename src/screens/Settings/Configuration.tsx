import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Switch, TouchableOpacity, Alert, Modal, Pressable, TextInput } from 'react-native';
import { Text, Card, Divider } from '../../components/atoms';
import { useTheme, useSettings, useSync } from '../../hooks';

const ALL_CURRENCIES = [
  { code: 'USD', name: 'Dólar estadounidense', symbol: '$', country: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', country: '🇪🇺' },
  { code: 'GBP', name: 'Libra esterlina', symbol: '£', country: '🇬🇧' },
  { code: 'JPY', name: 'Yen japonés', symbol: '¥', country: '🇯🇵' },
  { code: 'CNY', name: 'Yuan chino', symbol: '¥', country: '🇨🇳' },
  { code: 'ARS', name: 'Peso argentino', symbol: '$', country: '🇦🇷' },
  { code: 'MXN', name: 'Peso mexicano', symbol: '$', country: '🇲🇽' },
  { code: 'CLP', name: 'Peso chileno', symbol: '$', country: '🇨🇱' },
  { code: 'BRL', name: 'Real brasileño', symbol: 'R$', country: '🇧🇷' },
  { code: 'COP', name: 'Peso colombiano', symbol: '$', country: '🇨🇴' },
  { code: 'PEN', name: 'Sol peruano', symbol: 'S/', country: '🇵🇪' },
  { code: 'UYU', name: 'Peso uruguayo', symbol: '$', country: '🇺🇾' },
  { code: 'PYG', name: 'Guaraní paraguayo', symbol: '₲', country: '🇵🇾' },
  { code: 'BOB', name: 'Boliviano', symbol: 'Bs', country: '🇧🇴' },
  { code: 'VES', name: 'Bolívar venezolano', symbol: 'Bs', country: '🇻🇪' },
  { code: 'DOP', name: 'Peso dominicano', symbol: 'RD$', country: '🇩🇴' },
  { code: 'CAD', name: 'Dólar canadiense', symbol: '$', country: '🇨🇦' },
  { code: 'AUD', name: 'Dólar australiano', symbol: '$', country: '🇦🇺' },
  { code: 'CHF', name: 'Franco suizo', symbol: 'Fr', country: '🇨🇭' },
  { code: 'KRW', name: 'Won surcoreano', symbol: '₩', country: '🇰🇷' },
  { code: 'INR', name: 'Rupia india', symbol: '₹', country: '🇮🇳' },
  { code: 'RUB', name: 'Rublo ruso', symbol: '₽', country: '🇷🇺' },
  { code: 'ZAR', name: 'Rand sudafricano', symbol: 'R', country: '🇿🇦' },
  { code: 'SGD', name: 'Dólar singapurense', symbol: '$', country: '🇸🇬' },
  { code: 'HKD', name: 'Dólar hongkonés', symbol: '$', country: '🇭🇰' },
  { code: 'SEK', name: 'Corona sueca', symbol: 'kr', country: '🇸🇪' },
  { code: 'NOK', name: 'Corona noruega', symbol: 'kr', country: '🇳🇴' },
  { code: 'DKK', name: 'Corona danesa', symbol: 'kr', country: '🇩🇰' },
  { code: 'NZD', name: 'Dólar neozelandés', symbol: '$', country: '🇳🇿' },
  { code: 'AED', name: 'Dírham emiratí', symbol: 'د.إ', country: '🇦🇪' },
  { code: 'SAR', name: 'Riyal saudí', symbol: '﷼', country: '🇸🇦' },
  { code: 'TRY', name: 'Lira turca', symbol: '₺', country: '🇹🇷' },
  { code: 'PLN', name: 'Zloty polaco', symbol: 'zł', country: '🇵🇱' },
  { code: 'THB', name: 'Baht tailandés', symbol: '฿', country: '🇹🇭' },
  { code: 'PHP', name: 'Peso filipino', symbol: '₱', country: '🇵🇭' },
  { code: 'IDR', name: 'Rupia indonesia', symbol: 'Rp', country: '🇮🇩' },
  { code: 'MYR', name: 'Ringgit malayo', symbol: 'RM', country: '🇲🇾' },
  { code: 'VND', name: 'Dong vietnamita', symbol: '₫', country: '🇻🇳' },
];

interface ConfigurationScreenProps {
  navigation: any;
}

const ConfigurationScreen: React.FC<ConfigurationScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const { settings, updateSettings, setTheme } = useSettings();
  const { lastSync, syncNow } = useSync();
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');
  const [showThousandModal, setShowThousandModal] = useState(false);
  const [showDecimalModal, setShowDecimalModal] = useState(false);

  const toggleTheme = () => {
    setTheme(theme.mode === 'light' ? 'dark' : 'light');
  };

  const handleSync = () => {
    syncNow();
    Alert.alert('Sincronizado', 'Tus datos han sido sincronizados');
  };

  const selectedCurrency = ALL_CURRENCIES.find(c => c.code === settings.currency) || ALL_CURRENCIES[0];

  const filteredCurrencies = ALL_CURRENCIES.filter(c => 
    c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
    c.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
    c.country.toLowerCase().includes(currencySearch.toLowerCase())
  );

  const handleCurrencyChange = (currencyCode: string) => {
    if (currencyCode === settings.currency) {
      setShowCurrencyModal(false);
      setCurrencySearch('');
      return;
    }

    Alert.alert(
      'Cambiar moneda',
      `¿Estás seguro de cambiar a ${ALL_CURRENCIES.find(c => c.code === currencyCode)?.name}? A partir de ahora, todos los nuevos registros y valores se mostrarán en ${ALL_CURRENCIES.find(c => c.code === currencyCode)?.code}. Las transacciones anteriores mantendrán su valor original.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cambiar',
          onPress: () => {
            updateSettings({ currency: currencyCode });
            setShowCurrencyModal(false);
            setCurrencySearch('');
            Alert.alert('Éxito', `Moneda cambiada a ${ALL_CURRENCIES.find(c => c.code === currencyCode)?.name}. Los nuevos valores se mostrarán en esta moneda.`);
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.section}>
        <Text variant="h3" style={{ marginBottom: 16 }}>Apariencia</Text>
        <View style={styles.row}>
          <View>
            <Text variant="body">Modo oscuro</Text>
            <Text variant="caption" color={theme.colors.textMuted}>Cambiar entre claro y oscuro</Text>
          </View>
          <Switch value={theme.mode === 'dark'} onValueChange={toggleTheme} trackColor={{ true: theme.colors.primary }} />
        </View>
      </Card>

      <Card style={styles.section}>
        <Text variant="h3" style={{ marginBottom: 16 }}>Preferencias</Text>
        <View style={styles.row}>
          <View>
            <Text variant="body">Moneda</Text>
            <Text variant="caption" color={theme.colors.textMuted}>{selectedCurrency.country} {selectedCurrency.code} - {selectedCurrency.name}</Text>
          </View>
          <TouchableOpacity onPress={() => setShowCurrencyModal(true)}><Text variant="body" color={theme.colors.primary}>Cambiar</Text></TouchableOpacity>
        </View>
        <Divider spacing={12} />
        <View style={styles.row}>
          <View>
            <Text variant="body">Idioma</Text>
            <Text variant="caption" color={theme.colors.textMuted}>{settings.language === 'es' ? 'Español' : 'English'}</Text>
          </View>
          <TouchableOpacity><Text variant="body" color={theme.colors.primary}>Cambiar</Text></TouchableOpacity>
        </View>
        <Divider spacing={12} />
        <View style={styles.row}>
          <View>
            <Text variant="body">Separador de miles</Text>
            <Text variant="caption" color={theme.colors.textMuted}>{settings.thousandSeparator === '.' ? 'Punto (.)' : settings.thousandSeparator === ',' ? 'Coma (,)' : settings.thousandSeparator}</Text>
          </View>
          <TouchableOpacity onPress={() => setShowThousandModal(true)}><Text variant="body" color={theme.colors.primary}>Cambiar</Text></TouchableOpacity>
        </View>
        <Divider spacing={12} />
        <View style={styles.row}>
          <View>
            <Text variant="body">Separador de decimales</Text>
            <Text variant="caption" color={theme.colors.textMuted}>{settings.decimalSeparator === ',' ? 'Coma (.)' : settings.decimalSeparator === '.' ? 'Punto (.)' : settings.decimalSeparator}</Text>
          </View>
          <TouchableOpacity onPress={() => setShowDecimalModal(true)}><Text variant="body" color={theme.colors.primary}>Cambiar</Text></TouchableOpacity>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text variant="h3" style={{ marginBottom: 16 }}>Notificaciones</Text>
        <View style={styles.row}>
          <View>
            <Text variant="body">Notificaciones push</Text>
            <Text variant="caption" color={theme.colors.textMuted}>Recibe alertas en tu dispositivo</Text>
          </View>
          <Switch value={settings.notificationsEnabled} onValueChange={(v) => updateSettings({ notificationsEnabled: v })} trackColor={{ true: theme.colors.primary }} />
        </View>
        <Divider spacing={12} />
        <View style={styles.row}>
          <View>
            <Text variant="body">Notificaciones por email</Text>
            <Text variant="caption" color={theme.colors.textMuted}>Resumen semanal por correo</Text>
          </View>
          <Switch value={settings.emailNotifications} onValueChange={(v) => updateSettings({ emailNotifications: v })} trackColor={{ true: theme.colors.primary }} />
        </View>
      </Card>

      <Card style={styles.section}>
        <Text variant="h3" style={{ marginBottom: 16 }}>Sincronización</Text>
        <View style={styles.row}>
          <View>
            <Text variant="body">Sincronizar ahora</Text>
            <Text variant="caption" color={theme.colors.textMuted}>{lastSync ? `Última: ${new Date(lastSync).toLocaleString()}` : 'Nunca sincronizado'}</Text>
          </View>
          <TouchableOpacity onPress={handleSync}><Text variant="body" color={theme.colors.primary}>Sincronizar</Text></TouchableOpacity>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text variant="h3" style={{ marginBottom: 16 }}>Datos</Text>
        <TouchableOpacity style={styles.row} onPress={() => Alert.alert('Exportar', 'Función de exportar datos')}>
          <Text variant="body">Exportar datos</Text>
          <Text variant="body" color={theme.colors.primary}>→</Text>
        </TouchableOpacity>
        <Divider spacing={12} />
        <TouchableOpacity style={styles.row} onPress={() => Alert.alert('Restablecer', '¿Estás seguro? Esto eliminará todos tus datos.', [{ text: 'Cancelar' }, { text: 'Restablecer', style: 'destructive', onPress: () => {} }])}>
          <Text variant="body" color={theme.colors.error}>Restablecer datos</Text>
          <Text variant="body" color={theme.colors.error}>→</Text>
        </TouchableOpacity>
      </Card>

      <View style={{ height: 32 }} />

      <Modal visible={showCurrencyModal} transparent animationType="slide" onRequestClose={() => { setShowCurrencyModal(false); setCurrencySearch(''); }}>
        <Pressable style={styles.modalOverlay} onPress={() => { setShowCurrencyModal(false); setCurrencySearch(''); }}>
          <Pressable style={[styles.modalContent, { backgroundColor: theme.colors.card }]} onPress={() => {}}>
            <Text variant="h3" style={{ marginBottom: 16, textAlign: 'center' }}>Seleccionar Moneda</Text>
            <TextInput
              style={[styles.searchInput, { backgroundColor: theme.colors.surface, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
              placeholder="Buscar moneda..."
              placeholderTextColor={theme.colors.textMuted}
              value={currencySearch}
              onChangeText={setCurrencySearch}
              autoCapitalize="none"
            />
            <ScrollView style={{ maxHeight: 350 }}>
              {filteredCurrencies.length === 0 ? (
                <Text variant="body" color={theme.colors.textMuted} style={{ textAlign: 'center', paddingVertical: 20 }}>No se encontraron monedas</Text>
              ) : (
                filteredCurrencies.map((currency) => (
                  <TouchableOpacity
                    key={currency.code}
                    style={[styles.currencyRow, settings.currency === currency.code && { backgroundColor: theme.colors.primary + '20' }]}
                    onPress={() => handleCurrencyChange(currency.code)}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text variant="body" style={{ fontSize: 20 }}>{currency.country}</Text>
                      <View>
                        <Text variant="body" style={{ fontWeight: '600' }}>{currency.code}</Text>
                        <Text variant="caption" color={theme.colors.textMuted}>{currency.name}</Text>
                      </View>
                    </View>
                    {settings.currency === currency.code && (
                      <Text variant="body" color={theme.colors.primary}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            <TouchableOpacity style={[styles.closeButton, { backgroundColor: theme.colors.primary }]} onPress={() => { setShowCurrencyModal(false); setCurrencySearch(''); }}>
              <Text variant="body" color="#FFFFFF">Cerrar</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={showThousandModal} transparent animationType="slide" onRequestClose={() => setShowThousandModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowThousandModal(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: theme.colors.card }]} onPress={() => {}}>
            <Text variant="h3" style={{ marginBottom: 16, textAlign: 'center' }}>Separador de Miles</Text>
            {[
              { value: '.', label: 'Punto (.) - Ej: 1.234,56' },
              { value: ',', label: 'Coma (,) - Ej: 1,234.56' },
              { value: ' ', label: 'Espacio ( ) - Ej: 1 234,56' },
            ].map((sep) => (
              <TouchableOpacity
                key={sep.value}
                style={[styles.currencyRow, settings.thousandSeparator === sep.value && { backgroundColor: theme.colors.primary + '20' }]}
                onPress={() => { updateSettings({ thousandSeparator: sep.value }); setShowThousandModal(false); }}
              >
                <Text variant="body">{sep.label}</Text>
                {settings.thousandSeparator === sep.value && <Text variant="body" color={theme.colors.primary}>✓</Text>}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.closeButton, { backgroundColor: theme.colors.primary }]} onPress={() => setShowThousandModal(false)}>
              <Text variant="body" color="#FFFFFF">Cerrar</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={showDecimalModal} transparent animationType="slide" onRequestClose={() => setShowDecimalModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowDecimalModal(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: theme.colors.card }]} onPress={() => {}}>
            <Text variant="h3" style={{ marginBottom: 16, textAlign: 'center' }}>Separador de Decimales</Text>
            {[
              { value: ',', label: 'Coma (,) - Ej: 1.234,56' },
              { value: '.', label: 'Punto (.) - Ej: 1,234.56' },
            ].map((sep) => (
              <TouchableOpacity
                key={sep.value}
                style={[styles.currencyRow, settings.decimalSeparator === sep.value && { backgroundColor: theme.colors.primary + '20' }]}
                onPress={() => { updateSettings({ decimalSeparator: sep.value }); setShowDecimalModal(false); }}
              >
                <Text variant="body">{sep.label}</Text>
                {settings.decimalSeparator === sep.value && <Text variant="body" color={theme.colors.primary}>✓</Text>}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.closeButton, { backgroundColor: theme.colors.primary }]} onPress={() => setShowDecimalModal(false)}>
              <Text variant="body" color="#FFFFFF">Cerrar</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { margin: 16, marginBottom: 0 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '70%' },
  searchInput: { height: 48, borderRadius: 12, paddingHorizontal: 16, marginBottom: 12, borderWidth: 1 },
  currencyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8, borderRadius: 8 },
  closeButton: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16 },
});

export default ConfigurationScreen;
