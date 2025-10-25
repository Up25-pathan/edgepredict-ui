import React, { Suspense, useEffect, useState, useMemo, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
// --- CORRECTED IMPORT ---
// Removed AxesHelper from drei, kept Grid
import { OrbitControls, Html, Grid } from '@react-three/drei';
// Import AxesHelper directly from three
import * as THREE from 'three';
// --- END CORRECTION ---
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import api from '../../services/api';

// Helper: Map range (unchanged)
const mapRange = (value, inMin, inMax, outMin, outMax) => {
  const clampedValue = Math.max(inMin, Math.min(value, inMax));
  if (inMax === inMin) return outMin;
  return ((clampedValue - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

// Helper: Get color (unchanged)
const getColorForValue = (value, min, max) => {
  const h = mapRange(value, min, max, 0.66, 0); // Blue (0.66) to Red (0)
  return new THREE.Color().setHSL(h, 1.0, 0.6); // Increased Lightness
};

// Scene Setup (unchanged from previous version - light background)
function SceneSetup() {
  const { scene } = useThree();
  useEffect(() => {
    scene.background = new THREE.Color(0xE5E7EB); // Light gray
  }, [scene]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <hemisphereLight skyColor={0xFFFFFF} groundColor={0xAAAAAA} intensity={0.5} />
      <directionalLight
        position={[20, 30, 20]} intensity={1.2} castShadow
        shadow-mapSize-width={1024} shadow-mapSize-height={1024}
        shadow-camera-far={100} shadow-camera-left={-30} shadow-camera-right={30}
        shadow-camera-top={30} shadow-camera-bottom={-30}
      />
      <directionalLight position={[-15, 10, -15]} intensity={0.4} />
    </>
  );
}

// Simulation Mesh (unchanged from previous version - lifts geometry)
function SimulationMesh({ stlBlob, nodeData, onColorDataCalculated }) {
  const [geometry, setGeometry] = useState(null);

  useEffect(() => {
    if (!stlBlob) return;
    const loader = new STLLoader();
    const blobUrl = URL.createObjectURL(stlBlob);
    loader.load(blobUrl, (loadedGeom) => {
      loadedGeom.computeVertexNormals();
      loadedGeom.center();
      const box = new THREE.Box3().setFromObject(new THREE.Mesh(loadedGeom));
      const height = box.max.y - box.min.y;
      loadedGeom.translate(0, height / 2, 0); // Lift
      setGeometry(loadedGeom);
      URL.revokeObjectURL(blobUrl);
    }, undefined, (error) => console.error('Error loading STL:', error));
  }, [stlBlob]);

  // Color Application Effect (unchanged)
  useEffect(() => {
    if (!geometry || !nodeData || nodeData.length === 0) return;
    const nonFracturedNodes = nodeData.filter(n => n?.status !== 'FRACTURED');
    let minStress = 0, maxStress = 0;
    if (nonFracturedNodes.length > 0) {
        const stresses = nonFracturedNodes.map(n => n.stress_MPa);
        minStress = Math.min(...stresses);
        maxStress = Math.max(...stresses);
    }
    onColorDataCalculated(minStress, maxStress);
    const numVertices = geometry.attributes.position.count;
    const colors = new Float32Array(numVertices * 3);
    const fracturedColor = new THREE.Color(0x4B5563);
     if (numVertices !== nodeData.length) {
       console.warn(`Node count (${nodeData.length}) != geometry vertices (${numVertices}). Color mapping approximate.`);
    }
    for (let i = 0; i < numVertices; i++) {
      let color; const node = nodeData[i];
      if (!node || node.status === 'FRACTURED') { color = fracturedColor; }
      else { color = getColorForValue(node.stress_MPa, minStress, maxStress); }
      colors[i * 3] = color.r; colors[i * 3 + 1] = color.g; colors[i * 3 + 2] = color.b;
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.attributes.color.needsUpdate = true;
  }, [geometry, nodeData, onColorDataCalculated]);


  if (!geometry) return <Html center>Loading geometry...</Html>;

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        vertexColors={true}
        flatShading={false}
        metalness={0.4}
        roughness={0.5}
      />
    </mesh>
  );
}


// Color Legend (unchanged from previous version)
const ColorLegend = ({ minStress, maxStress }) => {
  const numTicks = 6;
  const ticks = useMemo(() => {
    const values = [];
    if (typeof minStress !== 'number' || typeof maxStress !== 'number' || numTicks <= 1 || maxStress === minStress) {
      return [{ value: (minStress ?? 0).toFixed(1), percent: 0 }];
    }
    for (let i = 0; i < numTicks; i++) {
      const percent = (i / (numTicks - 1));
      const value = minStress + percent * (maxStress - minStress);
      values.push({ value: value.toFixed(1), percent: percent * 100 });
    }
    return values;
  }, [minStress, maxStress, numTicks]);

  if (typeof minStress !== 'number' || typeof maxStress !== 'number') return null;

  const gradientStyle = {
    background: 'linear-gradient(to top, hsl(240, 100%, 60%), hsl(120, 100%, 60%), hsl(60, 100%, 60%), hsl(0, 100%, 60%))',
    height: 'calc(100% - 20px)', width: '25px', borderRadius: '5px',
    position: 'absolute', left: '15px', top: '10px',
  };

  return (
    <div style={{
      position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: '20px',
      width: '120px', height: '250px', padding: '15px', paddingLeft: '50px',
      background: 'rgba(55, 65, 81, 0.85)', borderRadius: '8px',
      color: '#f9fafb', fontSize: '12px', fontFamily: '"Inter", sans-serif',
      zIndex: 100, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ marginBottom: '8px', fontWeight: '600', textAlign: 'center' }}>Stress (MPa)</div>
      <div style={{ position: 'relative', flexGrow: 1 }}>
        <div style={gradientStyle}></div>
        {ticks.map((tick, index) => (
          <div key={index} style={{
            position: 'absolute', left: '45px', bottom: `calc(${tick.percent}% - 7px)`,
            whiteSpace: 'nowrap', lineHeight: '1',
          }}>
            <span style={{display: 'inline-block', width: '5px', borderTop: '1px solid #9ca3af', marginRight: '5px', verticalAlign: 'middle'}}></span>
            {tick.value}
          </div>
        ))}
      </div>
    </div>
  );
};


// Main Component (unchanged from previous version)
const ResultThreeDeeSnapshot = ({ simulationData, nodeData, canvasRef }) => {
  const [stlBlob, setStlBlob] = useState(null);
  const [error, setError] = useState(null);
  const [stressRange, setStressRange] = useState({ min: null, max: null });

  useEffect(() => {
    setStressRange({ min: null, max: null }); setError(null); setStlBlob(null);
    if (!simulationData || !simulationData.tool_id) return;
    const fetchToolFile = async () => {
       try { const response = await api.getToolFileById(simulationData.tool_id); setStlBlob(response.data); }
       catch (err) { console.error('Failed to fetch tool file:', err); setError('Could not load 3D model file.'); }
    };
    fetchToolFile();
  }, [simulationData]);

  const handleColorDataCalculated = useCallback((min, max) => {
    setStressRange({ min, max });
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas
        ref={canvasRef}
        gl={{ preserveDrawingBuffer: true, antialias: true, outputColorSpace: THREE.SRGBColorSpace }}
        flat
        camera={{ position: [50, 40, 50], fov: 45 }}
        shadows
        dpr={[1, 1.5]}
      >
        <SceneSetup />

        <Grid
            position={[0, -0.01, 0]} args={[100, 100]}
            cellSize={1.0} cellThickness={0.5} cellColor={new THREE.Color(0x9CA3AF)}
            sectionSize={5.0} sectionThickness={1} sectionColor={new THREE.Color(0x6B7280)}
            fadeDistance={150} fadeStrength={1} infiniteGrid={true} followCamera={false}
         />

        {/* --- CORRECTED: Use primitive object for AxesHelper --- */}
        <primitive object={new THREE.AxesHelper(25)} />
        {/* --- END CORRECTION --- */}


         <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
          <circleGeometry args={[50, 32]} />
          <meshStandardMaterial color={0xD1D5DB} metalness={0.1} roughness={0.8} />
        </mesh>


        <Suspense fallback={<Html center>Loading 3D View...</Html>}>
           {error && <Html center style={{ color: '#EF4444' }}>{error}</Html>}
          {stlBlob && nodeData && nodeData.length > 0 && (
            <SimulationMesh
              stlBlob={stlBlob}
              nodeData={nodeData}
              onColorDataCalculated={handleColorDataCalculated}
            />
          )}
          {stlBlob && (!nodeData || nodeData.length === 0) && !error && (
               <Html center style={{ color: '#6B7280' }}>Simulation data unavailable.</Html>
          )}
          {!stlBlob && !error && (
              <Html center style={{ color: '#6B7280' }}>Loading 3D Model...</Html>
          )}
        </Suspense>
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
      <ColorLegend minStress={stressRange.min} maxStress={stressRange.max} />
    </div>
  );
};

export default ResultThreeDeeSnapshot;