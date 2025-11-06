import React, { useMemo, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const CameraAutoFit = ({ bounds }) => {
    const { camera, controls } = useThree();
    const mounted = useRef(false);
    useEffect(() => {
        if (bounds && !bounds.isEmpty() && controls && !mounted.current) {
            mounted.current = true;
            const center = new THREE.Vector3();
            bounds.getCenter(center);
            const size = new THREE.Vector3();
            bounds.getSize(size);
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / 2 * Math.tan(fov * 2)) * 1.5;
            cameraZ = Math.max(cameraZ, 0.1);
            camera.position.set(center.x, center.y + maxDim * 0.5, center.z + cameraZ);
            camera.lookAt(center);
            controls.target.copy(center);
            controls.update();
        }
    }, [bounds, camera, controls]);
    return null;
};

const ResultThreeDeeSnapshot = ({ nodeData, particleData }) => {
    const { toolPositions, toolColors, partPositions, partColors, bounds } = useMemo(() => {
        const bbox = new THREE.Box3();
        const colorHelper = new THREE.Color();
        let tPos = new Float32Array(0), tCol = new Float32Array(0);
        if (nodeData && nodeData.length > 0) {
            tPos = new Float32Array(nodeData.length * 3);
            tCol = new Float32Array(nodeData.length * 3);
            let maxStress = 0;
            for (let i = 0; i < nodeData.length; i++) maxStress = Math.max(maxStress, nodeData[i].stress_MPa);
            maxStress = Math.max(maxStress, 1.0);
            for (let i = 0; i < nodeData.length; i++) {
                const node = nodeData[i];
                const idx = i * 3;
                const x = node.position[0] !== undefined ? node.position[0] : node.position.x;
                const y = node.position[1] !== undefined ? node.position[1] : node.position.y;
                const z = node.position[2] !== undefined ? node.position[2] : node.position.z;
                tPos[idx] = x; tPos[idx+1] = y; tPos[idx+2] = z;
                bbox.expandByPoint(new THREE.Vector3(x, y, z));
                const t = Math.min(1.0, Math.max(0.0, node.stress_MPa / maxStress));
                colorHelper.setHSL(0.66 - (t * 0.66), 1.0, 0.5);
                tCol[idx] = colorHelper.r; tCol[idx+1] = colorHelper.g; tCol[idx+2] = colorHelper.b;
            }
        }
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

    if ((!nodeData || nodeData.length === 0) && (!particleData || particleData.length === 0)) return null;

    return (
        <Canvas className="h-full w-full min-h-[500px]">
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} intensity={0.8} />
            <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} near={0.0001} far={1000} />
            <OrbitControls makeDefault />
            <CameraAutoFit bounds={bounds} />
            <axesHelper args={[0.01]} />
            {toolPositions.length > 0 && (
                <points>
                    <bufferGeometry>
                        <bufferAttribute attach="attributes-position" count={toolPositions.length / 3} array={toolPositions} itemSize={3} />
                        <bufferAttribute attach="attributes-color" count={toolColors.length / 3} array={toolColors} itemSize={3} />
                    </bufferGeometry>
                    <pointsMaterial size={0.0005} vertexColors sizeAttenuation={true} transparent={true} opacity={0.3} />
                </points>
            )}
            {partPositions.length > 0 && (
                <points>
                    <bufferGeometry>
                        <bufferAttribute attach="attributes-position" count={partPositions.length / 3} array={partPositions} itemSize={3} />
                        <bufferAttribute attach="attributes-color" count={partColors.length / 3} array={partColors} itemSize={3} />
                    </bufferGeometry>
                    <pointsMaterial
                     size={0.0008}           // Slightly larger than 0.0005
                     vertexColors
                     sizeAttenuation={true}
                     transparent={true}
                     opacity={0.6}           // More opaque (was 0.3)
                    />
                </points>
            )}
        </Canvas>
    );
};
export default ResultThreeDeeSnapshot;
