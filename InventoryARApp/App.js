import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  Alert,
  PermissionsAndroid,
  Platform,
  Text
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Importar pantallas (crear estos archivos después)
import HomeScreen from './src/screens/HomeScreen';
import QRScannerScreen from './src/screens/QRScannerScreen';
import ARInventoryScreen from './src/screens/ARInventoryScreen';
import InventoryDetailScreen from './src/screens/InventoryDetailScreen';

// Importar utilidades
import { requestCameraPermission } from './src/utils/permissions';

const Stack = createStackNavigator();

const App = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const cameraPermission = await requestCameraPermission();
      setHasPermission(cameraPermission);
      
      if (!cameraPermission) {
        Alert.alert(
          'Permiso Requerido',
          'La aplicación necesita permisos de cámara para funcionar correctamente.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      setHasPermission(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Pantalla de carga mientras se verifican permisos
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Inicializando aplicación...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#2196F3" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2196F3',
            elevation: 4,
            shadowOpacity: 0.3,
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          headerBackTitleVisible: false,
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ 
            title: 'Inventario AR',
            headerLeft: null, // No mostrar botón de regreso en home
          }}
        />
        <Stack.Screen 
          name="QRScanner" 
          component={QRScannerScreen} 
          options={{ 
            title: 'Escanear Código QR',
            headerStyle: {
              backgroundColor: '#1976D2',
            }
          }}
        />
        <Stack.Screen 
          name="ARInventory" 
          component={ARInventoryScreen} 
          options={{ 
            title: 'Vista AR', 
            headerShown: false // Ocultar header en AR para pantalla completa
          }}
        />
        <Stack.Screen 
          name="InventoryDetail" 
          component={InventoryDetailScreen} 
          options={({ route }) => ({
            title: route.params?.itemName || 'Detalle de Inventario',
            headerStyle: {
              backgroundColor: '#1565C0',
            }
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});

export default App;