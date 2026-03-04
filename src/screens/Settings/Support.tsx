import React from 'react';
import { View, ScrollView, StyleSheet, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Card, Button, Input } from '../../components/atoms';
import { useTheme } from '../../hooks';

interface SupportScreenProps {
  navigation: any;
}

const SupportScreen: React.FC<SupportScreenProps> = ({ navigation }) => {
  const theme = useTheme();

  const handleContact = () => {
    Alert.alert('Gracias', 'Tu mensaje ha sido enviado. Te responderemos en breve.');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:soporte@finx.app');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Card style={styles.section}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Ionicons name="chatbubbles-outline" size={24} color={theme.colors.primary} style={{ marginRight: 8 }} />
          <Text variant="h3">Soporte</Text>
        </View>
        <Text variant="body" color={theme.colors.textSecondary} style={{ marginBottom: 16 }}>
          ¿Tienes alguna pregunta? Nuestro equipo esta aqui para ayudarte.
        </Text>
        <Input placeholder="Escribe tu mensaje..." multiline numberOfLines={4} style={{ height: 100, textAlignVertical: 'top' }} />
        <Button title="Enviar mensaje" onPress={handleContact} variant="primary" fullWidth />
      </Card>

      <Card style={styles.section}>
        <Text variant="h3" style={{ marginBottom: 16 }}>Opciones de contacto</Text>
        <Button title="Enviar email" onPress={handleEmail} variant="outline" fullWidth style={{ marginBottom: 12 }} />
        <Button title="Visitar sitio web" onPress={() => Linking.openURL('https://finx.app')} variant="outline" fullWidth />
      </Card>

      <Card style={styles.section}>
        <Text variant="h3" style={{ marginBottom: 16 }}>Preguntas Frecuentes</Text>
        <View style={styles.faq}>
          <Text variant="body" style={{ fontWeight: '600' }}>¿Mis datos estan seguros?</Text>
          <Text variant="body" color={theme.colors.textSecondary}>Si, usamos encriptacion de grado bancario.</Text>
        </View>
        <View style={[styles.faq, { marginTop: 16 }]}>
          <Text variant="body" style={{ fontWeight: '600' }}>¿Puedo exportar mis datos?</Text>
          <Text variant="body" color={theme.colors.textSecondary}>Si, desde Configuracion puedes exportar.</Text>
        </View>
      </Card>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { margin: 16, marginBottom: 0 },
  faq: {},
});

export default SupportScreen;
