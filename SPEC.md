# FinX - Especificación del Proyecto

## 1. Información General

**Nombre:** FinX  
**Tipo:** Aplicación móvil de control financiero personal  
**Plataformas:** iOS y Android (Expo - React Native)  
**Estado:** Producción-ready (extensible)

---

## 2. Stack Tecnológico

- **Framework:** React Native con Expo SDK 52
- **Lenguaje:** TypeScript
- **Navegación:** @react-navigation/native con Bottom Tabs
- **Estado:** Zustand con persistencia local (AsyncStorage)
- **Gráficos:** react-native-chart-kit
- **UI:** Componentes personalizados con React Native core
- **Almacenamiento:** AsyncStorage para offline-first
- **Notificaciones:** expo-notifications
- **Correo:** expo-mail-composer

---

## 3. Paleta de Colores

### Modo Claro
| Elemento | Color | Hex |
|----------|-------|-----|
| Primary | Verde Esperanza | #10B981 |
| Primary Dark | Verde Oscuro | #059669 |
| Secondary | Azul Confianza | #3B82F6 |
| Background | Blanco Puro | #FFFFFF |
| Surface | Gris Claro | #F8FAFC |
| Card | Blanco | #FFFFFF |
| Text Primary | Gris Oscuro | #1E293B |
| Text Secondary | Gris Medio | #64748B |
| Text Muted | Gris Claro | #94A3B8 |
| Success | Verde | #22C55E |
| Warning | Amarillo | #F59E0B |
| Error | Rojo | #EF4444 |
| Border | Gris Borde | #E2E8F0 |

### Modo Oscuro
| Elemento | Color | Hex |
|----------|-------|-----|
| Primary | Verde Esperanza | #10B981 |
| Primary Dark | Verde Oscuro | #059669 |
| Secondary | Azul Confianza | #3B82F6 |
| Background | Gris Muy Oscuro | #0F172A |
| Surface | Gris Oscuro | #1E293B |
| Card | Gris Oscuro | #1E293B |
| Text Primary | Blanco | #F8FAFC |
| Text Secondary | Gris Claro | #94A3B8 |
| Text Muted | Gris Medio | #64748B |
| Success | Verde | #22C55E |
| Warning | Amarillo | #F59E0B |
| Error | Rojo | #EF4444 |
| Border | Gris Borde | #334155 |

---

## 4. Tipografía

- **Familia:** System default (San Francisco en iOS, Roboto en Android)
- **Títulos (H1):** 28px, Bold, Letter-spacing: -0.5
- **Títulos (H2):** 24px, SemiBold, Letter-spacing: -0.3
- **Títulos (H3):** 20px, SemiBold
- **Body Large:** 17px, Regular
- **Body:** 15px, Regular
- **Caption:** 13px, Regular
- **Small:** 11px, Regular

---

## 5. Estructura de Navegación

### Bottom Tabs (5 pestañas)
1. **Dashboard** - Inicio con resumen financiero
2. **Transacciones** - Registro y gestión de transacciones
3. **Tarjetas** - Gestor de tarjetas de crédito
4. **Metas** - Objetivos financieros y deudas
5. **Más** - Configuración, alertas, flujo de caja

### Stack de Navegación por Tab
```
Dashboard
├── Resumen financiero
├── Gráfico Gastos vs Ingresos
├── Alertas pendientes
└── Quick Actions

Transacciones
├── Lista de transacciones
├── Filtros (fecha, categoría, tipo)
├── Agregar transacción
└── Detalle de transacción

Tarjetas
├── Lista de tarjetas
├── Agregar tarjeta
├── Detalle de tarjeta
└── Seguimiento de consumo

Metas
├── Metas financieras
├── Deudas
├── Presupuestos
└── Agregar meta/deuda

Más (Ajustes)
├── Flujo de caja
├── Alertas y recordatorios
├── Cupones fiscales
├── Soporte chat
├── Configuración
└── Sincronización
```

---

## 6. Modelos de Datos

