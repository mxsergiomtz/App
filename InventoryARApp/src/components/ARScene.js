import React, { useState } from 'react';
import {
  ViroARScene,
  ViroText,
  ViroBox,
  ViroSphere,
  ViroAmbientLight,
  ViroSpotLight,
  ViroARPlaneSelector,
  ViroMaterials,
  ViroAnimations,
  ViroQuad,
  ViroNode
} from 'react-native-viro';

// Configurar materiales para los objetos 3D
ViroMaterials.createMaterials({
  blue: {
    shininess: 2.0,
    lightingModel: "Lambert",
    diffuseColor: "#2196F3"
  },
  green: {
    shininess: 2.0,
    lightingModel: "Lambert", 
    diffuseColor: "#4CAF50"
  },
  red: {
    shininess: 2.0,
    lightingModel: "Lambert",
    diffuseColor: "#F44336"
  },
  orange: {
    shininess: 2.0,
    lightingModel: "Lambert",
    diffuseColor: "#FF9800"
  },
  panel: {
    diffuseColor: "#ffffff",
    opacity: 0.9
  },
  glass: {
    diffuseColor: "#ffffff",
    opacity: 0.7,
    shininess: 2.0
  }
});

// Configurar animaciones
ViroAnimations.registerAnimations({
  rotate: {
    properties: {
      rotateY: "+=90"
    },
    duration: 2000,
  },
  pulse: {
    properties: {
      scaleX: 1.3,
      scaleY: 1.3,
      scaleZ: 1.3,
    },
    duration: 1000,
    easing: "bounce"
  },
  float: {
    properties: {
      positionY: "+=0.2"
    },
    duration: 2000,
    easing: "easeInEaseOut"
  },
  spin: {
    properties: {
      rotateX: "+=360"
    },
    duration: 4000,
  }
});

const ARScene = ({ inventoryData, onItemSelected }) => {
  const [inventoryVisible, setInventoryVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Datos por defecto si no se proporcionan
  const defaultData = {
    itemName: 'Producto Demo',
    currentStock: 45,
    minStock: 20,
    maxStock: 100,
    lastMovements: [
      { date: '2024-12-08', type: 'Entrada', quantity: 20 },
      { date: '2024-12-07', type: 'Salida', quantity: 15 },
      { date: '2024-12-06', type: 'Entrada', quantity: 30 }
    ]
  };

  const data = inventoryData || defaultData;

  const onPlaneDetected = () => {
    console.log('Plane detected - showing AR inventory');
    setInventoryVisible(true);
  };

  const onItemClick = (itemType) => {
    console.log('Item clicked:', itemType);
    setSelectedItem(itemType);
    
    // Notificar al componente padre
    if (onItemSelected) {
      onItemSelected(itemType);
    }
  };

  const getStockStatus = () => {
    if (data.currentStock <= data.minStock) return 'low';
    if (data.currentStock >= data.maxStock * 0.8) return 'high';
    return 'normal';
  };

  const getStatusColor = () => {
    const status = getStockStatus();
    switch (status) {
      case 'low': return 'red';
      case 'high': return 'green';
      default: return 'blue';
    }
  };

  return (
    <ViroARScene onPlaneDetected={onPlaneDetected}>
      {/* Iluminación ambiental */}
      <ViroAmbientLight color={"#ffffff"} intensity={0.4} />
      
      {/* Luz direccional */}
      <ViroSpotLight
        innerAngle={5}
        outerAngle={90}
        direction={[0, -1, -0.2]}
        position={[0, 3, 1]}
        color="#ffffff"
        castsShadow={true}
        intensity={1000}
      />

      <ViroARPlaneSelector>
        {inventoryVisible && (
          <ViroNode>
            {/* Panel principal de información */}
            <ViroQuad
              rotation={[-90, 0, 0]}
              position={[0, 0.1, 0]}
              width={3}
              height={2}
              materials={["glass"]}
            />
            
            {/* Título del producto */}
            <ViroText
              text={data.itemName}
              scale={[0.6, 0.6, 0.6]}
              position={[0, 1.8, 0]}
              style={{
                fontFamily: "Arial",
                fontSize: 80,
                color: "#2196F3",
                textAlign: "center",
                fontWeight: "bold"
              }}
            />

            {/* Stock actual - Esfera central grande */}
            <ViroSphere
              radius={0.4}
              position={[0, 1, 0]}
              materials={[getStatusColor()]}
              onClick={() => onItemClick('current')}
              animation={{
                name: selectedItem === 'current' ? "pulse" : "float",
                run: true,
                loop: true
              }}
            />
            
            <ViroText
              text={`Stock Actual\n${data.currentStock} unidades`}
              scale={[0.5, 0.5, 0.5]}
              position={[0, 0.4, 0]}
              style={{
                fontFamily: "Arial",
                fontSize: 50,
                color: "#2196F3",
                textAlign: "center",
                fontWeight: "bold"
              }}
            />

            {/* Stock mínimo - Cubo rojo */}
            <ViroBox
              position={[-1.2, 0.6, 0]}
              scale={[0.3, 0.3, 0.3]}
              materials={["red"]}
              onClick={() => onItemClick('min')}
              animation={{
                name: selectedItem === 'min' ? "pulse" : "rotate",
                run: true,
                loop: true
              }}
            />
            
            <ViroText
              text={`Stock Mínimo\n${data.minStock}`}
              scale={[0.4, 0.4, 0.4]}
              position={[-1.2, 0.1, 0]}
              style={{
                fontFamily: "Arial",
                fontSize: 40,
                color: "#F44336",
                textAlign: "center",
                fontWeight: "bold"
              }}
            />

            {/* Stock máximo - Cubo verde */}
            <ViroBox
              position={[1.2, 0.6, 0]}
              scale={[0.3, 0.3, 0.3]}
              materials={["green"]}
              onClick={() => onItemClick('max')}
              animation={{
                name: selectedItem === 'max' ? "pulse" : "rotate", 
                run: true,
                loop: true
              }}
            />
            
            <ViroText
              text={`Stock Máximo\n${data.maxStock}`}
              scale={[0.4, 0.4, 0.4]}
              position={[1.2, 0.1, 0]}
              style={{
                fontFamily: "Arial",
                fontSize: 40,
                color: "#4CAF50",
                textAlign: "center",
                fontWeight: "bold"
              }}
            />

            {/* Indicador de estado con animación */}
            <ViroSphere
              radius={0.1}
              position={[0, 1.5, 0]}
              materials={[getStatusColor()]}
              animation={{
                name: "pulse",
                run: true,
                loop: true
              }}
            />

            {/* Información de movimientos */}
            <ViroText
              text="Últimos Movimientos:"
              scale={[0.35, 0.35, 0.35]}