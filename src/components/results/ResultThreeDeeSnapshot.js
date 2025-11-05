import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// This component builds the 3D model from the node data
const ToolPointCloud = ({ nodeData }) => {
  const geometry = useMemo(() => {
    if (!nodeData || nodeData.length === 0) {
      return null;
    }

    const positions = [];
    const colors = [];
    const color = new THREE.Color();
    
    // Find min/max stress to create a color gradient
    let minStress = Infinity;
    let maxStress = -Infinity;
    nodeData.forEach(node => {
      if (node.stress != null) {
        if (node.stress < minStress) minStress = node.stress;
        if (node.stress > maxStress) maxStress = node.stress;
      }
    });

    if (minStress === maxStress) minStress = maxStress - 1; // Avoid divide-by-zero

    // Create the geometry from the node data
    nodeData.forEach(node => {
      // 1. Add vertex position
      if (node.pos && node.pos.length === 3) {
        // --- THIS WAS THE TYPO FIX ('s2' -> '2') ---
        positions.push(node.pos[0], node.pos[1], node.pos[2]);
      } else {
        return; // Skip node if data is bad
      }

      // 2. Add vertex color based on stress
      const stress = node.stress || 0;
      const normalizedStress = (stress - minStress) / (maxStress - minStress);
      
      // Gradient from blue (low stress, 0.7 HSL) to red (high stress, 0.0 HSL)
      color.setHSL(0.7 * (1 - normalizedStress), 1.0, 0.5); 
      
      colors.push(color.r, color.g, color.b);
    });

    if (positions.length === 0) return null;

    // Create the BufferGeometry
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeBoundingSphere(); // Center the geometry
    
    return geo;

  }, [nodeData]);

  if (!geometry) {
    return null; // Don't render if no data
  }

  // Render the geometry as a point cloud
  return (
    <points geometry={geometry}>
      <pointsMaterial 
        vertexColors 
        size={2} // Point size in pixels
        sizeAttenuation={false} // Make size constant regardless of zoom
      />
    </points>
  );
};


// --- This is the main component ---
const ResultThreeDeeSnapshot = ({ nodeData }) => {
  return (
    // --- FIX: Set position MUCH closer to the origin [0,0,0] & bright background ---
    <Canvas camera={{ position: [0.02, 0.02, 0.02], fov: 50 }}>
      {/* --- FIX: Added bright background --- */}
      <color attach="background" args={['#ffffff']} />
      <Suspense fallback={null}>
        <ambientLight intensity={1.0} />
        <directionalLight position={[10, 10, 5]} />
        
        {/* We rotate the model to be "Y-up" like a tool */}
        <group rotation={[-Math.PI / 2, 0, 0]}> 
            <ToolPointCloud nodeData={nodeData} />
        </group>

        <OrbitControls makeDefault />
        <gridHelper args={[0.1, 10]} /> {/* --- FIX: Added grid --- */}
        <axesHelper args={[0.05]} /> {/* Show X,Y,Z axes */}
      </Suspense>
    </Canvas>
  );
};

export default ResultThreeDeeSnapshot;