### Transacción
```typescript
interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  tags: string[];
  date: string; // ISO 8601
  paymentMethod: 'cash' | 'card' | 'bank_transfer';
  cardId?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Tarjeta de Crédito
```typescript
interface CreditCard {
  id: string;
  name: string;
  lastFourDigits: string;
  limit: number;
  currentBalance: number;
  dueDate: string;
  closingDate: string;
  brand: 'visa' | 'mastercard' | 'amex' | 'other';
  color: string;
  createdAt: string;
}
```

### Meta Financiera
```typescript
interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  deadline: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
}
```

### Deuda
```typescript
interface Debt {
  id: string;
  name: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
  monthlyPayment: number;
  dueDate: string;
  creditor: string;
  status: 'active' | 'paid';
  createdAt: string;
}
```

### Alerta
```typescript
interface Alert {
  id: string;
  title: string;
  description: string;
  type: 'payment' | 'budget' | 'goal' | 'debt';
  dueDate: string;
  isCompleted: boolean;
  notifyPush: boolean;
  notifyEmail: boolean;
  createdAt: string;
}
```

### Presupuesto
```typescript
interface Budget {
  id: string;
  category: string;
  amount: number;
  spent: number;
  month: string; // YYYY-MM
  createdAt: string;
}
```

### Cupón Fiscal
```typescript
interface TaxCoupon {
  id: string;
  vendor: string;
  amount: number;
  date: string;
  category: string;
  notes: string;
  imageUri?: string;
  createdAt: string;
}
```

---

## 7. Componentes Reutilizables

### Atoms
- **Button** - Botón primario, secundario, texto
- **Input** - Campo de texto con validación
- **Card** - Contenedor con sombra
- **Badge** - Etiqueta para categorías
- **IconButton** - Botón de icono
- **Text** - Tipografía predefinida
- **Divider** - Línea separadora
- **Avatar** - Imagen de perfil
- **Loading** - Indicador de carga

### Molecules
- **TransactionItem** - Item de transacción en lista
- **CardItem** - Item de tarjeta de crédito
- **GoalItem** - Item de meta financiera
- **AlertItem** - Item de alerta
- **BudgetProgress** - Progress de presupuesto
- **CategoryPicker** - Selector de categoría
- **AmountInput** - Input de monto con formato

### Organisms
- **TransactionForm** - Formulario de transacción
- **CardForm** - Formulario de tarjeta
- **GoalForm** - Formulario de meta
- **FilterModal** - Modal de filtros
- **SummaryCard** - Tarjeta de resumen

---

## 8. Pantallas Principales

### Dashboard
- Saldo total del mes
- Ingresos del mes
- Gastos del mes
- Gráfico circular de gastos por categoría
- Lista de últimas transacciones (5)
- Alertas pendientes (3)
- Quick action: Agregar transacción

### Transacciones
- Header con filtros (mes, categoría, tipo)
- Lista agrupada por fecha
- Pull to refresh
- FAB para agregar
- Swipe para editar/eliminar
- Búsqueda

### Tarjetas
- Lista de tarjetas con estado
- Indicador de uso vs límite
- Próxima fecha de cierre
- Próxima fecha de pago
- Agregar nueva tarjeta

### Metas
- Tabs: Metas | Deudas | Presupuestos
- Progress bars de avance
- Estado de cada elemento
- Agregar/editar/eliminar

### Flujo de Caja (en "Más")
- Selector de mes/año
- Gráfico de línea mensual
- Resumen de entradas/salidas
- Comparativa anual

### Alertas (en "Más")
- Lista de alertas
- Estados: pendientes, completadas
- Configuración de notificaciones

### Configuración (en "Más")
- Perfil de usuario
- Preferencias (moneda, idioma)
- Tema (claro/oscuro)
- Notificaciones
- Sincronización
- Cupones fiscales
- Soporte

---

## 9. Funcionalidades Clave

### Registro de Transacciones
- Selección de tipo (ingreso/gasto)
- Monto con teclado numérico
- Descripción opcional
- Categoría obligatoria
- Tags opcionales
- Fecha (default: hoy)
- Método de pago

### Clasificación
- Categorías predefinidas:
  - **Ingresos:** Salario, Inversión, Regalo, Otros
  - **Gastos:** Alimentación, Transporte, Vivienda, Servicios, Entretenimiento, Salud, Educación, Compras, Otros

### Extracto Mensual
- Total por categoría
- Comparación con mes anterior
- Porcentaje del presupuesto

### Seguimiento de Tarjetas
- Registro de límite
- Registro de factura actual
- Alertas de proximidad a límite
- Recordatorios de pago

### Metas y Deudas
- Crear meta con deadline
- Registrar pagos parciales
- Calcular tiempo restante
- Alertar si no hay progreso

### Flujo de Caja
- Vista mensual y anual
- Proyección basada en patrones
- Detalle de cada mes

### Alertas
- Configurar recordatorios
- Notificaciones push locales
- Envío por email (simulado)

---

## 10. Criterios de Calidad

- Offline-first: Todo funciona sin conexión
- Sincronización: Cuando hay red, sincroniza
- Validaciones: Todos los formularios validados
- Estados vacíos: UI apropiada cuando no hay datos
- Loading states: Indicadores durante cargas
- Error handling: Mensajes claros en errores
- Accesibilidad: Contraste AA, touch targets 44px+

---

## 11. Datos Mock (Demo)

La app incluirá datos de ejemplo para demostrar funcionalidad:
- 10 transacciones de ejemplo
- 2 tarjetas de crédito
- 3 metas financieras
- 2 deudas
- 5 alertas

---

## 12. Ejecución del Proyecto

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

---

## 13. Estructura de Archivos

```
FinX/
├── src/
│   ├── components/
│   │   ├── atoms/
│   │   ├── molecules/
│   │   └── organisms/
│   ├── screens/
│   │   ├── Dashboard/
│   │   ├── Transactions/
│   │   ├── Cards/
│   │   ├── Goals/
│   │   └── Settings/
│   ├── navigation/
│   ├── store/
│   ├── services/
│   ├── hooks/
│   ├── utils/
│   ├── types/
│   ├── constants/
│   └── theme/
├── App.tsx
└── app.json
```
