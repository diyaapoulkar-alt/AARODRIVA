import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";

/**
 * Interactive 3D beacon for SOS, Flood Zones, Blocked Roads, and Relief Camps.
 */
export default function HazardHotspot({ hotspot, isSelected, onSelect }) {
  const ringRef = useRef();
  const [hovered, setHovered] = useState(false);
  const isCritical = hotspot.type === "SOS";

  useFrame(({ clock }) => {
    if (ringRef.current) {
      const t = clock.getElapsedTime();
      const s = isCritical ? 1 + Math.sin(t * 4) * 0.35 : 1 + Math.sin(t * 1.5) * 0.1;
      ringRef.current.scale.set(s, s, 1);
    }
  });

  return (
    <group position={hotspot.position}>
      {/* Vertical Tactical Beacon Line */}
      <mesh position={[0, isCritical ? 1.1 : 0.7, 0]}>
        <cylinderGeometry args={[0.025, 0.025, isCritical ? 2.2 : 1.4, 8]} />
        <meshBasicMaterial color={hotspot.color} transparent opacity={0.75} />
      </mesh>

      {/* Pulsing Ground Ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
        <ringGeometry args={[0.28, 0.42, 24]} />
        <meshBasicMaterial color={hotspot.color} transparent opacity={0.85} side={2} />
      </mesh>

      {/* Interactive Beacon Head */}
      <mesh
        position={[0, isCritical ? 2.2 : 1.4, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(hotspot);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <octahedronGeometry args={[hovered || isSelected ? 0.26 : 0.2, 0]} />
        <meshStandardMaterial
          color={hotspot.color}
          emissive={hotspot.color}
          emissiveIntensity={hovered || isSelected ? 1.4 : 0.7}
        />
      </mesh>

      {/* Anchored Glassmorphic Callout */}
      <Html position={[0, isCritical ? 2.65 : 1.85, 0]} center distanceFactor={14}>
        <button
          type="button"
          onClick={() => onSelect(hotspot)}
          aria-label={`${hotspot.label}: ${hotspot.title}`}
          className="text-left focus:outline-none focus:ring-2 focus:ring-sky-400 rounded-lg"
        >
          {isSelected || hovered ? (
            <div className="w-56 bg-[#0a1428]/95 backdrop-blur-md border border-slate-700 rounded-xl p-3 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] font-mono font-bold uppercase" style={{ color: hotspot.color }}>
                  {hotspot.label}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                  {hotspot.type}
                </span>
              </div>
              <p className="text-xs font-bold text-white leading-snug">{hotspot.title}</p>
              <p className="text-[11px] text-cyan-300 font-mono mt-1">{hotspot.meta}</p>
              <p className="text-[10px] text-slate-400 mt-1">{hotspot.detail}</p>
            </div>
          ) : (
            <div className="whitespace-nowrap bg-[#0a1428]/90 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-slate-100 shadow-lg">
              <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ background: hotspot.color }} />
              {hotspot.label}
            </div>
          )}
        </button>
      </Html>
    </group>
  );
}