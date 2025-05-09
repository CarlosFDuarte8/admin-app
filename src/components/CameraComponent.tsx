import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { CameraView, Camera } from 'expo-camera';

// Define os tipos de câmera como string
type CameraTypeValue = 'front' | 'back';

interface CameraComponentProps {
  isVisible: boolean;
  onClose: () => void;
  onCapture: (data: string) => void;
  mode: 'barcode' | 'photo';
  title?: string;
}

const CameraComponent: React.FC<CameraComponentProps> = ({
  isVisible,
  onClose,
  onCapture,
  mode,
  title = mode === 'barcode' ? 'Escaneie o código QR' : 'Tire uma foto'
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [cameraType, setCameraType] = useState<CameraTypeValue>('back');

  // Solicitar permissão para usar a câmera
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = (scanningResult: any) => {
    if (scanningResult && scanningResult.data) {
      setScanned(true);
      onCapture(scanningResult.data);
    }
  };

  const handleTakePicture = async () => {
    // Esta função precisaria ser implementada para tirar fotos
    // Usaria CameraView.takePictureAsync()
    // Por enquanto, vamos apenas simular com um valor fictício
    onCapture('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCA...');
  };

  const toggleCameraType = () => {
    setCameraType((current: CameraTypeValue) => 
      current === 'back' ? 'front' : 'back'
    );
  };

  const handleScanAgain = () => {
    setScanned(false);
  };

  return (
    <Modal
      visible={isVisible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {hasPermission === null ? (
          <Text>Solicitando permissão de câmera...</Text>
        ) : hasPermission === false ? (
          <Text>Sem acesso à câmera.</Text>
        ) : (
          <>
            <View style={styles.headerContainer}>
              <Text style={styles.headerText}>{title}</Text>
            </View>
            
            <CameraView
              style={styles.camera}
              facing={cameraType}
              onBarcodeScanned={mode === 'barcode' && !scanned ? handleBarCodeScanned : undefined}
              barcodeScannerSettings={mode === 'barcode' ? {
                barcodeTypes: ["qr"],
              } : undefined}
            />
            
            <View style={styles.overlayContainer}>
              {mode === 'barcode' && (
                <View style={styles.scanFrameContainer}>
                  <View style={styles.scanFrame} />
                </View>
              )}
            </View>
            
            <View style={styles.buttonContainer}>
              {mode === 'photo' && (
                <Button 
                  mode="contained" 
                  onPress={handleTakePicture}
                  style={styles.button}
                >
                  Tirar Foto
                </Button>
              )}
              
              {mode === 'barcode' && scanned && (
                <Button 
                  mode="contained" 
                  onPress={handleScanAgain}
                  style={styles.button}
                >
                  Escanear Novamente
                </Button>
              )}
              
              <Button 
                mode="contained" 
                onPress={toggleCameraType}
                style={styles.button}
              >
                Alternar Câmera
              </Button>
              
              <Button 
                mode="contained" 
                onPress={onClose}
                style={[styles.button, styles.closeButton]}
              >
                Fechar
              </Button>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerContainer: {
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  camera: {
    flex: 1,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
  },
  button: {
    marginVertical: 5,
  },
  closeButton: {
    backgroundColor: '#f44336',
  },
});

export default CameraComponent;