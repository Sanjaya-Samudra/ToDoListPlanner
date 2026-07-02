import React, { useRef, useEffect } from "react";
import { View, Platform, StyleSheet } from "react-native";
import * as THREE from "three";

const ThreeBackground = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement("canvas");
    canvas.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;display:block";
    container.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, (container.clientWidth || window.innerWidth) / (container.clientHeight || window.innerHeight), 0.1, 1000);
    camera.position.z = 7;

    const ambient = new THREE.AmbientLight(0x222244, 0.3);
    scene.add(ambient);
    const keyLight = new THREE.DirectionalLight(0x6c63ff, 2.5);
    keyLight.position.set(5, 3, 6);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0x00d2d3, 1.5);
    fillLight.position.set(-4, -2, 4);
    scene.add(fillLight);
    const rimLight = new THREE.DirectionalLight(0xff6584, 1);
    rimLight.position.set(0, -5, -4);
    scene.add(rimLight);

    const group = new THREE.Group();
    scene.add(group);

    const icoGeo = new THREE.IcosahedronGeometry(1.0, 1);
    const icoMat = new THREE.MeshPhysicalMaterial({
      color: 0x6c63ff,
      emissive: 0x6c63ff,
      emissiveIntensity: 0.15,
      metalness: 0.2,
      roughness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transparent: true,
      opacity: 0.3,
      wireframe: false,
      side: THREE.DoubleSide,
    });
    const ico = new THREE.Mesh(icoGeo, icoMat);
    group.add(ico);

    const wireframeMat = new THREE.MeshPhysicalMaterial({
      color: 0x8b85ff,
      emissive: 0x6c63ff,
      emissiveIntensity: 0.2,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const wireframe = new THREE.Mesh(new THREE.IcosahedronGeometry(1.05, 1), wireframeMat);
    group.add(wireframe);

    const innerGlowMat = new THREE.MeshPhysicalMaterial({
      color: 0x00d2d3,
      emissive: 0x00d2d3,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.06,
      side: THREE.BackSide,
    });
    const innerGlow = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9, 2), innerGlowMat);
    group.add(innerGlow);

    const trappedCount = 500;
    const trappedPos = new Float32Array(trappedCount * 3);
    for (let i = 0; i < trappedCount; i++) {
      const r = Math.cbrt(Math.random()) * 0.85;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      trappedPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      trappedPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      trappedPos[i * 3 + 2] = r * Math.cos(phi);
    }
    const trappedGeo = new THREE.BufferGeometry();
    trappedGeo.setAttribute("position", new THREE.BufferAttribute(trappedPos, 3));
    const trappedMat = new THREE.PointsMaterial({
      color: 0x00d2d3,
      size: 0.02,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const trapped = new THREE.Points(trappedGeo, trappedMat);
    group.add(trapped);

    const ringGroup = new THREE.Group();
    scene.add(ringGroup);
    for (let i = 0; i < 3; i++) {
      const r = new THREE.Mesh(
        new THREE.TorusGeometry(1.6 + i * 0.3, 0.008, 16, 80),
        new THREE.MeshPhysicalMaterial({
          color: i === 0 ? 0x6c63ff : i === 1 ? 0x00d2d3 : 0xff6584,
          emissive: i === 0 ? 0x6c63ff : i === 1 ? 0x00d2d3 : 0xff6584,
          emissiveIntensity: 0.2,
          transparent: true,
          opacity: 0.2 - i * 0.04,
          metalness: 0.8,
          roughness: 0.2,
        })
      );
      r.rotation.x = Math.PI / (2.5 + i * 0.3);
      r.rotation.z = i * 0.5;
      ringGroup.add(r);
    }

    const sparkleCount = 120;
    const sparklePos = new Float32Array(sparkleCount * 3);
    for (let i = 0; i < sparkleCount; i++) {
      const a = (i / sparkleCount) * Math.PI * 2;
      sparklePos[i * 3] = Math.cos(a) * 1.8;
      sparklePos[i * 3 + 1] = Math.sin(a) * 1.8 * 0.6;
      sparklePos[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
    }
    const sparkleGeo = new THREE.BufferGeometry();
    sparkleGeo.setAttribute("position", new THREE.BufferAttribute(sparklePos, 3));
    const sparkleMat = new THREE.PointsMaterial({
      color: 0xffffff, size: 0.03, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending,
    });
    const sparkles = new THREE.Points(sparkleGeo, sparkleMat);
    ringGroup.add(sparkles);

    const outerCount = 600;
    const outerPos = new Float32Array(outerCount * 3);
    const outerColors = new Float32Array(outerCount * 3);
    for (let i = 0; i < outerCount; i++) {
      const r = 4 + Math.random() * 6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      outerPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      outerPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      outerPos[i * 3 + 2] = r * Math.cos(phi);
      const hue = 0.6 + Math.random() * 0.25;
      const c = new THREE.Color().setHSL(hue, 0.8, 0.5 + Math.random() * 0.3);
      outerColors[i * 3] = c.r;
      outerColors[i * 3 + 1] = c.g;
      outerColors[i * 3 + 2] = c.b;
    }
    const outerGeo = new THREE.BufferGeometry();
    outerGeo.setAttribute("position", new THREE.BufferAttribute(outerPos, 3));
    outerGeo.setAttribute("color", new THREE.BufferAttribute(outerColors, 3));
    const outerMat = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const outerParticles = new THREE.Points(outerGeo, outerMat);
    scene.add(outerParticles);

    let mouseX = 0, mouseY = 0;
    const onMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove);

    let animId;
    const clock = new THREE.Clock();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      group.rotation.x = Math.sin(t * 0.1) * 0.1;
      group.rotation.y = t * 0.12;
      group.position.y = Math.sin(t * 0.3) * 0.1;
      wireframe.rotation.x = t * 0.05;
      wireframe.rotation.y = -t * 0.08;
      trapped.rotation.x = t * 0.02;
      trapped.rotation.y = -t * 0.03;
      ringGroup.rotation.x = Math.sin(t * 0.12) * 0.15;
      ringGroup.rotation.y = t * 0.25;
      ringGroup.rotation.z = t * 0.1;
      sparkles.rotation.y = t * 0.4;
      outerParticles.rotation.y = t * 0.008;
      outerParticles.rotation.x = t * 0.004;
      camera.position.x += (mouseX * 0.8 - camera.position.x) * 0.025;
      camera.position.y += (mouseY * 0.5 - camera.position.y) * 0.025;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0) {
          renderer.setSize(w, h);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      resizeObserver.disconnect();
      renderer.dispose();
      if (container.contains(canvas)) container.removeChild(canvas);
    };
  }, []);

  if (Platform.OS !== "web") return null;
  return <View ref={containerRef} style={StyleSheet.absoluteFill} pointerEvents="none" />;
};

export default ThreeBackground;
