import React, { useState, useEffect, Suspense, useMemo, useRef } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import api from '../../services/api'; //

// -------------------------------------------------------------------
// ---                "SMART" R&D RENDER COMPONENTS                ---
// --- (These are the new components for the "milling" strategy) ---
// -------------------------------------------------------------------

/**
 * Loads the tool model (STL) and applies the 3D heat map
 */
function RndToolModel({ toolFileUrl, nodeData }) {
    const [token] = useState(localStorage.getItem('accessToken'));
    const geometry = useLoader(STLLoader, toolFileUrl, (loader) => {
        loader.setRequestHeader('Authorization', `Bearer ${token}`);
    });

    const meshRef = useRef();

    // This is the "Smart" R&D part: Apply the heat/wear map
    const heatMapColors = useMemo(() => {
        if (!geometry || !nodeData || nodeData.length === 0) return null;

        const vertices = geometry.attributes.position.array;
        const colors = new Float32Array(vertices.length);
        const color = new THREE.Color();

        let minTemp = 25;
        let maxTemp = 25;
        maxTemp = Math.max(...nodeData.map(n => n.temperature_C));
        if (maxTemp <= minTemp) maxTemp = minTemp + 100; // Avoid division by zero
        
        // This is a slow O(N*M) loop. A production version would use a k-d tree.
        for (let i = 0; i < vertices.length / 3; i++) {
            const x = vertices[i * 3];
            const y = vertices[i * 3 + 1];
            const z = vertices[i * 3 + 2];
            
            let closestNode = null;
            let minD = Infinity;

            for(const node of nodeData) {
                // nodeData is in METERS, STL mesh is in MILLIMETERS
                const nx = node.position[0] * 1000;
                const ny = node.position[1] * 1000;
                const nz = node.position[2] * 1000;
                
                const dist = Math.sqrt(Math.pow(x - nx, 2) + Math.pow(y - ny, 2) + Math.pow(z - nz, 2));
                
                if (dist < minD) {
                    minD = dist;
                    closestNode = node;
                }
            }

            let temp = 25;
            if (closestNode && minD < 1.0) { // Only color if node is within 1mm
                temp = closestNode.temperature_C;
            }

            const gradient = (temp - minTemp) / (maxTemp - minTemp);
            color.setHSL(0.7 * (1 - gradient), 1.0, 0.5); // Blue (0.7) to Red (0.0)

            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }
        return colors;
    }, [geometry, nodeData]);

    useEffect(() => {
        if (heatMapColors) {
            geometry.setAttribute('color', new THREE.BufferAttribute(heatMapColors, 3));
            geometry.computeVertexNormals(); // Recalculate normals for correct lighting
        }
    }, [geometry, heatMapColors]);

    return (
        <mesh ref={meshRef} geometry={geometry}>
            <meshStandardMaterial vertexColors={true} side={THREE.DoubleSide} />
        </mesh>
    );
}

/**
 * Renders the SPH particles (chips and workpiece)
 */
function SphParticles({ particleFrame }) {
    const meshRef = useRef();
    const dummy = useMemo(() => new THREE.Object3D(), []);
    
    useEffect(() => {
        if (!particleFrame || !meshRef.current) return;

        const chipColor = new THREE.Color(0xff0000); // Red
        const workpieceColor = new THREE.Color(0xaaaaaa); // Gray
        
        let i = 0;
        for (const p of particleFrame) {
            if (i >= meshRef.current.count) break; // Don't overflow
            
            const [x, y, z] = p.position;
            dummy.position.set(x, y, z);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
            
            const color = (p.status === "chip") ? chipColor : workpieceColor;
            meshRef.current.setColorAt(i, color);
            i++;
        }
        
        // Hide unused instances
        for (let j = i; j < meshRef.current.count; j++) {
            dummy.position.set(0, 0, 0);
            dummy.scale.set(0,0,0); // Hide it
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(j, dummy.matrix);
        }

        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) {
            meshRef.current.instanceColor.needsUpdate = true;
        }

    }, [particleFrame, dummy]);

    const particleGeometry = new THREE.BoxGeometry(0.0001, 0.0001, 0.0001); // 0.1mm
    const maxParticles = 50000; // Max particles to render

    return (
        <instancedMesh ref={meshRef} args={[particleGeometry, null, maxParticles]}>
            <meshStandardMaterial vertexColors />
        </instancedMesh>
    );
}

/**
 * Main 3D scene for R&D (Milling)
 */
const RndScene = ({ toolFileUrl, nodeData, particleFrame }) => {
    return (
        <>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1.5} />
            <OrbitControls />
            
            <Suspense fallback={null}>
                <RndToolModel toolFileUrl={toolFileUrl} nodeData={nodeData} />
            </Suspense>
            
            {particleFrame && <SphParticles particleFrame={particleFrame} />}
            
            <gridHelper args={[0.2, 20]} position={[0, -0.05, 0]} />
        </>
    );
};

// -------------------------------------------------------------------
// ---                "LEGACY" CFD RENDER COMPONENTS             ---
// --- (This is your original code for the "turning" strategy)   ---
// -------------------------------------------------------------------

