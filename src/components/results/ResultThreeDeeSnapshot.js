import React, { useMemo, Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

const colors = ['#0000ff', '#00ffff', '#00ff00', '#ffff00', '#ff0000'];
const colorGradient = colors.map(c => new THREE.Color(c));

// Component to render a single colored data point (node)
const NodeSphere = ({ position, stress, minStress, maxStress }) => {
    const color = useMemo(() => {
        const stressRatio = (stress - minStress) / (maxStress - minStress);
        const colorIndex = Math.min(Math.floor(stressRatio * (colorGradient.length - 1)), colorGradient.length - 2);
        const t = (stressRatio * (colorGradient.length - 1)) - colorIndex;
        return colorGradient[colorIndex].clone().lerp(colorGradient[colorIndex + 1], t);
    }, [stress, minStress, maxStress]);

    return (
        <mesh position={position}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshBasicMaterial color={color} />
        </mesh>
    );
};

// Component to load and display the semi-transparent STL model
const ToolModel = ({ toolId }) => {
    const [geometry, setGeometry] = useState(null);
    useEffect(() => {
        if (!toolId) return;
        const loader = new STLLoader();
        const toolFileUrl = `http://127.0.0.1:8000/tool-file/${toolId}`;
        loader.load(toolFileUrl, (geo) => {
            geo.computeVertexNormals();
            geo.center();
            setGeometry(geo);
        });
    }, [toolId]);

    if (!geometry) return null;

    return (
        <mesh geometry={geometry}>
            <meshStandardMaterial color="grey" transparent={true} opacity={0.3} />
        </mesh>
    );
};

const ColorLegend = ({ min, max }) => (
    <div style={{ position: 'absolute', bottom: '20px', left: '20px', color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '5px', zIndex: 10 }}>
        <div style={{ fontWeight: 'bold' }}>Stress (MPa)</div>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
            <span>{min.toFixed(0)}</span>
            <div style={{ width: '100px', height: '15px', background: `linear-gradient(to right, ${colors.join(',')})`, margin: '0 10px' }} />
            <span>{max.toFixed(0)}</span>
        </div>
    </div>
);

const ResultThreeDeeSnapshot = ({ simulationData, nodeData }) => {
    const { minStress, maxStress } = useMemo(() => {
        if (!nodeData || nodeData.length === 0) return { minStress: 0, maxStress: 1 };
        const stresses = nodeData.map(n => n.stress_MPa);
        const min = Math.min(...stresses);
        const max = Math.max(...stresses);
        return { minStress: min, maxStress: max > min ? max : min + 1 };
    }, [nodeData]);

    if (!simulationData || !simulationData.tool_id) {
        return <div className="flex items-center justify-center h-full text-gray-400">Tool model not available.</div>;
    }
    
    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <Canvas camera={{ position: [0, 50, 100], fov: 50 }}>
                <Suspense fallback={<Html center>Loading 3D model...</Html>}>
                    <ambientLight intensity={1.5} />
                    <directionalLight position={[100, 100, 100]} intensity={2} />
                    <OrbitControls />
                    
                    {/* Render the transparent tool model */}
                    <ToolModel toolId={simulationData.tool_id} />

                    {/* Render the colored data points */}
                    {nodeData.map((node, index) => (
                        <NodeSphere
                            key={index}
                            position={node.position}
                            stress={node.stress_MPa}
                            minStress={minStress}
                            maxStress={maxStress}
                        />
                    ))}
                </Suspense>
            </Canvas>
            <ColorLegend min={minStress} max={maxStress} />
        </div>
    );
};

export default ResultThreeDeeSnapshot;