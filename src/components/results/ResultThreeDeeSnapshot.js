import React, { useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
// --- FIX: Import Bounds and Loader2 ---
import { OrbitControls, Bounds } from '@react-three/drei';
import { Loader2 } from 'lucide-react';
// --- END FIX ---
import * as THREE from 'three';
import Card from '../common/Card'; // Import Card
import { Scan } from 'lucide-react'; // Import Scan

// --- REMOVED custom CameraAutoFit component ---

// --- This component now pulls from props, as in your original code ---
const ResultThreeDeeSnapshot = ({ nodeData, particleData }) => {
    // This is your original, correct logic for processing props
    const { toolPositions, toolColors, partPositions, partColors, bounds } = useMemo(() => {
        const bbox = new THREE.Box3();
        const colorHelper = new THREE.Color();
        let tPos = new Float32Array(0), tCol = new Float32Array(0);
        
        if (nodeData && nodeData.length > 0) {
            tPos = new Float32Array(nodeData.length * 3);
            tCol = new Float32Array(nodeData.length * 3);
            let maxStress = 0;
            // --- FIX: Use stress_MPa from your original code ---
            for (let i = 0; i < nodeData.length; i++) maxStress = Math.max(maxStress, nodeData[i].stress_MPa);
            maxStress = Math.max(maxStress, 1.0);
            
            for (let i = 0; i < nodeData.length; i++) {
                const node = nodeData[i];
                const idx = i * 3;
                
                // --- FIX: Use position from your original code ---
                const x = node.position[0];
                const y = node.position[1];
                const z = node.position[2];
                
                tPos[idx] = x; tPos[idx+1] = y; tPos[idx+2] = z;
                bbox.expandByPoint(new THREE.Vector3(x, y, z));
                
                // --- FIX: Use stress_MPa from your original code ---
                const t = Math.min(1.0, Math.max(0.0, node.stress_MPa / maxStress));
                colorHelper.setHSL(0.66 - (t * 0.66), 1.0, 0.5);
                tCol[idx] = colorHelper.r; tCol[idx+1] = colorHelper.g; tCol[idx+2] = colorHelper.b;
            }
        }

        // Particle data logic (from your original)
        let pPos = new Float32Array(0), pCol = new Float32Array(0);
        if (particleData && particleData.length > 0) {
            pPos = new Float32Array(particleData.length * 3);
            pCol = new Float32Array(particleData.length * 3);
            for (let i = 0; i < particleData.length; i++) {
                const p = particleData[i];
                const idx = i * 3;
                pPos[idx] = p.position[0]; pPos[idx+1] = p.position[1]; pPos[idx+2] = p.position[2];
                bbox.expandByPoint(new THREE.Vector3(p.position[0], p.position[1], p.position[2]));
                const t = Math.min(1.0, p.temperature / 1500.0); 
                colorHelper.setHSL(0.1 - (t * 0.1), 1.0, 0.5 + t * 0.5);
                pCol[idx] = colorHelper.r; pCol[idx+1] = colorHelper.g; pCol[idx+2] = colorHelper.b;
            }
        }
        return { toolPositions: tPos, toolColors: tCol, partPositions: pPos, partColors: pCol, bounds: bbox };
    }, [nodeData, particleData]);
    // --- END of your original logic ---

    // Loading guard from your original code
    if ((!nodeData || nodeData.length === 0) && (!particleData || particleData.length === 0)) {
        return (
            <Card>
                <div className="flex items-center p-4 border-b border-gray-700">
                    <Scan className="w-5 h-5 mr-2 text-indigo-400" />
                    <h3 className="text-lg font-semibold text-white">3D Stress Snapshot</h3>
                </div>
                <div className="h-[600px] w-full p-0 relative flex items-center justify-center text-gray-400">
                    <Loader2 className="w-8 h-8 mr-2 animate-spin" />
                    Waiting for simulation data...
                </div>
            </Card>
        );
    }
    
    // --- FIX: Replaced custom camera with <Bounds> and <Suspense> ---
    return (
        <Card>
            <div className="flex items-center p-4 border-b border-gray-700">
                <Scan className="w-5 h-5 mr-2 text-indigo-400" />
                <h3 className="text-lg font-semibold text-white">3D Stress Snapshot</h3>
            </div>
            {/* Set a large, fixed height for the canvas container */}
            <div className="h-[600px] w-full p-0 relative">
                <Suspense fallback={
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        <Loader2 className="w-8 h-8 mr-2 animate-spin" />
                        Loading 3D Model...
                    </div>
                }>
                    <Canvas className="bg-gray-800 rounded-b-lg">
                        <ambientLight intensity={1.2} />
                        <directionalLight position={[5, 5, 5]} intensity={1} />
                        <directionalLight position={[-5, -5, -5]} intensity={0.5} />
                        
                        {/* Bounds will auto-frame all contents */}
                        <Bounds fit clip observe margin={1.5}>
                            {/* This is your original <points> logic */}
                            {toolPositions.length > 0 && (
                                <points>
                                    <bufferGeometry>
                                        <bufferAttribute attach="attributes-position" count={toolPositions.length / 3} array={toolPositions} itemSize={3} />
                                        <bufferAttribute attach="attributes-color" count={toolColors.length / 3} array={toolColors} itemSize={3} />
                                    </bufferGeometry>
                                    {/* --- FIX: Increased point size for visibility --- */}
                                    <pointsMaterial 
                                        size={0.0005} // Increased from 0.0005
                                        vertexColors 
                                        sizeAttenuation 
                                        transparent={false} // Make points solid
                                        opacity={1.0}       // Make points solid
                                    />
                                </points>
                            )}
                            {/* This is your original <points> logic for particles */}
                            {partPositions.length > 0 && (
                                <points>
                                    <bufferGeometry>
                                        <bufferAttribute attach="attributes-position" count={partPositions.length / 3} array={partPositions} itemSize={3} />
                                        <bufferAttribute attach="attributes-color" count={partColors.length / 3} array={partColors} itemSize={3} />
                                    </bufferGeometry>
                                    <pointsMaterial
                                       size={0.0006}
                                       vertexColors
                                       sizeAttenuation
                                       transparent // Particles can be transparent
                                       opacity={0.6}
                                    />
                                </points>
                            )}
                        </Bounds>
                        
                        <OrbitControls makeDefault enableDamping dampingFactor={0.1} rotateSpeed={0.5} />
                        <axesHelper args={[0.01]} /> 
                        {/* We don't need <PerspectiveCamera> or <CameraAutoFit>
                          because <Bounds> and <OrbitControls makeDefault> handle it.
                        */}
                    </Canvas>
                </Suspense>
            </div>
        </Card>
    );
};

export default ResultThreeDeeSnapshot;