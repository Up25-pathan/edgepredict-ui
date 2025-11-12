import React, { useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Bounds, Environment, GizmoHelper, GizmoViewport, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { Loader2 } from 'lucide-react';

const ResultThreeDeeSnapshot = ({ nodeData, meshIndices, particleData }) => {
    const { geometry, partPositions, partColors } = useMemo(() => {
        if (!nodeData || nodeData.length === 0) return {};

        // --- 1. Build Solid Mesh Geometry ---
        const geom = new THREE.BufferGeometry();
        
        const positions = new Float32Array(nodeData.length * 3);
        const colors = new Float32Array(nodeData.length * 3);
        const color = new THREE.Color();

        let maxStress = 0.001;
        for (let i = 0; i < nodeData.length; i++) maxStress = Math.max(maxStress, nodeData[i].stress_MPa || 0);

        for (let i = 0; i < nodeData.length; i++) {
            const idx = i * 3;
            const node = nodeData[i];
            positions[idx] = node.position[0];
            positions[idx+1] = node.position[1];
            positions[idx+2] = node.position[2];

            // "Turbo" gradient: Blue(0 stress) -> Green -> Red(max stress)
            const t = Math.min(1.0, Math.max(0.0, (node.stress_MPa || 0) / maxStress));
            color.setHSL(0.66 * (1.0 - t), 1.0, 0.5);
            colors[idx] = color.r; colors[idx+1] = color.g; colors[idx+2] = color.b;
        }

        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        // IF we have indices from the new engine, use them for a solid mesh
        if (meshIndices && meshIndices.length > 0) {
            geom.setIndex(meshIndices);
            geom.computeVertexNormals(); // Makes it look smooth and shiny
        }

        // --- 2. Build CFD Particles ---
        let pPos = new Float32Array(0), pCol = new Float32Array(0);
        if (particleData && particleData.length > 0) {
            pPos = new Float32Array(particleData.length * 3);
            pCol = new Float32Array(particleData.length * 3);
            for (let i = 0; i < particleData.length; i++) {
                const idx = i * 3; const p = particleData[i];
                pPos[idx] = p.position[0]; pPos[idx+1] = p.position[1]; pPos[idx+2] = p.position[2];
                const t = Math.min(1.0, (p.temperature || 500) / 1500.0);
                color.setHSL(0.15, 1.0, 0.7 + (t * 0.3)); // White/Yellow hot particles
                pCol[idx] = color.r; pCol[idx+1] = color.g; pCol[idx+2] = color.b;
            }
        }

        return { geometry: geom, partPositions: pPos, partColors: pCol };
    }, [nodeData, meshIndices, particleData]);

    if (!geometry) return <div className="h-full flex items-center justify-center bg-gray-950 text-gray-500"><Loader2 className="w-8 h-8 animate-spin" /></div>;

    return (
        <Canvas className="bg-gray-950" camera={{ position: [5, 5, 5], fov: 40 }} dpr={[1, 2]}>
            <color attach="background" args={['#09090b']} />
            <Suspense fallback={null}>
                <Bounds fit clip observe margin={1.0}>
                    <group>
                        {/* RENDER SOLID MESH IF INDICES EXIST, ELSE FALLBACK TO POINTS */}
                        {meshIndices && meshIndices.length > 0 ? (
                            <mesh geometry={geometry}>
                                <meshStandardMaterial vertexColors metalness={0.3} roughness={0.4} side={THREE.DoubleSide} />
                            </mesh>
                        ) : (
                            <points geometry={geometry}>
                                <pointsMaterial size={0.005} vertexColors sizeAttenuation={true} />
                            </points>
                        )}

                        {/* CFD PARTICLES */}
                        {partPositions.length > 0 && (
                            <points>
                                <bufferGeometry>
                                    <bufferAttribute attach="attributes-position" count={partPositions.length / 3} array={partPositions} itemSize={3} />
                                    <bufferAttribute attach="attributes-color" count={partColors.length / 3} array={partColors} itemSize={3} />
                                </bufferGeometry>
                                <pointsMaterial size={0.008} vertexColors transparent opacity={0.8} />
                            </points>
                        )}
                    </group>
                </Bounds>
                <Grid infiniteGrid fadeDistance={50} cellColor="#3f3f46" sectionColor="#6366f1" />
                <OrbitControls makeDefault autoRotate autoRotateSpeed={0.5} minPolarAngle={0} maxPolarAngle={Math.PI} />
                <Environment preset="warehouse" />
                <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
                    <GizmoViewport />
                </GizmoHelper>
            </Suspense>
        </Canvas>
    );
};

export default ResultThreeDeeSnapshot;