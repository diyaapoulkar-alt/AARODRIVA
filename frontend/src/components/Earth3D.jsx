import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { AlertTriangle, Radio, ShieldCheck, LifeBuoy } from "lucide-react";

export default function Earth3D() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // Drag interaction states for 360-degree rotation
  const isDraggingRef = useRef(false);
  const previousPointerPosition = useRef({ x: 0, y: 0 });
  const dragRotationRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let animationFrameId;

    try {
      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
      camera.position.set(0, 0, 8.8);

      const globe = new THREE.Group();
      scene.add(globe);

      // Textures & Earth Mesh
      const textureLoader = new THREE.TextureLoader();
      const earthMat = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        shininess: 14,
        specular: 0x245073,
      });

      // Load official high-res Earth texture with fallback color
      textureLoader.load(
        "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg",
        (t) => {
          t.colorSpace = THREE.SRGBColorSpace;
          earthMat.map = t;
          earthMat.needsUpdate = true;
        },
        undefined,
        () => {
          earthMat.color.set(0x184872);
        }
      );

      textureLoader.load(
        "https://threejs.org/examples/textures/planets/earth_normal_2048.jpg",
        (t) => {
          earthMat.normalMap = t;
          earthMat.normalScale.set(0.35, 0.35);
          earthMat.needsUpdate = true;
        }
      );

      const earth = new THREE.Mesh(new THREE.SphereGeometry(2.15, 72, 72), earthMat);
      globe.add(earth);

      // Outer Atmosphere Layer
      const atmosphere = new THREE.Mesh(
        new THREE.SphereGeometry(2.21, 64, 64),
        new THREE.MeshBasicMaterial({
          color: 0x2eaaff,
          transparent: true,
          opacity: 0.12,
          side: THREE.BackSide,
        })
      );
      globe.add(atmosphere);

      // Atmospheric Fresnel Glow Shader
      const glowMat = new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          glowColor: { value: new THREE.Color(0x168bff) },
        },
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          uniform vec3 glowColor;
          void main() {
            float a = pow(1.0 - abs(vNormal.z), 3.0) * 0.55;
            gl_FragColor = vec4(glowColor, a);
          }
        `,
      });
      const glow = new THREE.Mesh(new THREE.SphereGeometry(2.38, 64, 64), glowMat);
      scene.add(glow);

      // Lighting: Ambient + Sunlight + Back Rim Light
      scene.add(new THREE.AmbientLight(0x638eb7, 1.4));
      const sun = new THREE.DirectionalLight(0xe1f5ff, 3.2);
      sun.position.set(-3, 3, 5);
      scene.add(sun);
      const rim = new THREE.PointLight(0x007bff, 55);
      rim.position.set(3, -1, -3);
      scene.add(rim);

      // Orbital Rings
      const orbitMat = new THREE.LineBasicMaterial({
        color: 0x2eace7,
        transparent: true,
        opacity: 0.3,
      });
      for (let j = 0; j < 2; j++) {
        const pts = [];
        for (let i = 0; i <= 180; i++) {
          const a = (i / 180) * Math.PI * 2;
          pts.push(new THREE.Vector3(Math.cos(a) * 3.15, Math.sin(a) * 3.15, 0));
        }
        const line = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(pts),
          orbitMat
        );
        line.rotation.set(0.5 + j * 0.7, 0.2 + j * 0.8, -0.38 + j * 0.4);
        scene.add(line);
      }

      // Satellite Object (Body + Solar Wings)
      const satellite = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.19, 0.13, 0.22),
        new THREE.MeshStandardMaterial({
          color: 0xd4e9ef,
          metalness: 0.8,
          roughness: 0.25,
        })
      );
      satellite.add(body);

      const panelMat = new THREE.MeshStandardMaterial({
        color: 0x226ca4,
        metalness: 0.7,
        roughness: 0.25,
        emissive: 0x0a4070,
        emissiveIntensity: 0.35,
      });
      [-1, 1].forEach((side) => {
        const p = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.018, 0.14), panelMat);
        p.position.x = side * 0.29;
        satellite.add(p);
      });
      scene.add(satellite);

      // Radar Scanning Cone Beam
      const beam = new THREE.Mesh(
        new THREE.ConeGeometry(0.42, 1.6, 32, 1, true),
        new THREE.MeshBasicMaterial({
          color: 0x00d9ff,
          transparent: true,
          opacity: 0.08,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      );
      scene.add(beam);

      // Tactical Disaster Markers & Pulsing Rings
      const markerGroup = new THREE.Group();
      globe.add(markerGroup);
      const hotspotPoints = [
        [0.55, 0.86, 1.85, 0x00d9ff], // Brahmaputra Basin / Assam
        [-1.2, 0.58, 1.8, 0xff4545], // Active Red Alert Locus
        [1.45, -0.33, 1.55, 0x00d9ff], // Global Basin Monitor
        [-0.7, -0.8, 1.85, 0x25e69a], // Safe High-Ground Extraction
      ];
      hotspotPoints.forEach(([x, y, z, color]) => {
        const m = new THREE.Mesh(
          new THREE.SphereGeometry(0.04, 12, 12),
          new THREE.MeshBasicMaterial({ color })
        );
        m.position.set(x, y, z);
        markerGroup.add(m);

        const ring = new THREE.Mesh(
          new THREE.RingGeometry(0.08, 0.13, 24),
          new THREE.MeshBasicMaterial({
            color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.75,
          })
        );
        ring.position.set(x, y, z);
        ring.lookAt(0, 0, 0);
        markerGroup.add(ring);
      });

      // Space Dust & Orbiting Stars Particles
      const count = 180;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = 2.8 + Math.random() * 2.5;
        positions[i * 3] = Math.cos(a) * r;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 5.2;
        positions[i * 3 + 2] = Math.sin(a) * r;
      }
      const particles = new THREE.Points(
        new THREE.BufferGeometry(),
        new THREE.PointsMaterial({
          color: 0x61caff,
          size: 0.024,
          transparent: true,
          opacity: 0.55,
        })
      );
      particles.geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
      scene.add(particles);

      // Resize handler
      const handleResize = () => {
        if (!container) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      handleResize();
      window.addEventListener("resize", handleResize);

      // Render & Animation Loop
      const clock = new THREE.Clock();
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        // Base continuous rotation + drag offset
        const baseAngle = t * 0.27;
        globe.rotation.y = baseAngle + dragRotationRef.current.x + 0.55;
        globe.rotation.x = dragRotationRef.current.y;
        globe.rotation.z = -0.13;

        particles.rotation.y = t * 0.012;

        // Satellite smooth orbital transition
        const satAngle = t * 0.43;
        satellite.position.set(
          Math.cos(satAngle) * 3.12,
          Math.sin(satAngle) * 1.48,
          Math.sin(satAngle) * 2.12
        );
        satellite.rotation.z = satAngle;

        // Scanner Beam aiming back at Earth center
        beam.position.copy(satellite.position).multiplyScalar(0.78);
        beam.lookAt(0, 0, 0);
        beam.rotateX(Math.PI / 2);
        beam.material.opacity = 0.045 + Math.sin(t * 3) * 0.025;

        renderer.render(scene, camera);
      };
      animate();

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener("resize", handleResize);
        renderer.dispose();
      };
    } catch (e) {
      console.warn("[Earth3D] WebGL initialization fallback:", e);
    }
  }, []);

  // Pointer drag controls for smooth 360-degree rotation
  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    previousPointerPosition.current = {
      x: e.clientX || (e.touches && e.touches[0].clientX) || 0,
      y: e.clientY || (e.touches && e.touches[0].clientY) || 0,
    };
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

    const deltaX = clientX - previousPointerPosition.current.x;
    const deltaY = clientY - previousPointerPosition.current.y;

    dragRotationRef.current.x += deltaX * 0.007;
    dragRotationRef.current.y = Math.max(
      -0.8,
      Math.min(0.8, dragRotationRef.current.y + deltaY * 0.007)
    );

    previousPointerPosition.current = { x: clientX, y: clientY };
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
      className="relative w-full h-full min-h-[480px] lg:min-h-[640px] select-none cursor-grab active:cursor-grabbing flex items-center justify-end overflow-visible"
    >
      {/* Three.js Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Floating Tactical HUD Card 1: FLOOD RISK (Top Right) */}
      <div className="absolute top-[16%] right-[8%] z-10 p-3 sm:p-3.5 rounded-xl bg-[#09172bc0] border border-rose-500/40 backdrop-blur-md shadow-2xl animate-float-3d pointer-events-none">
        <small className="block text-[9px] font-mono tracking-widest text-slate-400 font-bold">
          FLOOD RISK
        </small>
        <div className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <strong className="text-base sm:text-lg font-black text-rose-400 tracking-wider">
            HIGH
          </strong>
        </div>
      </div>

      {/* Floating Tactical HUD Card 2: AFFECTED SETTLEMENTS (Right Middle) */}
      <div
        className="absolute top-[44%] right-[2%] z-10 p-3 sm:p-3.5 rounded-xl bg-[#09172bc0] border border-cyan-500/40 backdrop-blur-md shadow-2xl animate-float-3d pointer-events-none"
        style={{ animationDelay: "-2s" }}
      >
        <small className="block text-[9px] font-mono tracking-widest text-slate-400 font-bold">
          AFFECTED SETTLEMENTS
        </small>
        <strong className="text-xl sm:text-2xl font-black text-cyan-400 tracking-tight mt-1 block">
          24
        </strong>
      </div>

      {/* Floating Tactical HUD Card 3: ACTIVE SOS (Bottom Center-Right) */}
      <div
        className="absolute bottom-[20%] right-[32%] z-10 p-3 sm:p-3.5 rounded-xl bg-[#09172bc0] border border-amber-500/40 backdrop-blur-md shadow-2xl animate-float-3d pointer-events-none hidden sm:block"
        style={{ animationDelay: "-3s" }}
      >
        <small className="block text-[9px] font-mono tracking-widest text-slate-400 font-bold">
          ACTIVE SOS
        </small>
        <strong className="text-xl sm:text-2xl font-black text-amber-400 tracking-tight mt-1 block">
          18
        </strong>
      </div>

      {/* Floating Tactical HUD Card 4: RESCUE OPERATIONS (Bottom Right) */}
      <div
        className="absolute bottom-[16%] right-[6%] z-10 p-3 sm:p-3.5 rounded-xl bg-[#09172bc0] border border-emerald-500/40 backdrop-blur-md shadow-2xl animate-float-3d pointer-events-none"
        style={{ animationDelay: "-1s" }}
      >
        <small className="block text-[9px] font-mono tracking-widest text-slate-400 font-bold">
          RESCUE OPERATIONS
        </small>
        <strong className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight mt-1 block">
          07
        </strong>
      </div>

      {/* Bottom Subtitle Caption */}
      <div className="absolute bottom-4 right-10 text-[10px] font-mono text-cyan-400/80 tracking-widest uppercase pointer-events-none">
        360° Real-Time Orbit · Drag to Inspect
      </div>
    </div>
  );
}
