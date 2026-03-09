# AGENTS.md - Vixo Development Guide

This document provides guidance for AI agents working on the Vixo codebase.

## Project Overview

Vixo is a personal finance management mobile app built with React Native + Expo. It features offline-first architecture with Zustand for state management and React Navigation for routing.

## Tech Stack

- **Framework**: React Native with Expo SDK 55
- **Language**: TypeScript (strict mode enabled)
- **State**: Zustand with AsyncStorage persistence
- **Navigation**: React Navigation (Bottom Tabs + Native Stack)
- **Charts**: react-native-chart-kit
- **Testing**: Playwright (devDependencies installed, not yet configured)

---

## Build & Development Commands

### Development
```bash
npm install           # Install dependencies
npm start            # Start Expo dev server
npm run web          # Run web build
npm run android      # Run on Android (requires Android SDK)
npm run ios          # Run on iOS (requires Xcode)
```

### Building
```bash
npx expo export      # Export web build to dist/
npx expo prebuild    # Generate native Android/iOS folders
```

### Testing
> **Note**: No test framework is currently configured. Playwright is in devDependencies but no tests exist yet.

To add tests, create `playwright.config.ts` and test files with `.spec.ts` or `.test.ts` extension.

---

## Code Style Guidelines

### TypeScript
- **Strict mode enabled** in `tsconfig.json`
- Always define prop interfaces with `interface ComponentNameProps`
- Use explicit return types for functions when beneficial
- Prefer `type` for unions/aliases, `interface` for objects

### Naming Conventions
- **Components**: PascalCase (`Button.tsx`, `TransactionItem.tsx`)
- **Files**: lowercase with hyphens for utilities (`financialHealth.ts`)
- **Hooks**: camelCase, prefix with `use` (`useTheme`, `useTransactions`)
- **Types**: PascalCase (`TransactionType`, `ThemeMode`)
- **Constants**: SCREAMING_SNAKE_CASE for config values, PascalCase for categories

### Component Structure

```typescript
// src/components/atoms/Button.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks';
import { Text } from './Text';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  disabled?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  // ... destructure with defaults
}) => {
  const theme = useTheme();
  // ... implementation
};

const styles = StyleSheet.create({
  // ... styles
});
```

### Imports

- Use relative imports for local modules (`./components`, `../../hooks`)
- Use absolute imports for node modules (`react-native`, `zustand`)
- Order imports: React → external libs → internal modules → styles
- Barrel exports via `index.ts` files

### File Organization

```
src/
├── components/
│   ├── atoms/         # Button, Card, Text, Input, etc.
│   ├── molecules/      # TransactionItem, CardItem, etc.
│   └── index.ts       # Barrel export
├── screens/
│   ├── Dashboard/
│   │   ├── index.tsx  # Main screen
│   │   └── components/ # Screen-specific components
│   └── ...
├── navigation/        # Stack and Tab navigators
├── store/            # Zustand store
├── hooks/            # Custom hooks (useTheme, useTransactions, etc.)
├── types/            # TypeScript interfaces/types
├── constants/        # App constants, categories
├── theme/            # Theme definitions (light/dark)
├── utils/            # Helper functions
└── services/         # Mock data, API clients
```

### Zustand Store Patterns

```typescript
// src/store/index.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppState {
  // State
  transactions: Transaction[];
  // Actions
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      transactions: [],
      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [
            { ...transaction, id: `txn_${Date.now()}`, createdAt: new Date().toISOString() },
            ...state.transactions,
          ],
        })),
      // ... more actions
    }),
    { name: 'vixo-storage', storage: createJSONStorage(() => AsyncStorage) }
  )
);
```

### Custom Hooks Pattern

```typescript
// src/hooks/index.ts
export const useTransactions = () => {
  const transactions = useAppStore((state) => state.transactions);
  const addTransaction = useAppStore((state) => state.addTransaction);
  // ...
  return { transactions, addTransaction, /* ... */ };
};
```

### Error Handling

- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Validate inputs in forms with local state
- Display errors inline below form fields via `error` prop
- Use try/catch for async operations

### Theme Usage

```typescript
const theme = useTheme();
// Access: theme.colors.primary, theme.spacing.md, theme.borderRadius.lg
```

### ID Generation

Use timestamp-based IDs: `${prefix}_${Date.now()}`
- Transactions: `txn_`
- Cards: `card_`
- Goals: `goal_`
- Debts: `debt_`
- Alerts: `alert_`

### Voice Input Feature

The app supports voice-to-text for quick transaction entry using Web Speech API.

**Components:**
- `src/components/molecules/VoiceInputButton.tsx` - Microphone button with animation
- `src/hooks/useVoiceRecognition.ts` - Web Speech API hook
- `src/utils/voiceParser.ts` - Spanish voice parser

**Usage:**
```typescript
import { VoiceInputButton } from '../components/molecules';
import { parseVoiceTransaction } from '../utils';

// Voice button in component
<VoiceInputButton 
  onTranscript={(text) => {
    const parsed = parseVoiceTransaction(text);
    // parsed.amount, parsed.category, parsed.description, parsed.type
  }} 
/>
```

**Supported voice commands (Spanish):**
- "gasté 50 pesos en comida" → expense, 50, food
- "pagué 25 dólares en transporte" → expense, 25, transport
- "ingreso de 1000 pesos salary" → income, 1000, salary

Note: Voice recognition works on web browsers. Mobile requires native modules for full support.

### UI Patterns

- Border radius: 12px for cards/buttons, 8px for inputs
- Spacing scale: 4, 8, 16, 24, 32, 48
- Colors: Use theme colors, avoid hardcoded values except brand colors
- Primary: `#10B981` (green), Secondary: `#3B82F6` (blue)

---

## Important Notes

1. **Language**: UI text is in Spanish (`Transacciones`, `Metas`, `Configuración`)
2. **Web Support**: App supports web via `react-native-web`
3. **Persistence**: Data persists via AsyncStorage (web uses localStorage)
4. **No ESLint/Prettier**: Not configured - code should remain consistent with existing style
5. **Mock Data**: `src/services/mockData.ts` contains demo data loaded on first run
