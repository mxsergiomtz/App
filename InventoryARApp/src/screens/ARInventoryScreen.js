import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
  StatusBar,
  BackHandler,
  Animated,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ViroARSceneNavigator } from 'react-native-viro';
import ARScene from '../components/ARScene';

const { width, height } = Dimensions.get('window');

const ARInventoryScreen = ({ navigation, route }) => {
  const [arReady, setArReady] = useState(false);
  const [trackingState, setTrackingState] = useState('TRACKING_UNAVAILABLE');
  const [inventoryData, setInventoryData] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showInstructions, setShowInstructions] = useState(true);
  
  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  const { qrCode } = route.params || {};

  useEffect(() => {
    loadInventoryData();
    setupAnimations();
    
    // Manejar botón de regreso
    const backAction = () => {
      showExitConfirmation();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    // Ocultar instrucciones después de 5 segundos
    const instructionTimer = setTimeout(() => {
      setShowInstructions(false);
    }, 5000);

    return () => {
      backHandler.remove();
      clearTimeout(instructionTimer);
    };
  }, []);

  const loadInventoryData = () => {
    // Simular carga de datos del inventario basado en QR
    setTimeout(() => {
      const data = {
        itemCode: qrCode || 'DEMO-001',
        itemName: `Producto ${qrCode || 'Demo'}`,
        category: 'Electrónicos',
        currentStock: 45,
        minStock: 20,
        maxStock: 100,
        location: 'Almacén A - Estante 3B',
        status: getStockStatus(45, 20, 100),
        lastMovements: [
          { 
            id: 1, 
            date: '2024-12-08', 
            type: 'Entrada', 
            quantity: 20, 
            user: 'Juan Pérez' 
          },
          { 
            id: 2, 
            date: '2024-12-07', 
            type: 'Salida', 
            quantity: 15, 
            user: 'María García' 
          },
          { 
            id: 3, 
            date: '2024-12-06', 
            type: 'Entrada', 
            quantity: 30, 
            user: 'Carlos López' 
          }
        ],
        metrics: {
          rotationDays: 45,
          avgMovement: 12,
          accuracy: 98
        }
      };
      setInventoryData(data);
    }, 1500);
  };

  const getStockStatus = (current, min, max) => {
    if (current <= min) return 'LOW';
    if (current >= max * 0.9) return 'HIGH';
    return 'NORMAL';
  };

  const setupAnimations = () => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Pulse animation for loading
    const pulseAnimation = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (!arReady) {
          pulseAnimation();
        }
      });
    };

    if (!arReady) {
      pulseAnimation();
    }
  };

  const onInitialized = (state, reason) => {
    console.log('AR State:', state, 'Reason:', reason);
    
    switch (state) {
      case 1: // ViroConstants.TRACKING_UNAVAILABLE
        setTrackingState('TRACKING_UNAVAILABLE');
        break;
      case 2: // ViroConstants.TRACKING_LIMITED
        setTrackingState('TRACKING_LIMITED');
        break;
      case 3: // ViroConstants.TRACKING_NORMAL
        setTrackingState('TRACKING_NORMAL');
        setArReady(true);
        break;
      default:
        setTrackingState('UNKNOWN');
    }
  };

  const onAnchorFound = () => {
    console.log('AR Anchor found - objects can be placed');
    setArReady(true);
  };

  const onAnchorUpdated = (anchorMap) => {
    console.log('AR Anchor updated:', anchorMap);
  };

  const showExitConfirmation = () => {
    Alert.alert(
      'Salir de AR',
      '¿Estás seguro de que quieres salir de la vista de realidad aumentada?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Salir',
          onPress: () => navigation.goBack(),
          style: 'destructive'
        }
      ]
    );
  };

  const showHelp = () => {
    Alert.alert(
      'Instrucciones AR',
      '📱 Cómo usar la Realidad Aumentada:\n\n' +
      '• Mueve el dispositivo lentamente\n' +
      '• Busca una superficie plana y bien iluminada\n' +
      '• Los objetos 3D aparecerán automáticamente\n' +
      '• Toca los elementos para más información\n' +
      '• El inventario se muestra con colores:\n' +
      '  🔵 Azul: Stock actual\n' +
      '  🔴 Rojo: Stock mínimo\n' +
      '  🟢 Verde: Stock máximo',
      [{ text: 'Entendido' }]
    );
  };

  const toggleInstructions = () => {
    setShowInstructions(!showInstructions);
  };

  const openDetailView = () => {
    navigation.navigate('InventoryDetail', { 
      qrCode: inventoryData.itemCode,
      itemName: inventoryData.itemName 
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'LOW': return '#F44336';
      case 'HIGH': return '#4CAF50';
      case 'NORMAL': return '#2196F3';
      default: return '#999';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'LOW': return 'Stock Bajo';
      case 'HIGH': return 'Stock Alto';
      case 'NORMAL': return 'Stock Normal';
      default: return 'Desconocido';
    }
  };

  const getTrackingMessage = () => {
    switch (trackingState) {
      case 'TRACKING_UNAVAILABLE':
        return 'Inicializando AR...';
      case 'TRACKING_LIMITED':
        return 'Mueve el dispositivo lentamente';
      case 'TRACKING_NORMAL':
        return 'AR listo - Busca una superficie';
      default:
        return 'Configurando realidad aumentada...';
    }
  };

  // Pantalla de carga AR
  if (!arReady || !inventoryData) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        
        <Animated.View style={[
          styles.loadingContent,
          { opacity: fadeAnim, transform: [{ scale: pulseAnim }] }
        ]}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingTitle}>Iniciando Realidad Aumentada</Text>
          <Text style={styles.loadingSubtext}>
            {inventoryData ? getTrackingMessage() : 'Cargando datos de inventario...'}
          </Text>
          
          {inventoryData && (
            <View style={styles.itemInfo}>
              <Text style={styles.itemCode}>Código: {inventoryData.itemCode}</Text>
              <Text style={styles.itemName}>{inventoryData.itemName}</Text>
            </View>
          )}
        </Animated.View>
        
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color="#fff" />
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* AR Scene */}
      <ViroARSceneNavigator
        autofocus={true}
        initialScene={{
          scene: ARScene,
          passProps: { 
            inventoryData: inventoryData,
            onItemSelected: setSelectedItem 
          }
        }}
        style={styles.arView}
        onTrackingUpdated={onInitialized}
        onAnchorFound={onAnchorFound}
        onAnchorUpdated={onAnchorUpdated}
      />
      
      {/* UI Overlay */}
      <SafeAreaView style={styles.overlay}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={showExitConfirmation}>
            <Icon name="arrow-back" size={24} color="#fff" />
            <Text style={styles.backButtonText}>Salir</Text>
          </TouchableOpacity>
          
          <View style={styles.titleContainer}>
            <Text style={styles.arTitle}>Vista AR</Text>
            <Text style={styles.trackingStatus}>{getTrackingMessage()}</Text>
          </View>
          
          <View style={styles.topActions}>
            <TouchableOpacity style={styles.helpButton} onPress={showHelp}>
              <Icon name="help-outline" size={24} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.instructionsButton} onPress={toggleInstructions}>
              <Icon name={showInstructions ? "visibility-off" : "visibility"} size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Instructions Panel */}
        {showInstructions && (
          <Animated.View style={[styles.instructionsPanel, { opacity: fadeAnim }]}>
            <View style={styles.instructionItem}>
              <Icon name="open-with" size={20} color="#2196F3" />
              <Text style={styles.instructionText}>Mueve el dispositivo para detectar superficies</Text>
            </View>
            <View style={styles.instructionItem}>
              <Icon name="touch-app" size={20} color="#2196F3" />
              <Text style={styles.instructionText}>Toca los objetos 3D para ver detalles</Text>
            </View>
            <View style={styles.instructionItem}>
              <Icon name="lightbulb-outline" size={20} color="#2196F3" />
              <Text style={styles.instructionText}>Mejor con buena iluminación</Text>
            </View>
          </Animated.View>
        )}

        {/* Bottom Info Panel */}
        <View style={styles.bottomBar}>
          <View style={styles.infoPanel}>
            <View style={styles.infoHeader}>
              <View style={styles.itemDetails}>
                <Text style={styles.infoTitle}>{inventoryData.itemName}</Text>
                <Text style={styles.infoSubtitle}>Código: {inventoryData.itemCode}</Text>
              </View>
              
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(inventoryData.status) }
              ]}>
                <Text style={styles.statusText}>
                  {getStatusText(inventoryData.status)}
                </Text>
              </View>
            </View>
            
            <View style={styles.quickStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{inventoryData.currentStock}</Text>
                <Text style={styles.statLabel}>Stock Actual</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{inventoryData.metrics.rotationDays}</Text>
                <Text style={styles.statLabel}>Días Rotación</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{inventoryData.metrics.accuracy}%</Text>
                <Text style={styles.statLabel}>Precisión</Text>
              </View>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={openDetailView}>
                <Icon name="list-alt" size={20} color="#2196F3" />
                <Text style={styles.actionButtonText}>Ver Detalle</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} onPress={() => setShowInstructions(!showInstructions)}>
                <Icon name="help" size={20} color="#FF9800" />
                <Text style={styles.actionButtonText}>Ayuda</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 20,
  },
  loadingContent: {
    alignItems: 'center',
    marginBottom: 50,
  },
  loadingTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  loadingSubtext: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  itemInfo: {
    alignItems: 'center',
    backgroundColor: 'rgba(33, 150, 243, 0.2)',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  itemCode: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
  },
  itemName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  cancelText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600',
  },
  arView: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 16,
    fontWeight: '600',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  arTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  trackingStatus: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 2,
  },
  topActions: {
    flexDirection: 'row',
  },
  helpButton: {
    backgroundColor: 'rgba(255, 152, 0, 0.8)',
    padding: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  instructionsButton: {
    backgroundColor: 'rgba(156, 39, 176, 0.8)',
    padding: 10,
    borderRadius: 20,
  },
  instructionsPanel: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    marginHorizontal: 20,
    marginTop: 10,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  instructionText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  infoPanel: {
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  itemDetails: {
    flex: 1,
  },
  infoTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoSubtitle: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#2196F3',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '600',
  },
});

export default ARInventoryScreen;