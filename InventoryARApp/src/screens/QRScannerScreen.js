import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Vibration,
  Dimensions,
  SafeAreaView,
  StatusBar,
  BackHandler
} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

const QRScannerScreen = ({ navigation }) => {
  const [scanning, setScanning] = useState(true);
  const [flashOn, setFlashOn] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    // Manejar botón de regreso de Android
    const backAction = () => {
      if (scannedData) {
        reactivateScanner();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [scannedData]);

  const onSuccess = (e) => {
    if (!scanning) return; // Evitar múltiples escaneos

    console.log('QR Code detected:', e.data);
    
    // Vibrar para confirmar escaneo
    Vibration.vibrate([100, 50, 100]);
    
    setScanning(false);
    setScannedData(e.data);
    
    // Mostrar opciones al usuario
    showScanOptions(e.data);
  };

  const showScanOptions = (qrData) => {
    Alert.alert(
      '📱 Código QR Detectado',
      `Código: ${qrData}\n\n¿Qué deseas hacer?`,
      [
        {
          text: '❌ Cancelar',
          onPress: reactivateScanner,
          style: 'cancel'
        },
        {
          text: '📋 Ver Detalle',
          onPress: () => {
            navigation.navigate('InventoryDetail', { 
              qrCode: qrData,
              itemName: `Producto ${qrData}`
            });
          }
        },
        {
          text: '🥽 Ver en AR',
          onPress: () => {
            navigation.navigate('ARInventory', { 
              qrCode: qrData 
            });
          },
          style: 'default'
        }
      ],
      { cancelable: false }
    );
  };

  const toggleFlash = () => {
    setFlashOn(!flashOn);
  };

  const reactivateScanner = () => {
    setScanning(true);
    setScannedData(null);
    if (scannerRef.current) {
      scannerRef.current.reactivate();
    }
  };

  const onError = (error) => {
    console.error('QR Scanner Error:', error);
    Alert.alert(
      'Error de Cámara',
      'No se pudo acceder a la cámara. Verifica los permisos.',
      [
        { 
          text: 'Reintentar', 
          onPress: reactivateScanner 
        },
        {
          text: 'Volver',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <QRCodeScanner
        ref={scannerRef}
        onRead={onSuccess}
        onError={onError}
        flashMode={flashOn ? 'torch' : 'off'}
        showMarker={true}
        markerStyle={styles.marker}
        cameraStyle={styles.camera}
        customMarker={
          <View style={styles.customMarker}>
            <View style={styles.scannerOverlay}>
              {/* Esquinas del marcador */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              
              {/* Línea de escaneo animada */}
              <View style={styles.scanLine} />
            </View>
          </View>
        }
        topContent={
          <SafeAreaView style={styles.topContent}>
            <View style={styles.headerContainer}>
              <TouchableOpacity style={styles.backButton} onPress={goBack}>
                <Icon name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              
              <Text style={styles.title}>Escanear Código QR</Text>
              
              <View style={styles.headerSpacer} />
            </View>
            
            <Text style={styles.instructions}>
              {scanning 
                ? 'Apunta la cámara hacia el código QR del producto'
                : 'Código detectado. Selecciona una opción.'
              }
            </Text>
          </SafeAreaView>
        }
        bottomContent={
          <SafeAreaView style={styles.bottomContent}>
            <View style={styles.controlsContainer}>
              {/* Control de Flash */}
              <TouchableOpacity
                style={[styles.controlButton, flashOn && styles.activeButton]}
                onPress={toggleFlash}
              >
                <Icon 
                  name={flashOn ? "flash-off" : "flash-on"} 
                  size={28} 
                  color={flashOn ? "#2196F3" : "#fff"} 
                />
                <Text style={[styles.controlText, flashOn && styles.activeText]}>
                  Flash
                </Text>
              </TouchableOpacity>
              
              {/* Botón de reactivar */}
              {!scanning && (
                <TouchableOpacity
                  style={[styles.controlButton, styles.reactivateButton]}
                  onPress={reactivateScanner}
                >
                  <Icon name="refresh" size={28} color="#fff" />
                  <Text style={styles.controlText}>Escanear Otro</Text>
                </TouchableOpacity>
              )}
              
              {/* Info del estado */}
              <TouchableOpacity
                style={styles.infoButton}
                onPress={() => {
                  Alert.alert(
                    'Consejos de Escaneo',
                    '• Mantén el código QR dentro del marco\n' +
                    '• Asegúrate de tener buena iluminación\n' +
                    '• Mantén la cámara estable\n' +
                    '• Si no funciona, usa el flash',
                    [{ text: 'Entendido' }]
                  );
                }}
              >
                <Icon name="help-outline" size={28} color="#fff" />
                <Text style={styles.controlText}>Ayuda</Text>
              </TouchableOpacity>
            </View>
            
            {/* Información adicional */}
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                {scannedData ? `Último código: ${scannedData}` : 'Buscando código QR...'}
              </Text>
            </View>
          </SafeAreaView>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    height: height,
    width: width,
  },
  customMarker: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerOverlay: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#2196F3',
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: '#2196F3',
    opacity: 0.8,
  },
  marker: {
    borderColor: '#2196F3',
    borderWidth: 2,
    borderRadius: 10,
  },
  topContent: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingTop: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    padding: 10,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44, // Same width as back button to center title
  },
  instructions: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 30,
    lineHeight: 22,
  },
  bottomContent: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingBottom: 10,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  controlButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 15,
    borderRadius: 15,
    minWidth: 80,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  activeButton: {
    backgroundColor: 'rgba(33, 150, 243, 0.3)',
    borderColor: '#2196F3',
  },
  reactivateButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    borderColor: '#4CAF50',
  },
  infoButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,152,0,0.3)',
    padding: 15,
    borderRadius: 15,
    minWidth: 80,
    borderWidth: 1,
    borderColor: 'rgba(255,152,0,0.5)',
  },
  controlText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
    fontWeight: '600',
  },
  activeText: {
    color: '#2196F3',
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  infoText: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default QRScannerScreen;