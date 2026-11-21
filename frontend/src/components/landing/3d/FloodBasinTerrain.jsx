import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { SCENE_CONFIG } from "../config/sceneConfig";

export default function FloodBasinTerrain() {
  const waterRef = useRef();
  const { size, segments, waterLevel } = SCENE_CONFIG.terrain;

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const colors = [];
    const cLow = new THREE.Color("#071525");
    const cMid = new THREE.Color("#0ea5e9");
    const cHigh = new THREE.Color("#10b981");

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Procedural river valley + safe eastern ridge
      const valley = -Math.exp(-((x + 1.8) ** 2 + (z - 0.5) ** 2) / 18) * 1.4;
      const ridge = Math.exp(-((x - 4.5) ** 2 + (z + 2.2) ** 2) / 14) * 1.9;
      const ripples = Math.sin(x * 0.55) * Math.cos(z * 0.55) * 0.35;
      const y = valley + ridge + ripples;

      pos.setY(i, y);

      // Elevation-based color ramp using existing theme tokens
      const color = new THREE.Color();
      if (y < waterLevel + 0.15) {
        color.copy(cLow).lerp(cMid, 0.35);
      } else if (y < 0.75) {
        color.copy(cMid).lerp(cLow, 0.65);
      } else {
        color.copy(cMid).lerp(cHigh, Math.min(1, (y - 0.6) / 1.1));
      }
      colors.push(color.r, color.g, color.b);
    }

    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, [size, segments, waterLevel]);

  useFrame(({ clock }) => {
    if (waterRef.current) {
      waterRef.current.position.y = waterLevel + Math.sin(clock.getElapsedTime() * 1.1) * 0.04;
    }
  });

  return (
    <group>
      {/* Solid Elevation Terrain */}
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.85} metalness={0.15} flatShading />
      </mesh>

      {/* Topographic Contour Wireframe Overlay */}
      <mesh geometry={geometry} position={[0, 0.02, 0]}>
        <meshBasicMaterial color="#0ea5e9" wireframe transparent opacity={0.16} />
      </mesh>

      {/* Translucent Animated Flood Inundation Plane */}
      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, waterLevel, 0]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial
          color="#0ea5e9"
          emissive="#0284c7"
          emissiveIntensity={0.25}
          transparent
          opacity={0.34}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}