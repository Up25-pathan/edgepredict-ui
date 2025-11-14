import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { 
    OrbitControls, 
    Stage, 
    Grid, 
    Html, 
    useProgress 
} from '@react-three/drei';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

// --- Loading Spinner Component ---
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="text-white text-sm bg-gray-800 px-3 py-1 rounded-full opacity-80">
        {progress.toFixed(0)}% loaded
      </div>
    </Html>
  );
}

// --- The Actual Tool Model ---
function Model({ url }) {
  // This automatically handles loading STL files if a URL is provided
  const geom = useLoader(STLLoader, url);

  return (
    <mesh geometry={geom} castShadow receiveShadow>
      <meshStandardMaterial 
        color="#6366f1" // Indigo color similar to your theme
        metalness={0.5}
        roughness={0.2} 
      />
    </mesh>
  );
}

// --- Placeholder geometry if no real file is available ---
function PlaceholderTool() {
    const meshRef = useRef();
    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.2;
        }
    });

    return (
        <mesh ref={meshRef} castShadow receiveShadow position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 2, 32]} />
            <meshStandardMaterial color="#6366f1" metalness={0.6} roughness={0.2} />
        </mesh>
    );
}

const ThreeDeeViewer = ({ toolUrl, isProcessing }) => {
    return (
        <div className="w-full h-full bg-gray-950 rounded-lg overflow-hidden relative">
            {/* Overlay Status */}
            <div className="absolute top-4 left-4 z-10 bg-gray-900/60 backdrop-blur-sm p-2 rounded text-xs text-gray-300">
                {isProcessing ? (
                    <div className="flex items-center text-yellow-400">
                        <span className="animate-pulse mr-2">●</span> Simulation Running...
                    </div>
                ) : (
                     <div className="flex items-center text-emerald-400">
                        <span className="mr-2">●</span> Visualization Ready
                    </div>
                )}
            </div>

            <Canvas shadows camera={{ position: [4, 4, 4], fov: 50 }}>
                <color attach="background" args={['#09090b']} />
                <fog attach="fog" args={['#09090b', 5, 20]} />
                
                <Suspense fallback={<Loader />}>
                    {/* Stage handles lighting and centering automatically */}
                    <Stage environment="city" intensity={0.6} contactShadow={false}>
                        {toolUrl && toolUrl.endsWith('.stl') ? (
                           <Model url={toolUrl} />
                        ) : (
                           <PlaceholderTool />
                        )}
                    </Stage>
                </Suspense>

                {/* Reference Grid */}
                <Grid 
                    renderOrder={-1} 
                    position={[0, 0, 0]} 
                    infiniteGrid 
                    cellSize={0.5} 
                    cellThickness={0.5} 
                    sectionSize={3} 
                    sectionThickness={1} 
                    sectionColor={[0.5, 0.5, 1]} 
                    fadeDistance={30} 
                />

                <OrbitControls 
                    autoRotate={isProcessing} 
                    autoRotateSpeed={0.5} 
                    makeDefault 
                    minPolarAngle={0} 
                    maxPolarAngle={Math.PI / 1.8} 
                />
            </Canvas>
        </div>
    );
};

export default ThreeDeeViewer;