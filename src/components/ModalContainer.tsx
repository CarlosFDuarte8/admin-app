import React from 'react';
import { Modal, View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Text, IconButton, Button, useTheme as usePaperTheme } from 'react-native-paper';
import { useTheme } from '../theme/ThemeContext';

interface ModalContainerProps {
  visible: boolean;
  onDismiss?: () => void;
  title?: string;
  children: React.ReactNode;
  onAction?: () => void;
  actionLabel?: string;
  showAction?: boolean;
  actionIcon?: string;
  actionDisabled?: boolean;
  fullHeight?: boolean;
  rightIcon?: string;
  onRightIconPress?: () => void;
}

const ModalContainer: React.FC<ModalContainerProps> = ({
  visible,
  onDismiss,
  title,
  children,
  onAction,
  actionLabel = 'Confirmar',
  showAction = false,
  actionIcon,
  actionDisabled = false,
  fullHeight = false,
  rightIcon,
  onRightIconPress,
}) => {
  const { theme } = useTheme();
  const paperTheme = usePaperTheme();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onDismiss}
    >
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme.colors.background },
          fullHeight && styles.fullHeight,
        ]}
      >
        <View style={[styles.header, { borderBottomColor: theme.colors.outline }]}>
          <IconButton
            icon="arrow-left"
            size={24}
            iconColor={theme.colors.primary}
            onPress={onDismiss}
          />
          <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
            {title}
          </Text>
          {rightIcon ? (
            <IconButton
              icon={rightIcon}
              size={24}
              iconColor={theme.colors.primary}
              onPress={onRightIconPress}
            />
          ) : (
            <View style={styles.rightPlaceholder} />
          )}
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={
            fullHeight ? styles.contentContainerFullHeight : styles.contentContainer
          }
        >
          {children}
        </ScrollView>

        {showAction && (
          <View style={styles.footer}>
            <Button
              mode="contained"
              onPress={onAction}
              disabled={actionDisabled}
              style={styles.actionButton}
              icon={actionIcon}
            >
              {actionLabel}
            </Button>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fullHeight: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  rightPlaceholder: {
    width: 48, // Mesmo tamanho do IconButton para manter alinhamento
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  contentContainerFullHeight: {
    padding: 16,
    flexGrow: 1,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionButton: {
    borderRadius: 8,
  },
});

export default ModalContainer;