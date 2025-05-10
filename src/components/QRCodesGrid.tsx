import React from 'react';
import { Modal, View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button, Card, IconButton } from 'react-native-paper';
import { useTheme } from '../theme/ThemeContext';

interface QRCodesGridProps {
  data: any[];
  open: boolean;
  onClose: () => void;
  name?: string;
}

const QRCodesGrid: React.FC<QRCodesGridProps> = ({ data, open, onClose, name }) => {
  const { theme, isDarkTheme } = useTheme();

  if (!open) return null;

  return (
    <Modal
      visible={open}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={onClose}
            iconColor={theme.colors.primary}
          />
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            QR Codes - {name || 'Cápsulas'}
          </Text>
          <IconButton
            icon="printer"
            size={24}
            onPress={() => {}}
            iconColor={theme.colors.primary}
          />
        </View>

        <ScrollView style={styles.content}>
          <Text style={[styles.infoText, { color: theme.colors.text }]}>
            Total de QR Codes: {data.length}
          </Text>

          {data.map((item, index) => (
            <Card key={index} style={styles.card}>
              <Card.Content>
                <View style={styles.qrPlaceholder}>
                  <Text style={{ color: theme.colors.text }}>
                    QR Code para:
                  </Text>
                  <Text style={[styles.qrText, { color: theme.colors.text }]}>
                    {item.slot} - {item.name}
                  </Text>
                  <Text style={{ color: theme.colors.text, marginTop: 10 }}>
                    Serial: {item.serialNumber}
                  </Text>
                  <View style={[styles.qrCodeBox, { borderColor: theme.colors.primary }]}>
                    <Text style={{ color: theme.colors.text }}>
                      [QR Code Simulado]
                    </Text>
                    <Text style={{ color: theme.colors.text, fontSize: 12 }}>
                      S/N: {item.serialNumber}
                    </Text>
                    <Text style={{ color: theme.colors.text, fontSize: 12 }}>
                      FID: {item.fragranceId}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>

        <Button 
          mode="contained" 
          onPress={onClose}
          style={styles.closeButton}
        >
          Fechar
        </Button>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
  },
  qrPlaceholder: {
    alignItems: 'center',
    padding: 16,
  },
  qrText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  qrCodeBox: {
    width: 150,
    height: 150,
    borderWidth: 2,
    borderRadius: 8,
    marginTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    margin: 16,
  }
});

export default QRCodesGrid;