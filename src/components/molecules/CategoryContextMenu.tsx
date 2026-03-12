import React from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../atoms/Text';

interface MenuOption {
  label: string;
  icon: string;
  iconColor?: string;
  onPress: () => void;
  destructive?: boolean;
}

interface CategoryContextMenuProps {
  visible: boolean;
  onClose: () => void;
  categoryName: string;
  categoryColor: string;
  options: MenuOption[];
}

export const CategoryContextMenu: React.FC<CategoryContextMenuProps> = ({
  visible,
  onClose,
  categoryName,
  categoryColor,
  options,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.menuContainer}>
          <View style={styles.header}>
            <View style={[styles.categoryIcon, { backgroundColor: categoryColor }]}>
              <Ionicons name="folder" size={16} color="#FFF" />
            </View>
            <Text variant="body" style={styles.headerTitle}>
              {categoryName}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsContainer}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionItem,
                  index < options.length - 1 && styles.optionBorder
                ]}
                onPress={() => {
                  option.onPress();
                  onClose();
                }}
              >
                <View style={[styles.iconCircle, { backgroundColor: option.iconColor || '#6B7280' }]}>
                  <Ionicons
                    name={option.icon as keyof typeof Ionicons.glyphMap}
                    size={14}
                    color="#FFF"
                  />
                </View>
                <Text
                  variant="body"
                  style={styles.optionLabel}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    width: '85%',
    maxWidth: 320,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: '600',
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  optionsContainer: {
    paddingVertical: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionLabel: {
    color: '#FFFFFF',
    fontSize: 15,
  },
});
