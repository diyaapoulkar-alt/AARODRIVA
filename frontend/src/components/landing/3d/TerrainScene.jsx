import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { SCENE_CONFIG, HOTSPOTS } from "../config/sceneConfig";
import FloodBasinTerrain from "./FloodBasinTerrain";
import HazardHotspot from "./HazardHotspot";
import RescueArc from "./RescueArc";

function CameraRig({ scrollProgress, reducedMotion }) {
  const { camera, pointer } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 7.5, 11.5));

  useFrame(({ clock }) => {
    const t = reducedMotion ? 0 : clock.getElapsedTime() * SCENE_CONFIG.camera.orbitSpeed;
    // Scroll drives altitude: Orbital -> Tactical Tilt -> Basin Lock
    const y = THREE.MathUtils.lerp(7.8, 4.4, Math.min(1, scrollProgress * 2.2));
    const z = THREE.MathUtils.lerp(11.5, 8.2, Math.min(1, scrollProgress * 2.2));
    const px = reducedMotion ? 0 : pointer.x * SCENE_CONFIG.camera.parallaxStrength;
    const py = reducedMotion ? 0 : pointer.y * 0.45;

    targetPos.current.set(Math.sin(t) * 1.4 + px, y + py, z);
    camera.position.lerp(targetPos.current, SCENE_CONFIG.camera.damping);
    camera.lookAt(0, 0.2, 0);
  });

  return null;
}

export default function TerrainScene({ scrollProgress, reducedMotion, selectedHotspot, onSelectHotspot }) {
  const containerRef = useRef(null);
  const [inView, setInView] = useState(true);

  // Pause GPU rendering when hero 3D canvas scrolls off-screen
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.05 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full">
      <Canvas
        dpr={[1, 1.5]}
        frameloop={inView ? "always" : "demand"}
        camera={{ position: [0, 7.8, 11.5], fov: 42 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={[SCENE_CONFIG.colors.navyBg]} />
        <fog attach="fog" args={[SCENE_CONFIG.colors.navyFog, 12, 28]} />

        <ambientLight intensity={0.6} />
        <directionalLight position={[8, 14, 6]} intensity={1.1} color="#e0f2fe" />
        <pointLight position={[-3, 3, 2]} intensity={1.5} color="#ef4444" distance={8} />
        <pointLight position={[4, 3, -2]} intensity={1.2} color="#10b981" distance={8} />

        <CameraRig scrollProgress={scrollProgress} reducedMotion={reducedMotion} />
        <FloodBasinTerrain />
        <RescueArc />

        {HOTSPOTS.map((h) => (
          <HazardHotspot
            key={h.id}
            hotspot={h}
            isSelected={selectedHotspot?.id === h.id}
            onSelect={onSelectHotspot}
          />
        ))}
      </Canvas>
    </div>
  );
}