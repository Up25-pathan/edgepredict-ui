import React, { useRef, useEffect, memo, useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import Card from '../common/Card';

// Memoize the component to prevent unnecessary re-renders
const ThreeDeeViewer = memo(() => {
    const mountRef = useRef(null);
    const { metrics } = useSimulation(); // Get live data from our context
    const [scriptsLoaded, setScriptsLoaded] = useState(false); // State to track if scripts are ready

    // Store three.js objects in refs to persist them across renders
    const sceneRef = useRef(new window.THREE.Scene());
    const toolRef = useRef();
    const heatColorRef = useRef(new window.THREE.Color());

    // This effect's job is to wait for the Three.js scripts to load from the CDN.
    useEffect(() => {
        const checkScripts = () => {
            if (window.THREE && window.THREE.OrbitControls) {
                setScriptsLoaded(true);
            } else {
                // If not loaded, check again shortly
                setTimeout(checkScripts, 100);
            }
        };
        checkScripts();
    }, []);

    // This effect sets up the entire 3D scene, but ONLY after scriptsLoaded is true.
    useEffect(() => {
        // Don't run if scripts aren't ready or if the component isn't mounted
        if (!scriptsLoaded || !mountRef.current) {
            return;
        }

        const currentMount = mountRef.current;
        const scene = sceneRef.current;
        scene.background = new window.THREE.Color(0x161B22); // hud-surface

        const camera = new window.THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.set(5, 5, 10);

        const renderer = new window.THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        currentMount.appendChild(renderer.domElement);

        const ambientLight = new window.THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);
        const directionalLight = new window.THREE.DirectionalLight(0xffffff, 0.9);
        directionalLight.position.set(10, 15, 5);
        scene.add(directionalLight);

        // Tool (Cylinder)
        const toolGeometry = new window.THREE.CylinderGeometry(0.5, 0.5, 6, 32);
        toolGeometry.setAttribute('color', new window.THREE.BufferAttribute(new Float32Array(toolGeometry.attributes.position.count * 3), 3));
        const toolMaterial = new window.THREE.MeshStandardMaterial({
            metalness: 0.9,
            roughness: 0.3,
            vertexColors: true
        });
        const tool = new window.THREE.Mesh(toolGeometry, toolMaterial);
        toolRef.current = tool;
        scene.add(tool);

        // Workpiece (Box)
        const workpieceGeometry = new window.THREE.BoxGeometry(10, 2, 4);
        const workpieceMaterial = new window.THREE.MeshStandardMaterial({ color: 0x8B949E });
        const workpiece = new window.THREE.Mesh(workpieceGeometry, workpieceMaterial);
        workpiece.position.y = -4;
        scene.add(workpiece);
        
        const controls = new window.THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        let animationFrameId;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
             if (currentMount) {
                camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
            if (currentMount && renderer.domElement) {
                currentMount.removeChild(renderer.domElement);
            }
        };
    }, [scriptsLoaded]); // The key change: this effect depends on the scripts being loaded.

    // This separate effect handles the dynamic updates (heat map, animation)
    useEffect(() => {
        const tool = toolRef.current;
        if (!tool) return;

        // ... (The heat map and animation logic remains exactly the same)
        const time = Date.now() * 0.0005;
        tool.position.x = Math.sin(time) * 4;
        tool.position.z = Math.cos(time * 0.5) * 1.5;
        tool.rotation.y += 0.1;
        
        const heatColor = heatColorRef.current;
        const maxTemp = 500;
        const tempRatio = Math.min(metrics.temp / maxTemp, 1.0);
        heatColor.setHSL(0.7 - (tempRatio * 0.7), 1.0, 0.5);
        
        const colors = tool.geometry.attributes.color;
        const positions = tool.geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            if (positions.getY(i) < -2.8) {
                colors.setXYZ(i, heatColor.r, heatColor.g, heatColor.b);
            } else {
                 colors.setXYZ(i, 0.6, 0.6, 0.65);
            }
        }
        colors.needsUpdate = true;

    }, [metrics]);

    return (
        <Card className="h-[600px] flex flex-col p-0">
            <div ref={mountRef} className="w-full h-full rounded-lg overflow-hidden"></div>
        </Card>
    );
});

export default ThreeDeeViewer;

