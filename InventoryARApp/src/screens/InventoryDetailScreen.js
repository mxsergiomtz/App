import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

const InventoryDetailScreen = ({ navigation, route }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [inventoryData, setInventoryData] = useState(null);
  
  const { qrCode, mockData, itemName } = route.params || {};

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = () => {
    // Simular carga de datos
    setTimeout(() => {
      setInventoryData({
        itemCode: qrCode || 'DEMO-001',
        itemName: itemName || `Producto ${qrCode || 'Demo'}`,
        category: 'Electrónicos',
        currentStock: 45,
        minStock: 20,
        maxStock: 100,
        location: 'Almacén A - Estante 3B',
        lastUpdated: '2024-12-08 14:30:22',
        supplier: 'Tech Solutions SA',
        unitPrice: 150.00,
        totalValue: 6750.00,
        movements: [
          { id: 1, date: '2024-12-08', type: 'Entrada', quantity: 20, user: 'Juan Pérez', reference: 'PO-2024-001', notes: 'Restock mensual' },
          { id: 2, date: '2024-12-07', type: 'Salida', quantity: 15, user: 'María García', reference: 'SO-2024-045', notes: 'Venta cliente Premium' },
          { id: 3, date: '2024-12-06', type: 'Entrada', quantity: 30, user: 'Carlos López', reference: 'PO-2024-002', notes: 'Orden especial' },
          { id: 4, date: '2024-12-05', type: 'Ajuste', quantity: -5, user: 'Ana Martínez', reference: 'ADJ-2024-012', notes: 'Corrección inventario' },
          { id: 5, date: '2024-12-04', type: 'Salida', quantity: 25, user: 'Pedro Rodríguez', reference: 'SO-2024-044', notes: 'Distribución regional' }
        ],
        alerts: [
          { id: 1, type: 'warning', message: 'Stock se acerca al mínimo', priority: 'medium' },
          { id: 2, type: 'info', message: 'Próxima revisión: 15 Dec', priority: 'low' }
        ]
      });
      setRefreshing(false);
    }, 1000);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadInventoryData();
  };

  const getStockColor = () => {
    if (!inventoryData) return '#999';
    if (inventoryData.currentStock <= inventoryData.minStock) return '#F44336';
    if (inventoryData.currentStock >= inventoryData.maxStock * 0.8) return '#4CAF50';
    return '#FF9800';
  };

  const getMovementColor = (type) => {
    switch (type) {
      case 'Entrada': return '#4CAF50';
      case 'Salida': return '#F44336';
      case 'Ajuste': return '#FF9800';
      default: return '#999';
    }
  };

  const getMovementIcon = (type) => {
    switch (type) {
      case 'Entrada': return 'arrow-downward';
      case 'Salida': return 'arrow-upward';
      case 'Ajuste': return 'build';
      default: return 'help';
    }
  };

  const openAR = () => {
    navigation.navigate('ARInventory', { qrCode: inventoryData.itemCode });
  };

  const addMovement = (type) => {
    Alert.alert(
      `${type} de Inventario`,
      `¿Deseas registrar un movimiento de ${type.toLowerCase()}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: () => {
          Alert.alert('Éxito', `Movimiento de ${type.toLowerCase()} registrado`);
        }}
      ]
    );
  };

  const getStockPercentage = () => {
    if (!inventoryData) return 0;
    return (inventoryData.currentStock / inventoryData.maxStock) * 100;
  };

  if (!inventoryData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando inventario...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Card */}
        <LinearGradient colors={['#2196F3', '#21CBF3']} style={styles.headerCard}>
          <View style={styles.headerContent}>
            <View style={styles.headerText}>
              <Text style={styles.itemName}>{inventoryData.itemName}</Text>
              <Text style={styles.itemCode}>Código: {inventoryData.itemCode}</Text>
              <Text style={styles.category}>{inventoryData.category}</Text>
            </View>
            
            <TouchableOpacity style={styles.arButton} onPress={openAR}>
              <Icon name="view-in-ar" size={24} color="#2196F3" />
              <Text style={styles.arButtonText}>Ver en AR</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Alerts */}
        {inventoryData.alerts.length > 0 && (
          <View style={styles.alertsCard}>
            <Text style={styles.sectionTitle}>🚨 Alertas</Text>
            {inventoryData.alerts.map((alert) => (
              <View key={alert.id} style={[styles.alertItem, 
                alert.type === 'warning' ? styles.warningAlert : styles.infoAlert
              ]}>
                <Icon 
                  name={alert.type === 'warning' ? 'warning' : 'info'} 
                  size={20} 
                  color={alert.type === 'warning' ? '#FF9800' : '#2196F3'} 
                />
                <Text style={styles.alertText}>{alert.message}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Stock Information */}
        <View style={styles.stockCard}>
          <Text style={styles.sectionTitle}>📦 Estado del Stock</Text>
          
          {/* Stock Progress Bar */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>Nivel de Stock</Text>
            <View style={styles.progressBar}>
              <View style={[
                styles.progressFill, 
                { 
                  width: `${getStockPercentage()}%`,
                  backgroundColor: getStockColor() 
                }
              ]} />
            </View>
            <Text style={styles.progressText}>
              {getStockPercentage().toFixed(1)}% ({inventoryData.currentStock}/{inventoryData.maxStock})
            </Text>
          </View>

          <View style={styles.stockRow}>
            <View style={styles.stockItem}>
              <Text style={[styles.stockNumber, { color: getStockColor() }]}>
                {inventoryData.currentStock}
              </Text>
              <Text style={styles.stockLabel}>Actual</Text>
            </View>
            
            <View style={styles.stockItem}>
              <Text style={[styles.stockNumber, { color: '#F44336' }]}>
                {inventoryData.minStock}
              </Text>
              <Text style={styles.stockLabel}>Mínimo</Text>
            </View>
            
            <View style={styles.stockItem}>
              <Text style={[styles.stockNumber, { color: '#4CAF50' }]}>
                {inventoryData.maxStock}
              </Text>
              <Text style={styles.stockLabel}>Máximo</Text>
            </View>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Icon name="location-on" size={20} color="#666" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Ubicación</Text>
                <Text style={styles.detailValue}>{inventoryData.location}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Icon name="business" size={20} color="#666" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Proveedor</Text>
                <Text style={styles.detailValue}>{inventoryData.supplier}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Icon name="attach-money" size={20} color="#666" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Precio Unitario</Text>
                <Text style={styles.detailValue}>${inventoryData.unitPrice}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Icon name="account-balance-wallet" size={20} color="#666" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Valor Total</Text>
                <Text style={styles.detailValue}>${inventoryData.totalValue}</Text>
              </View>
            </View>
          </View>
          
          <Text style={styles.lastUpdated}>
            Última actualización: {inventoryData.lastUpdated}
          </Text>
        </View>

        {/* Movements History */}
        <View style={styles.movementsCard}>
          <Text style={styles.sectionTitle}>📋 Historial de Movimientos</Text>
          
          {inventoryData.movements.map((movement) => (
            <View key={movement.id} style={styles.movementItem}>
              <View style={styles.movementHeader}>
                <View style={styles.movementTypeContainer}>
                  <Icon 
                    name={getMovementIcon(movement.type)} 
                    size={20} 
                    color={getMovementColor(movement.type)} 
                  />
                  <Text style={[styles.movementType, { color: getMovementColor(movement.type) }]}>
                    {movement.type}
                  </Text>
                </View>
                <Text style={styles.movementDate}>{movement.date}</Text>
              </View>
              
              <View style={styles.movementDetails}>
                <Text style={styles.movementQuantity}>
                  Cantidad: {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                </Text>
                <Text style={styles.movementUser}>Usuario: {movement.user}</Text>
                <Text style={styles.movementReference}>Ref: {movement.reference}</Text>
                {movement.notes && (
                  <Text style={styles.movementNotes}>Notas: {movement.notes}</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.entradaButton]}
            onPress={() => addMovement('Entrada')}
          >
            <Icon name="add" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Entrada</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.salidaButton]}
            onPress={() => addMovement('Salida')}
          >
            <Icon name="remove" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Salida</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.ajusteButton]}
            onPress={() => addMovement('Ajuste')}
          >
            <Icon name="build" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Ajuste</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerContent: {
    padding: 20,
  },
  headerText: {
    marginBottom: 15,
  },
  itemName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  itemCode: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 5,
  },
  category: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  arButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 25,
  },
  arButtonText: {
    color: '#2196F3',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  alertsCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 15,
    elevation: 3,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  warningAlert: {
    backgroundColor: '#FFF3E0',
  },
  infoAlert: {
    backgroundColor: '#E3F2FD',
  },
  alertText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  stockCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 15,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  stockItem: {
    alignItems: 'center',
  },
  stockNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  stockLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailsGrid: {
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  movementsCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 15,
    elevation: 3,
  },
  movementItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#e0e0e0',
    paddingLeft: 15,
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  movementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  movementTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  movementType: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  movementDate: {
    fontSize: 14,
    color: '#666',
  },
  movementDetails: {
    marginTop: 5,
  },
  movementQuantity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  movementUser: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  movementReference: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  movementNotes: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 16,
    marginTop: 0,
    marginBottom: 30,
  },
  actionButton: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    minWidth: 100,
    flex: 1,
    marginHorizontal: 5,
  },
  entradaButton: {
    backgroundColor: '#4CAF50',
  },
  salidaButton: {
    backgroundColor: '#F44336',
  },
  ajusteButton: {
    backgroundColor: '#FF9800',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#fff',
    marginTop: 8,
    fontWeight: 'bold',
  },
});

export default InventoryDetailScreen;