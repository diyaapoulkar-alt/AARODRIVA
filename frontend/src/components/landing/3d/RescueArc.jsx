import React, { useMemo } from "react";
import * as THREE from "three";
import { Line } from "@react-three/drei";

export default function RescueArc() {
  const points = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.4, 0.4, 1.8),  // SOS-104
      new THREE.Vector3(-0.6, 1.3, 2.3),  // Bypass south of blocked NH-27
      new THREE.Vector3(2.1, 1.8, 0.3),   // Mid-arc elevation
      new THREE.Vector3(4.2, 1.5, -2.1),  // Cotton Relief Camp
    ]);
    return curve.getPoints(40);
  }, []);

  return (
    <Line
      points={points}
      color="#10b981"
      lineWidth={2.5}
      dashed
      dashSize={0.35}
      gapSize={0.2}
    />
  );
}