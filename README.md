# FinX - App de Control Financiero Personal

FinX es una aplicación móvil de control financiero personal, desarrollada con React Native y Expo. Permite a los usuarios registrar, organizar y analizar sus finanzas de manera clara y confiable.

## Características

### Funcionalidades Principales
- **Control financiero**: Registro de gastos e ingresos con clasificación por categorías
- **Tarjetas de crédito**: Gestor de tarjetas con seguimiento de límite y consumo
- **Metas financieras**: Seguimiento de objetivos de ahorro
- **Deudas**: Control y seguimiento de préstamos y deudas
- **Flujo de caja**: Gráficos mensuales y anuales
- **Alertas y recordatorios**: Notificaciones de pagos pendientes
- **Cupones fiscales**: Almacenamiento de comprobantes
- **Configuración**: Tema claro/oscuro, moneda, idioma

### Funcionalidades Técnicas
- **Offline-first**: Funciona sin conexión, sincroniza cuando hay red
- **Persistencia local**: Datos guardados localmente con AsyncStorage
- **Datos de ejemplo**: La app incluye datos mock para demo

## Instalación

```bash
# Instalar dependencias
npm install

# Iniciar desarrollo
npm start

# Ejecutar en iOS
npm run ios

# Ejecutar en Android
npm run android
```

## Estructura del Proyecto

```
FinX/
├── src/
│   ├── components/
│   │   ├── atoms/          # Componentes básicos (Button, Card, Text, etc.)
│   │   ├── molecules/      # Componentes compuestos (TransactionItem, CardItem, etc.)
│   │   └── organisms/      # Componentes complejos
│   ├── screens/
│   │   ├── Dashboard/      # Pantalla principal
│   │   ├── Transactions/   # Registro de transacciones
│   │   ├── Cards/          # Gestor de tarjetas
│   │   ├── Goals/          # Metas y deudas
│   │   └── Settings/       # Configuración y extras
│   ├── navigation/         # Navegación Bottom Tabs
│   ├── store/             # Estado global (Zustand)
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Utilidades
│   ├── types/             # Tipos TypeScript
│   ├── constants/         # Constantes
│   ├── theme/             # Tema (claro/oscuro)
│   └── services/          # Datos mock
├── App.tsx
└── app.json
```

## Tecnologías

- **React Native** con **Expo SDK 55**
- **TypeScript**
- **Zustand** para estado global con persistencia
- **React Navigation** (Bottom Tabs + Stack)
- **react-native-chart-kit** para gráficos
- **AsyncStorage** para persistencia offline

## Screenshots

La app incluye:
- Dashboard con resumen financiero y gráfico de gastos
- Lista de transacciones con filtros
- Gestor de tarjetas de crédito
- Metas y deudas con progreso
- Flujo de caja con gráficos
- Configuración con tema oscuro

## Licencia

MIT