function CfdParticles({ cfdData }) {
    // This is your original particle logic, slightly adapted
    const meshRef = useRef();
    const [frame, setFrame] = useState(0);

    useEffect(() => {
        const anim = () => {
            setFrame(f => (f + 1) % cfdData.length);
            requestAnimationFrame(anim);
        };
        if (cfdData && cfdData.length > 0) {
            const animId = requestAnimationFrame(anim);
            return () => cancelAnimationFrame(animId);
        }
    }, [cfdData]);

    const dummy = useMemo(() => new THREE.Object3D(), []);
    const particleGeometry = new THREE.BoxGeometry(0.0001, 0.0001, 0.0001);
    const maxParticles = 5000; // Max particles for legacy

    useEffect(() => {
        if (!cfdData || cfdData.length === 0 || !meshRef.current) return;

        const particleFrame = cfdData[frame]?.particles || [];
        const color = new THREE.Color();
        let i = 0;
        for (const p of particleFrame) {
            if (i >= maxParticles) break;
            dummy.position.set(p.position[0], p.position[1], p.position[2]);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
            
            // Color by temperature (blue to red)
            const gradient = Math.min(Math.max(p.temperature / 1000.0, 0), 1);
            color.setHSL(0.7 * (1 - gradient), 1.0, 0.5);
            meshRef.current.setColorAt(i, color);
            i++;
        }
        for (let j = i; j < maxParticles; j++) {
            dummy.scale.set(0,0,0);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(j, dummy.matrix);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) {
            meshRef.current.instanceColor.needsUpdate = true;
        }

    }, [frame, cfdData, dummy]);
    
    return (
        <instancedMesh ref={meshRef} args={[particleGeometry, null, maxParticles]}>
            <meshStandardMaterial vertexColors />
        </instancedMesh>
    );
}

// -------------------------------------------------------------------
// ---                MAIN "SMART" VIEWER COMPONENT              ---
// -------------------------------------------------------------------

const ThreeDeeViewer = ({ machiningType, vizData, nodeData, toolFileUrl }) => {
    
    if (machiningType === 'milling') {
        // --- R&D "MILLING" RENDER ---
        const [isPlaying, setIsPlaying] = useState(false);
        const [currentFrame, setCurrentFrame] = useState(0);
        
        const animationFrames = vizData || [];
        const totalFrames = animationFrames.length;
        const particleFrame = (animationFrames[currentFrame] && animationFrames[currentFrame].particles) 
            ? animationFrames[currentFrame].particles 
            : [];
        
        useEffect(() => {
            if (isPlaying && totalFrames > 0) {
                const interval = setInterval(() => {
                    setCurrentFrame((f) => {
                        const nextFrame = f + 1;
                        if (nextFrame >= totalFrames) {
                            setIsPlaying(false);
                            return 0; // Loop back
                        }
                        return nextFrame;
                    });
                }, 50); // ~20 FPS
                return () => clearInterval(interval);
            }
        }, [isPlaying, totalFrames]);

        const handleSliderChange = (e) => {
            setIsPlaying(false);
            setCurrentFrame(parseInt(e.target.value, 10));
        };

        if (totalFrames === 0) {
            return (
                <div className="text-gray-400 p-4 text-center">
                    No 3D animation data found. (This R&D simulation may not have produced chips).
                </div>
            );
        }

        return (
            <div className="w-full h-full flex flex-col">
                <div className="flex-grow h-full w-full">
                    <Canvas camera={{ position: [0.05, 0.05, 0.05], fov: 50 }}>
                        <RndScene 
                            toolFileUrl={toolFileUrl} 
                            nodeData={nodeData}
                            particleFrame={particleFrame}
                        />
                    </Canvas>
                </div>
                <div className="flex-shrink-0 p-4 bg-gray-900 border-t border-gray-800 flex items-center space-x-4">
                    <button onClick={() => setIsPlaying(!isPlaying)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg">
                        {isPlaying ? 'Pause' : 'Play'}
                    </button>
                    <input 
                        type="range" 
                        min="0" 
                        max={totalFrames - 1} 
                        value={currentFrame}
                        onChange={handleSliderChange}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-white text-sm font-mono w-24 text-right">
                        {currentFrame} / {totalFrames > 0 ? totalFrames - 1 : 0}
                    </span>
                </div>
            </div>
        );
    } 
    
    else {
        // --- LEGACY "TURNING" RENDER ---
        // This is your original CFD viewer logic
        return (
             <div className="w-full h-full flex flex-col">
                <div className="flex-grow h-full w-full">
                    <Canvas camera={{ position: [0.005, 0.002, 0.01], fov: 30 }}>
                        <ambientLight intensity={0.7} />
                        <directionalLight position={[5, 5, 5]} intensity={1.0} />
                        <OrbitControls />
                        
                        {/* We can still show the heat map for turning! */}
                        <Suspense fallback={null}>
                           {toolFileUrl && nodeData && <RndToolModel toolFileUrl={toolFileUrl} nodeData={nodeData} />}
                        </Suspense>
                        
                        {/* And we show the legacy CFD particles */}
                        {vizData && <CfdParticles cfdData={vizData} />}
                        
                        <gridHelper args={[0.02, 10]} position={[0, -0.005, 0]} />
                    </Canvas>
                </div>
                <div className="flex-shrink-0 p-4 bg-gray-900 border-t border-gray-800 flex items-center">
                    <p className="text-sm text-gray-400">Legacy CFD View: Animating particle flow.</p>
                </div>
            </div>
        );
    }
};

export default ThreeDeeViewer;